import { getCurrentTenant } from "@/server/queries/tenants";
import { SettingsForm } from "@/features/settings/settings-form";
import { redirect } from "next/navigation";

export default async function ParametresPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gérez les informations de votre entreprise
        </p>
      </div>
      <SettingsForm tenant={tenant} />
    </div>
  );
}
