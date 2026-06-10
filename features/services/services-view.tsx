"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Clock, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ServiceForm } from "./service-form";
import { createService, updateService, deleteService } from "@/server/actions/services";
import type { Service } from "@/types";

function formatPrice(price: number | null) {
  if (price === null) return "Sur devis";
  return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
}

interface ServicesViewProps {
  services: Service[];
}

export function ServicesView({ services }: ServicesViewProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editService, setEditService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  async function handleCreate(formData: FormData) {
    const result = await createService(formData);
    if (result?.error) return result;
    setCreateOpen(false);
    router.refresh();
  }

  async function handleEdit(formData: FormData) {
    if (!editService) return;
    const result = await updateService(editService.id, formData);
    if (result?.error) return result;
    setEditService(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteService(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Aucun service configuré.</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              Ajouter votre premier service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{service.name}</CardTitle>
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="flex-1 pb-3">
                <div className="flex gap-4 text-sm">
                  <span className={`flex items-center gap-1 font-semibold ${service.price === null ? "text-muted-foreground italic" : "text-primary"}`}>
                    <Banknote className="h-4 w-4" />
                    {formatPrice(service.price)}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.duration}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditService(service)}
                >
                  Modifier
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteTarget(service)}
                >
                  Supprimer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modale création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau service</DialogTitle>
          </DialogHeader>
          <ServiceForm action={handleCreate} submitLabel="Créer le service" />
        </DialogContent>
      </Dialog>

      {/* Modale édition */}
      <Dialog open={!!editService} onOpenChange={(o) => !o && setEditService(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le service</DialogTitle>
          </DialogHeader>
          {editService && (
            <ServiceForm
              defaultValues={editService}
              action={handleEdit}
              submitLabel="Enregistrer"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce service ?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> sera supprimé définitivement.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
