"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AppointmentForm } from "./appointment-form";
import {
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from "@/server/actions/appointments";
import type { Customer, Service, AppointmentStatus } from "@/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig = {
  pending: { label: "En attente", variant: "secondary" as const },
  confirmed: { label: "Confirmé", variant: "default" as const },
  done: { label: "Terminé", variant: "outline" as const },
  cancelled: { label: "Annulé", variant: "destructive" as const },
};

const nextStatus: Record<AppointmentStatus, { label: string; value: AppointmentStatus } | null> = {
  pending: { label: "Confirmer", value: "confirmed" },
  confirmed: { label: "Marquer terminé", value: "done" },
  done: null,
  cancelled: null,
};

interface AppointmentRow {
  id: string;
  customerId: string;
  serviceId: string | null;
  scheduledAt: Date;
  status: AppointmentStatus;
  isUrgent: boolean;
  notes: string | null;
  customerName: string | null;
  customerPhone: string | null;
  serviceName: string | null;
}

interface AppointmentsViewProps {
  appointments: AppointmentRow[];
  customers: Customer[];
  services: Service[];
}

export function AppointmentsView({ appointments, customers, services }: AppointmentsViewProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editAppt, setEditAppt] = useState<AppointmentRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AppointmentRow | null>(null);

  async function handleCreate(formData: FormData) {
    const result = await createAppointment(formData);
    if (result?.error) return result;
    setCreateOpen(false);
    router.refresh();
  }

  async function handleEdit(formData: FormData) {
    if (!editAppt) return;
    const result = await updateAppointment(editAppt.id, formData);
    if (result?.error) return result;
    setEditAppt(null);
    router.refresh();
  }

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    await updateAppointmentStatus(id, status);
    router.refresh();
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    await cancelAppointment(cancelTarget.id);
    setCancelTarget(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau rendez-vous
        </Button>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Aucun rendez-vous pour le moment.</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              Créer votre premier rendez-vous
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {appointments.map((appt) => {
            const status = statusConfig[appt.status];
            const next = nextStatus[appt.status];

            return (
              <Card key={appt.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-center shrink-0 w-10">
                      <p className="text-lg font-bold leading-none">
                        {format(new Date(appt.scheduledAt), "dd")}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {format(new Date(appt.scheduledAt), "MMM", { locale: fr })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appt.scheduledAt), "HH:mm")}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{appt.customerName}</p>
                        {appt.isUrgent && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      {appt.serviceName && (
                        <p className="text-sm text-muted-foreground">{appt.serviceName}</p>
                      )}
                      {appt.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {appt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2 flex-wrap justify-end">
                    <Badge variant={status.variant}>{status.label}</Badge>

                    {next && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(appt.id, next.value)}
                      >
                        {next.label}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditAppt(appt)}
                    >
                      Modifier
                    </Button>

                    {appt.status !== "cancelled" && appt.status !== "done" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setCancelTarget(appt)}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modale création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            customers={customers}
            services={services}
            action={handleCreate}
            submitLabel="Créer le rendez-vous"
          />
        </DialogContent>
      </Dialog>

      {/* Modale édition */}
      <Dialog open={!!editAppt} onOpenChange={(o) => !o && setEditAppt(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le rendez-vous</DialogTitle>
          </DialogHeader>
          {editAppt && (
            <AppointmentForm
              customers={customers}
              services={services}
              defaultValues={{
                id: editAppt.id,
                tenantId: "",
                customerId: editAppt.customerId,
                serviceId: editAppt.serviceId ?? undefined,
                scheduledAt: editAppt.scheduledAt,
                status: editAppt.status,
                isUrgent: editAppt.isUrgent,
                notes: editAppt.notes ?? undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              action={handleEdit}
              submitLabel="Enregistrer"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation annulation */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler ce rendez-vous ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le rendez-vous de <strong>{cancelTarget?.customerName}</strong> du{" "}
              {cancelTarget &&
                format(new Date(cancelTarget.scheduledAt), "dd/MM/yyyy à HH:mm", {
                  locale: fr,
                })}{" "}
              sera marqué comme annulé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Annuler le rendez-vous
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
