"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customerSchema, type CustomerInput } from "./schemas";
import type { Customer } from "@/types";

interface CustomerFormProps {
  defaultValues?: Partial<Customer>;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel?: string;
}

export function CustomerForm({
  defaultValues,
  action,
  submitLabel = "Enregistrer",
}: CustomerFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      address: defaultValues?.address ?? "",
    },
  });

  async function onSubmit(data: CustomerInput) {
    setServerError(null);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.set(key, value);
    });

    const result = await action(formData);
    if (result?.error) setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Nom complet *</Label>
        <Input id="fullName" placeholder="Jean Dupont" {...register("fullName")} />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Téléphone *</Label>
        <Input id="phone" placeholder="+241 06 00 00 00" {...register("phone")} />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="client@exemple.com" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Adresse</Label>
        <Textarea id="address" placeholder="Quartier, ville..." {...register("address")} rows={2} />
        {errors.address && (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {serverError}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
