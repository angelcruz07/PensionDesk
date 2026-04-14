import { Construction } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportesPage() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <Card className="mx-auto w-full max-w-lg border-dashed shadow-sm">
        <CardHeader className="text-center">
          <div className="bg-muted mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Construction className="text-muted-foreground h-6 w-6" aria-hidden />
          </div>
          <CardTitle className="font-heading text-xl">Reportes</CardTitle>
          <CardDescription>
            Aquí podrás exportar proyecciones, comparativas y resúmenes para tus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center text-sm">
            Funcionalidad en desarrollo. La calculadora sigue disponible en la sección principal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
