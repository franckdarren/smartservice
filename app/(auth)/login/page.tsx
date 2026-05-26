import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Accédez à votre espace SmartService
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground mt-4">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Créer un compte
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
