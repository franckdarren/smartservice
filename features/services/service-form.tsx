"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { serviceSchema, type ServiceInput } from "./schemas";
import type { Service } from "@/types";

interface ServiceFormProps {
  defaultValues?: Partial<Service>;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel?: string;
}

export function ServiceForm({
  defaultValues,
  action,
  submitLabel = "Enregistrer",
}: ServiceFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [surDevis, setSurDevis] = useState(defaultValues?.price == null && defaultValues !== undefined ? true : false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      price: defaultValues?.price ?? undefined,
      duration: defaultValues?.duration ?? "",
    },
  });

  async function onSubmit(data: ServiceInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("duration", data.duration);
    if (!surDevis && data.price != null) {
      formData.set("price", String(data.price));
    } else {
      formData.set("price", "");
    }
    if (data.description) formData.set("description", data.description);

    const result = await action(formData);
    if (result?.error) setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nom du service *</Label>
        <Input id="name" placeholder="Plomberie, électricité..." {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description du service..."
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">
            Prix (FCFA) *
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            placeholder="15000"
            {...register("price", { valueAsNumber: true, disabled: surDevis })}
          />
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="sur-devis"
              checked={surDevis}
              onChange={(e) => setSurDevis(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="sur-devis" className="text-sm text-muted-foreground cursor-pointer">
              Sur devis
            </label>
          </div>
          {errors.price && !surDevis && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="duration">Durée *</Label>
          <Input
            id="duration"
            type="text"
            placeholder="ex: 45 min, 2h, 3 mois"
            {...register("duration")}
          />
          {errors.duration && (
            <p className="text-sm text-destructive">{errors.duration.message}</p>
          )}
        </div>
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
