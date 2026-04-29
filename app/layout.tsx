import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pensión 360 · Suite IMSS",
  description:
    "Panel para estimar pensión, Modalidad 40 y futuros módulos para tu práctica.",
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
