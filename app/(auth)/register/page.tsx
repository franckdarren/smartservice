import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/features/auth/register-form";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Créer votre compte</CardTitle>
        <CardDescription>
          Rejoignez SmartService et gérez votre activité
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
