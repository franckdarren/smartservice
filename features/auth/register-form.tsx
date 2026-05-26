"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "./schemas";
import { registerTenant } from "./actions";

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  function handleCompanyChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slug = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValue("slug", slug);
  }

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.set(key, value));

    const result = await registerTenant(formData);
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nom complet</Label>
        <Input id="fullName" placeholder="Jean Dupont" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="vous@exemple.com" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
        <Input
          id="companyName"
          placeholder="Plomberie Kouassi"
          {...register("companyName")}
          onChange={(e) => {
            register("companyName").onChange(e);
            handleCompanyChange(e);
          }}
        />
        {errors.companyName && (
          <p className="text-sm text-destructive">{errors.companyName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Adresse publique (slug)</Label>
        <div className="flex items-center gap-1">
          <Input id="slug" placeholder="plomberie-kouassi" {...register("slug")} />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            .smartservice.ga
          </span>
        </div>
        {errors.slug && (
          <p className="text-sm text-destructive">{errors.slug.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Création en cours..." : "Créer mon compte"}
      </Button>
    </form>
  );
}
