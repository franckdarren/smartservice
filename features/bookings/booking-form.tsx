"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { publicBookingSchema, type PublicBookingInput } from "./schemas";
import type { Service } from "@/types";
import { createPublicBooking } from "@/server/actions/bookings";

interface BookingFormProps {
  slug: string;
  services: Service[];
}

export function BookingForm({ slug, services }: BookingFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PublicBookingInput>({
    resolver: zodResolver(publicBookingSchema),
  });

  async function onSubmit(data: PublicBookingInput) {
    setServerError(null);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.set(key, value as string);
    });
    formData.set("serviceId", selectedService);

    const actionWithSlug = createPublicBooking.bind(null, slug);
    const result = await actionWithSlug(formData);
    if (result?.error) setServerError(result.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="vous@exemple.com" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {services.length > 0 && (
        <div className="space-y-1.5">
          <Label>Service souhaité</Label>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un service (optionnel)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Aucun service spécifique</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} — {new Intl.NumberFormat("fr-FR").format(s.price)} FCFA
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="preferredDate">Date souhaitée *</Label>
          <Input id="preferredDate" type="date" {...register("preferredDate")} />
          {errors.preferredDate && (
            <p className="text-sm text-destructive">{errors.preferredDate.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferredTime">Heure souhaitée *</Label>
          <Input id="preferredTime" type="time" {...register("preferredTime")} />
          {errors.preferredTime && (
            <p className="text-sm text-destructive">{errors.preferredTime.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Décrivez votre besoin..."
          rows={3}
          {...register("message")}
        />
      </div>

      {serverError && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {serverError}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Envoi en cours..." : "Demander un rendez-vous"}
      </Button>
    </form>
  );
}
