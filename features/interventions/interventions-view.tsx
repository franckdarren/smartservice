"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, ClipboardList, ImageIcon, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InterventionForm } from "./intervention-form";
import { createIntervention } from "@/server/actions/interventions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InterventionRow {
  id: string;
  appointmentId: string;
  notes: string | null;
  photosBefore: string[] | null;
  photosAfter: string[] | null;
  customerName: string | null;
  customerPhone: string | null;
  serviceName: string | null;
  scheduledAt: Date | null;
  technicianName: string | null;
  createdAt: Date;
}

interface AppointmentOption {
  id: string;
  customerName: string | null;
  serviceName: string | null;
  scheduledAt: Date;
}

interface InterventionsViewProps {
  interventions: InterventionRow[];
  appointments: AppointmentOption[];
}

export function InterventionsView({ interventions, appointments }: InterventionsViewProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const filtered = interventions.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.customerName?.toLowerCase().includes(q) ||
      i.serviceName?.toLowerCase().includes(q) ||
      i.technicianName?.toLowerCase().includes(q)
    );
  });

  async function handleCreate(formData: FormData) {
    const result = await createIntervention(formData);
    if (result?.error) return result;
    setOpen(false);
    toast.success("Intervention créée");
    if (result?.id) router.push(`/dashboard/interventions/${result.id}`);
    return result;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle intervention
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Créer une intervention</DialogTitle>
            </DialogHeader>
            <InterventionForm
              appointments={appointments}
              action={handleCreate}
              submitLabel="Créer"
            />
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {search ? "Aucun résultat" : "Aucune intervention pour l'instant"}
          </p>
          {!search && (
            <p className="text-xs mt-1">
              Les interventions sont liées aux RDV terminés
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((intervention) => (
            <Link
              key={intervention.id}
              href={`/dashboard/interventions/${intervention.id}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">
                          {intervention.customerName ?? "Client inconnu"}
                        </p>
                        {intervention.serviceName && (
                          <Badge variant="secondary" className="shrink-0">
                            {intervention.serviceName}
                          </Badge>
                        )}
                      </div>

                      {intervention.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {intervention.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {intervention.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(intervention.scheduledAt), "dd/MM/yyyy", { locale: fr })}
                          </span>
                        )}
                        {intervention.technicianName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {intervention.technicianName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {((intervention.photosBefore?.length ?? 0) +
                        (intervention.photosAfter?.length ?? 0)) > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ImageIcon className="h-3.5 w-3.5" />
                          {(intervention.photosBefore?.length ?? 0) +
                            (intervention.photosAfter?.length ?? 0)}{" "}
                          photo(s)
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
