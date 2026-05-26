import { redirect } from "next/navigation";
import { getCurrentTenant, getCurrentUser } from "@/server/queries/tenants";
import { getInvoices } from "@/server/queries/invoices";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { InvoicesView } from "@/features/invoices/invoices-view";

export default async function FacturesPage() {
  const [tenant, user] = await Promise.all([getCurrentTenant(), getCurrentUser()]);
  if (!tenant || !user) redirect("/login");

  const invoicesList = await getInvoices(tenant.id);

  return (
    <div className="flex flex-col flex-1">
      <DashboardHeader
        tenant={tenant}
        user={user}
        title="Factures"
        subtitle={`${invoicesList.length} facture${invoicesList.length > 1 ? "s" : ""}`}
      />
      <div className="p-6 flex-1">
        <InvoicesView invoices={invoicesList} />
      </div>
    </div>
  );
}
