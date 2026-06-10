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
import { appointmentFormSchema, type AppointmentFormInput } from "./schemas";
import type { Customer, Service, Appointment, AppointmentStatus } from "@/types";
import { format } from "date-fns";

interface AppointmentFormProps {
  customers: Customer[];
  services: Service[];
  defaultValues?: Partial<Appointment>;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  submitLabel?: string;
}

export function AppointmentForm({
  customers,
  services,
  defaultValues,
  action,
  submitLabel = "Enregistrer",
}: AppointmentFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(defaultValues?.isUrgent ?? false);
  const [selectedCustomer, setSelectedCustomer] = useState(defaultValues?.customerId ?? "");
  const [selectedService, setSelectedService] = useState(defaultValues?.serviceId ?? "");
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(defaultValues?.status ?? "pending");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormInput>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      scheduledAt: defaultValues?.scheduledAt
        ? format(new Date(defaultValues.scheduledAt), "yyyy-MM-dd'T'HH:mm")
        : "",
      notes: defaultValues?.notes ?? "",
    },
  });

  async function onSubmit(data: AppointmentFormInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("customerId", selectedCustomer);
    formData.set("serviceId", selectedService);
    formData.set("scheduledAt", data.scheduledAt);
    formData.set("status", selectedStatus);
    formData.set("isUrgent", String(isUrgent));
    if (data.notes) formData.set("notes", data.notes);

    const result = await action(formData);
    if (result?.error) setServerError(result.error);
  }

  const statusOptions = [
    { value: "pending", label: "En attente" },
    { value: "confirmed", label: "Confirmé" },
    { value: "done", label: "Terminé" },
    { value: "cancelled", label: "Annulé" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-1.5">
        <Label>Client *</Label>
        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.fullName} — {c.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selectedCustomer && (
          <p className="text-sm text-destructive hidden" aria-hidden />
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Service</Label>
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un service (optionnel)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Aucun</SelectItem>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}{s.price !== null ? ` — ${new Intl.NumberFormat("fr-FR").format(s.price)} FCFA` : " — Sur devis"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="scheduledAt">Date et heure *</Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          {...register("scheduledAt")}
        />
        {errors.scheduledAt && (
          <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Statut</Label>
        <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as AppointmentStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isUrgent"
          checked={isUrgent}
          onChange={(e) => setIsUrgent(e.target.checked)}
          className="h-4 w-4 accent-destructive"
        />
        <Label htmlFor="isUrgent" className="text-destructive font-medium cursor-pointer">
          Marquer comme urgent
        </Label>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Informations complémentaires..."
          rows={3}
          {...register("notes")}
        />
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
