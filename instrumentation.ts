/**
 * Next.js sunucu başlarken bir kez çalışır.
 * Yalnızca 3 otomasyon aktif:
 *   1. Randevu hatırlatması
 *   2. Su hatırlatması
 *   3. Ödeme gecikti (manuel tetikleme ile)
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const cron = await import("node-cron")

  const { randevuHatirlatma, suHatirlatma } = await import("./lib/automation-engine")

  const { sequenceAdimlariniCalistir, aktiviteDususTara, paketBitiyorTara } =
    await import("./lib/sequence-runner")

  console.log("[Otomasyon] Cron job'lar başlatılıyor...")

  // ── 1. Randevu Hatırlatması ───────────────────────────────────────────────
  // Her gün 20:00 → yarınki randevular için bildirim (yalnızca kayıtlı danışanlar)
  cron.schedule("0 20 * * *", () => {
    randevuHatirlatma().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // ── 2. Su Hatırlatması ────────────────────────────────────────────────────
  // Her gün 09:00, 12:00, 15:00, 18:00 (yalnızca kayıtlı aktif danışanlar)
  cron.schedule("0 9,12,15,18 * * *", () => {
    suHatirlatma().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // ── Sequence Engine (görev ve alarm oluşturma — mesaj yok) ───────────────
  cron.schedule("30 8 * * *", () => {
    sequenceAdimlariniCalistir().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  cron.schedule("0 8 * * *", () => {
    aktiviteDususTara().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  cron.schedule("0 9 * * *", () => {
    paketBitiyorTara().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  console.log("[Otomasyon] ✓ Cron job'lar aktif.")
  console.log("  • Randevu hatırlatma: Her gün 20:00")
  console.log("  • Su hatırlatma: 09:00, 12:00, 15:00, 18:00")
  console.log("  • Ödeme gecikti: Manuel tetikleme (danisan sayfasından)")
}
