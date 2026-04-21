import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  // Raíz explícita del app: evita que Turbopack elija un lockfile en un directorio padre.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
