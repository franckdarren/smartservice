import { notFound, redirect } from "next/navigation";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { getInvoiceById } from "@/server/queries/invoices";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { InvoiceDetailView } from "@/features/invoices/invoice-detail-view";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);
  if (!tenant || !user) redirect("/login");

  const invoice = await getInvoiceById(tenant.id, id);
  if (!invoice) notFound();

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        tenant={tenant}
        user={user}
        title="Détail facture"
        subtitle={`${invoice.customerName ?? "Client"} — ${new Intl.NumberFormat("fr-FR").format(invoice.amount)} FCFA`}
      />
      <div className="p-6 flex-1">
        <InvoiceDetailView invoice={invoice} tenant={tenant} />
      </div>
    </div>
  );
}
