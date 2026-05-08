import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Baileys ve bağımlılıkları sunucu tarafında native olarak çalıştır, bundle'a dahil etme
  serverExternalPackages: ["@whiskeysockets/baileys", "jimp", "sharp"],
};

export default nextConfig;
