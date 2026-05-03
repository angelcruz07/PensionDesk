"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { AppLogo } from "@/components/app-logo";
import { Calculator, LayoutDashboard, Settings } from "lucide-react";

const workspaceItems = [
  {
    title: "Simulación Modalidad 40",
    href: "/calculadora",
    icon: Calculator,
    tooltip: "Motor de estimación y escenarios IMSS",
  },
];

const accountItem = {
  title: "Cuenta y preferencias",
  href: "/configuracion",
  icon: Settings,
  tooltip: "Perfil, suscripción y seguridad",
};

/* Cartera / informes en vista previa — descomentar al activar rutas y UI.
 * Restaurar imports: Badge desde @/components/ui/badge; Users, BarChart3 desde lucide-react.
const managementItems = [
  {
    title: "Cartera de clientes",
    href: "/clientes",
    icon: Users,
    tooltip: "Expedientes y seguimiento de asesoría",
  },
  {
    title: "Centro de informes",
    href: "/reportes",
    icon: BarChart3,
    tooltip: "Reportes, exportación y analítica operativa",
  },
];
*/

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border/80 pb-3">
        <Link
          href="/calculadora"
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent/80 focus-visible:ring-2"
        >
          <AppLogo size={36} decorative priority className="h-9 w-9 rounded-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold leading-none tracking-tight">
              Pensión 360
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              Plataforma para asesores IMSS
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground px-2 text-[11px] font-medium tracking-wide">
            Área de trabajo
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.tooltip}
                    render={
                      <Link
                        href={item.href}
                        className="flex w-full items-center gap-2"
                      />
                    }
                  >
                    <item.icon className="shrink-0" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestión y analítica (vista previa): ver bloque managementItems arriba
        <SidebarSeparator className="mx-0" />
        <SidebarGroup>...</SidebarGroup>
        */}

        <div className="mt-auto">
          <SidebarSeparator className="mx-0" />
          <SidebarGroup className="pb-0">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname === accountItem.href}
                    tooltip={accountItem.tooltip}
                    render={
                      <Link
                        href={accountItem.href}
                        className="flex w-full items-center gap-2"
                      />
                    }
                  >
                    <accountItem.icon className="shrink-0" />
                    <span>{accountItem.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80">
        <div className="text-muted-foreground flex items-center gap-2 px-2 py-1 text-xs group-data-[collapsible=icon]:hidden">
          <LayoutDashboard className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="leading-snug">Entorno profesional · 2026</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
