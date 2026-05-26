"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CustomerForm } from "./customer-form";
import { createCustomer, updateCustomer, deleteCustomer } from "@/server/actions/customers";
import type { Customer } from "@/types";

interface CustomersViewProps {
  customers: Customer[];
}

export function CustomersView({ customers }: CustomersViewProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  async function handleCreate(formData: FormData) {
    const result = await createCustomer(formData);
    if (result?.error) return result;
    setCreateOpen(false);
    router.refresh();
  }

  async function handleEdit(formData: FormData) {
    if (!editCustomer) return;
    const result = await updateCustomer(editCustomer.id, formData);
    if (result?.error) return result;
    setEditCustomer(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteCustomer(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Aucun client pour le moment.</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              Ajouter votre premier client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Adresse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.fullName}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {customer.phone}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {customer.email ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {customer.email}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {customer.address ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/clients/${customer.id}`}>Voir</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditCustomer(customer)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(customer)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Modale création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
          </DialogHeader>
          <CustomerForm action={handleCreate} submitLabel="Créer le client" />
        </DialogContent>
      </Dialog>

      {/* Modale édition */}
      <Dialog open={!!editCustomer} onOpenChange={(o) => !o && setEditCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          {editCustomer && (
            <CustomerForm
              defaultValues={editCustomer}
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
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.fullName}</strong> sera supprimé définitivement.
              Ses rendez-vous seront également supprimés. Cette action est irréversible.
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
