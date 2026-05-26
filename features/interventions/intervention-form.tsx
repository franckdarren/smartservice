"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { interventionSchema, type InterventionInput } from "./schemas";
import { uploadInterventionPhoto } from "@/server/actions/interventions";
import { toast } from "sonner";
import { Upload, X, ImageIcon } from "lucide-react";

interface AppointmentOption {
  id: string;
  customerName: string | null;
  serviceName: string | null;
  scheduledAt: Date;
}

interface InterventionFormProps {
  appointments: AppointmentOption[];
  defaultAppointmentId?: string;
  defaultValues?: { notes?: string | null; technicianId?: string | null };
  interventionId?: string;
  action: (formData: FormData) => Promise<{ error?: string; id?: string } | void>;
  submitLabel?: string;
}

export function InterventionForm({
  appointments,
  defaultAppointmentId,
  defaultValues,
  interventionId,
  action,
  submitLabel = "Enregistrer",
}: InterventionFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const fileBeforeRef = useRef<HTMLInputElement>(null);
  const fileAfterRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InterventionInput>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      appointmentId: defaultAppointmentId ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  const selectedAppointmentId = watch("appointmentId");

  async function onSubmit(data: InterventionInput) {
    setServerError(null);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.set(key, value);
    });

    const result = await action(formData);
    if (result?.error) setServerError(result.error);
  }

  async function handlePhotoUpload(files: FileList | null, phase: "before" | "after") {
    if (!files || files.length === 0) return;
    if (!interventionId) {
      toast.error("Enregistrez d'abord l'intervention avant d'ajouter des photos");
      return;
    }

    const setter = phase === "before" ? setUploadingBefore : setUploadingAfter;
    setter(true);

    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("photo", file);
        const result = await uploadInterventionPhoto(interventionId, fd, phase);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Photo ajoutée");
        }
      }
    } finally {
      setter(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div className="space-y-1.5">
        <Label>Rendez-vous *</Label>
        <Select
          value={selectedAppointmentId}
          onValueChange={(val) => setValue("appointmentId", val)}
          disabled={!!defaultAppointmentId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un RDV" />
          </SelectTrigger>
          <SelectContent>
            {appointments.map((appt) => (
              <SelectItem key={appt.id} value={appt.id}>
                {appt.customerName} — {appt.serviceName ?? "Sans service"} (
                {new Date(appt.scheduledAt).toLocaleDateString("fr-FR")})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.appointmentId && (
          <p className="text-sm text-destructive">{errors.appointmentId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes du technicien</Label>
        <Textarea
          id="notes"
          placeholder="Description du travail effectué, observations..."
          rows={4}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {interventionId && (
        <>
          <div className="space-y-2">
            <Label>Photos avant</Label>
            <input
              ref={fileBeforeRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoUpload(e.target.files, "before")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileBeforeRef.current?.click()}
              disabled={uploadingBefore}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadingBefore ? "Envoi en cours..." : "Ajouter des photos"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Photos après</Label>
            <input
              ref={fileAfterRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoUpload(e.target.files, "after")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileAfterRef.current?.click()}
              disabled={uploadingAfter}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadingAfter ? "Envoi en cours..." : "Ajouter des photos"}
            </Button>
          </div>
        </>
      )}

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
