"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Check, Send } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { markInvoiceSent } from "@/server/actions/invoices";
import { toast } from "sonner";
import { PaymentModal } from "@/features/invoices/payment-modal";
import type { InvoiceStatus, PaymentMethod } from "@/types";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Espèces",
  airtel_money: "Airtel Money",
  moov_money: "Moov Money",
  virement: "Virement",
  cheque: "Chèque",
};

interface InvoiceRow {
  id: string;
  amount: number;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod | null;
  paidAt: Date | null;
  paymentReference: string | null;
  pdfUrl: string | null;
  createdAt: Date;
  customerName: string | null;
  customerPhone: string | null;
  serviceName: string | null;
  scheduledAt: Date | null;
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; class: string }> = {
  draft: { label: "Brouillon", class: "bg-secondary/20 text-secondary-foreground" },
  sent: { label: "Envoyée", class: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Payée", class: "bg-green-100 text-green-700" },
};

interface InvoicesViewProps {
  invoices: InvoiceRow[];
}

export function InvoicesView({ invoices }: InvoicesViewProps) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [paymentModalId, setPaymentModalId] = useState<string | null>(null);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (
      inv.customerName?.toLowerCase().includes(q) ||
      inv.serviceName?.toLowerCase().includes(q)
    );
  });

  async function handleMarkSent(e: React.MouseEvent, id: string) {
    e.preventDefault();
    setLoadingId(id);
    const result = await markInvoiceSent(id);
    setLoadingId(null);
    if (result?.error) toast.error(result.error);
    else toast.success("Facture marquée comme envoyée");
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
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {search ? "Aucun résultat" : "Aucune facture pour l'instant"}
          </p>
          {!search && (
            <p className="text-xs mt-1">
              Les factures sont générées automatiquement à la clôture d'un RDV
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((invoice) => {
            const cfg = STATUS_CONFIG[invoice.status];
            return (
              <Link key={invoice.id} href={`/dashboard/factures/${invoice.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium truncate">
                            {invoice.customerName ?? "Client inconnu"}
                          </p>
                          <Badge
                            className={cn("text-xs shrink-0", cfg.class)}
                            variant="outline"
                          >
                            {cfg.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {invoice.serviceName ?? "Prestation"} ·{" "}
                          {format(new Date(invoice.createdAt), "dd/MM/yyyy", { locale: fr })}
                        </p>
                        {invoice.status === "paid" && invoice.paymentMethod && (
                          <p className="text-xs text-green-600 mt-0.5">
                            {PAYMENT_METHOD_LABELS[invoice.paymentMethod]}
                            {invoice.paidAt &&
                              ` · ${format(new Date(invoice.paidAt), "dd/MM/yyyy", { locale: fr })}`}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <p className="font-semibold text-primary">
                          {new Intl.NumberFormat("fr-FR").format(invoice.amount)} FCFA
                        </p>

                        {invoice.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleMarkSent(e, invoice.id)}
                            disabled={loadingId === invoice.id}
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Envoyer
                          </Button>
                        )}
                        {invoice.status === "sent" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              setPaymentModalId(invoice.id);
                            }}
                            disabled={loadingId === invoice.id}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Payée
                          </Button>
                        )}
                        {invoice.pdfUrl && (
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button size="sm" variant="ghost">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {paymentModalId && (
        <PaymentModal
          invoiceId={paymentModalId}
          open={true}
          onClose={() => setPaymentModalId(null)}
        />
      )}
    </div>
  );
}
