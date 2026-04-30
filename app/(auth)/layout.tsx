import Link from "next/link";
import { AppLogo } from "@/components/app-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/40 flex min-h-svh w-full flex-col items-center justify-center gap-8 p-6 md:p-10">
      <Link
        href="/"
        className="flex flex-col items-center gap-2 outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
      >
        <AppLogo size={72} priority decorative className="max-h-[5.5rem] w-auto" />
        <span className="font-heading text-lg font-semibold tracking-tight">Pensión 360</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
