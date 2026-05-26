"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { tenants, users } from "@/lib/drizzle/schema";
import { registerSchema, loginSchema } from "./schemas";
import { eq } from "drizzle-orm";

export async function registerTenant(formData: FormData) {
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    companyName: formData.get("companyName") as string,
    slug: formData.get("slug") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { fullName, email, password, companyName, slug } = parsed.data;

  // Vérifier que le slug est disponible
  const existing = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return { error: "Ce slug est déjà pris. Choisissez-en un autre." };
  }

  // Créer l'utilisateur Supabase Auth
  const supabase = await createServiceClient();
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return { error: authError?.message ?? "Erreur lors de la création du compte" };
  }

  // Créer le tenant et l'utilisateur en DB
  const [tenant] = await db
    .insert(tenants)
    .values({ name: companyName, slug })
    .returning();

  await db.insert(users).values({
    id: authData.user.id,
    tenantId: tenant.id,
    email,
    fullName,
    role: "admin",
  });

  // Connecter l'utilisateur
  const browserSupabase = await createClient();
  await browserSupabase.auth.signInWithPassword({ email, password });

  redirect("/dashboard");
}

export async function loginUser(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email ou mot de passe incorrect" };
  }

  redirect("/dashboard");
}

export async function logoutUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
