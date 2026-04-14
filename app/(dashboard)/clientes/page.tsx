import { Construction } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ClientesPage() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <Card className="mx-auto w-full max-w-lg border-dashed shadow-sm">
        <CardHeader className="text-center">
          <div className="bg-muted mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Construction className="text-muted-foreground h-6 w-6" aria-hidden />
          </div>
          <CardTitle className="font-heading text-xl">Clientes</CardTitle>
          <CardDescription>
            Este módulo forma parte del roadmap del producto: historial de asesorados,
            documentos y seguimiento de trámites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center text-sm">
            Vuelve pronto o usa la calculadora desde el menú lateral.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
