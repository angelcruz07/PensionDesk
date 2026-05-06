import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

/** Favicon y Apple touch: `public/Logo.png` (mismo archivo que sidebar / componente AppLogo). */
export const metadata: Metadata = {
  title: "Pensión 360 · Suite IMSS",
  description:
    "Panel para estimar pensión, Modalidad 40 y futuros módulos para tu práctica.",
  icons: {
    icon: [{ url: "/Logo.png", type: "image/png" }],
    apple: [{ url: "/Logo.png", type: "image/png", sizes: "180x180" }],
    shortcut: "/Logo.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`light ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className={`${GeistSans.className} min-h-full flex flex-col`}>
        <TooltipProvider delay={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
