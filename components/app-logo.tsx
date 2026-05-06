import Image from "next/image";
import { cn } from "@/lib/utils";

type AppLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  /** Junto a texto visible “Pensión 360”: evita duplicar lectura en lectores de pantalla */
  decorative?: boolean;
};

export function AppLogo({
  size = 40,
  className,
  priority,
  decorative = false,
}: AppLogoProps) {
  return (
    <Image
      src="/Logo.png"
      alt={decorative ? "" : "Pensión 360"}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority={priority}
      {...(decorative ? { "aria-hidden": true as const } : {})}
    />
  );
}
