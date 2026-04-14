"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SignOutButton } from "./sign-out-button";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-x-hidden">
        <header className="bg-background/95 sticky top-0 z-30 flex h-12 shrink-0 items-center gap-3 border-b border-border/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:h-14 md:px-6">
          <SidebarTrigger className="-ml-0.5" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <p className="text-muted-foreground hidden min-w-0 flex-1 text-sm font-medium sm:block">
            Espacio de trabajo
          </p>
          <SignOutButton />
        </header>
        <div className="bg-muted/30 flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
