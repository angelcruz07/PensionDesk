"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function OnboardingSignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    setPending(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => void handleSignOut()}>
      <LogOut className="mr-1 h-4 w-4" aria-hidden />
      {pending ? "Cerrando sesión…" : "Cerrar sesión"}
    </Button>
  );
}
