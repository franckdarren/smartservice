"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { updateCustomer, deleteCustomer } from "@/server/actions/customers";
import type { Customer } from "@/types";

interface CustomerDetailActionsProps {
  customer: Customer;
}

export function CustomerDetailActions({ customer }: CustomerDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleEdit(formData: FormData) {
    const result = await updateCustomer(customer.id, formData);
    if (result?.error) return result;
    setEditOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    await deleteCustomer(customer.id);
    router.push("/dashboard/clients");
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          Modifier
        </Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          Supprimer
        </Button>
      </div>

      {/* Modale édition */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          <CustomerForm
            defaultValues={customer}
            action={handleEdit}
            submitLabel="Enregistrer"
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{customer.fullName}</strong> sera supprimé définitivement.
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
