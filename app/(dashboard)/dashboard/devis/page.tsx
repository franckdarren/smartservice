import { DevisForm } from "@/features/devis/devis-form";

export default function DevisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Génération de devis IA</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Décrivez le besoin client et obtenez un devis structuré en quelques secondes
        </p>
      </div>
      <DevisForm />
    </div>
  );
}
