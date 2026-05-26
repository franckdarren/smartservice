import { db } from "@/lib/drizzle";
import { tenants, users } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function getCurrentTenant() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [userRecord] = await db
    .select({ tenantId: users.tenantId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!userRecord) return null;

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, userRecord.tenantId))
    .limit(1);

  return tenant ?? null;
}

export async function getTenantBySlug(slug: string) {
  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.slug, slug))
    .limit(1);

  return tenant ?? null;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [userRecord] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return userRecord ?? null;
}

export async function getTenantSlugFromHeader() {
  const headersList = await headers();
  return headersList.get("x-tenant-slug");
}
