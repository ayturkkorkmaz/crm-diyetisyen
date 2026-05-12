import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker için standalone build
  output: "standalone",
  // Baileys ve bağımlılıkları sunucu tarafında native olarak çalıştır, bundle'a dahil etme
  serverExternalPackages: ["@whiskeysockets/baileys", "jimp", "sharp"],
};

export default nextConfig;
