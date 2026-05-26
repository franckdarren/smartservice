"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileText,
  Loader2,
  Check,
  Send,
  User,
  Calendar,
  Wrench,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  markInvoiceSent,
  generateInvoicePdf,
} from "@/server/actions/invoices";
import { toast } from "sonner";
import { PaymentModal } from "@/features/invoices/payment-modal";
import type { InvoiceStatus, PaymentMethod, Tenant } from "@/types";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Espèces",
  airtel_money: "Airtel Money",
  moov_money: "Moov Money",
  virement: "Virement bancaire",
  cheque: "Chèque",
};

interface InvoiceDetailViewProps {
  invoice: {
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
    customerEmail: string | null;
    customerAddress: string | null;
    serviceName: string | null;
    serviceDescription: string | null;
    scheduledAt: Date | null;
  };
  tenant: Tenant;
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; class: string }> = {
  draft: { label: "Brouillon", class: "bg-secondary/20 text-secondary-foreground" },
  sent: { label: "Envoyée", class: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Payée", class: "bg-green-100 text-green-700" },
};

export function InvoiceDetailView({ invoice, tenant }: InvoiceDetailViewProps) {
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(invoice.pdfUrl);
  const [status, setStatus] = useState<InvoiceStatus>(invoice.status);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    method: PaymentMethod | null;
    paidAt: Date | null;
    reference: string | null;
  }>({
    method: invoice.paymentMethod,
    paidAt: invoice.paidAt,
    reference: invoice.paymentReference,
  });

  const cfg = STATUS_CONFIG[status];
  const invoiceNumber = `FAC-${invoice.id.substring(0, 8).toUpperCase()}`;

  async function handleGeneratePdf() {
    setGenerating(true);
    const result = await generateInvoicePdf(invoice.id);
    setGenerating(false);
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.url) {
      setPdfUrl(result.url);
      toast.success("PDF généré");
    }
  }

  async function handleMarkSent() {
    const result = await markInvoiceSent(invoice.id);
    if (result?.error) toast.error(result.error);
    else {
      setStatus("sent");
      toast.success("Facture marquée comme envoyée");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* En-tête */}
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{invoiceNumber}</h2>
                <Badge className={cn("text-xs", cfg.class)} variant="outline">
                  {cfg.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Créée le {format(new Date(invoice.createdAt), "dd MMMM yyyy", { locale: fr })}
              </p>
            </div>
            <p className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat("fr-FR").format(invoice.amount)} FCFA
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="font-medium">{invoice.customerName ?? "—"}</p>
              {invoice.customerPhone && (
                <p className="text-sm text-muted-foreground">{invoice.customerPhone}</p>
              )}
              {invoice.customerEmail && (
                <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
              )}
              {invoice.customerAddress && (
                <p className="text-sm text-muted-foreground">{invoice.customerAddress}</p>
              )}
            </div>
          </div>

          {invoice.serviceName && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Service</p>
                  <p className="font-medium">{invoice.serviceName}</p>
                  {invoice.serviceDescription && (
                    <p className="text-sm text-muted-foreground">{invoice.serviceDescription}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {invoice.scheduledAt && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date d'intervention</p>
                  <p className="font-medium">
                    {format(new Date(invoice.scheduledAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>
            </>
          )}

          {status === "paid" && paymentInfo.method && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <CreditCard className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Paiement reçu</p>
                  <p className="font-medium text-green-700">
                    {PAYMENT_METHOD_LABELS[paymentInfo.method]}
                  </p>
                  {paymentInfo.paidAt && (
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(paymentInfo.paidAt), "dd MMMM yyyy", { locale: fr })}
                    </p>
                  )}
                  {paymentInfo.reference && (
                    <p className="text-sm text-muted-foreground">Réf : {paymentInfo.reference}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleGeneratePdf}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {generating ? "Génération..." : pdfUrl ? "Régénérer le PDF" : "Générer le PDF"}
        </Button>

        {pdfUrl && (
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le PDF
            </Button>
          </a>
        )}

        {status === "draft" && (
          <Button variant="outline" onClick={handleMarkSent}>
            <Send className="h-4 w-4 mr-2" />
            Marquer comme envoyée
          </Button>
        )}

        {status === "sent" && (
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setPaymentModalOpen(true)}
          >
            <Check className="h-4 w-4 mr-2" />
            Enregistrer le paiement
          </Button>
        )}
      </div>

      <PaymentModal
        invoiceId={invoice.id}
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={() => {
          setStatus("paid");
        }}
      />
    </div>
  );
}
