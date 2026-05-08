/**
 * Next.js sunucu başlarken bir kez çalışır.
 * Cron job'ları burada kaydediyoruz.
 */

export async function register() {
  // Sadece Node.js runtime'da çalış (Edge'de değil)
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  const cron = await import("node-cron")

  const {
    randevuHatirlatma,
    randevuBugunHatirlatma,
    motivasyonGonder,
    suHatirlatma,
    tartiGunuHatirlatma,
    gunlukOzetGonder,
    randevuSonrasiFollowup,
    olcumHatirlatmaFollowup,
    hareketsizDanisanFollowup,
    randevuYokFollowup,
  } = await import("./lib/automation-engine")

  const { sequenceAdimlariniCalistir, aktiviteDususTara, paketBitiyorTara } =
    await import("./lib/sequence-runner")

  console.log("[Otomasyon] Cron job'lar başlatılıyor... (Türkiye saati)")

  // ── Randevu Hatırlatma ────────────────────────────────────────────────────
  // Her gün sabah 09:00 → yarınki randevular için bildirim
  cron.schedule("0 9 * * *", () => {
    randevuHatirlatma().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // Her gün akşam 20:00 → yarınki randevular için 2. bildirim
  cron.schedule("0 20 * * *", () => {
    randevuHatirlatma().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // Her saat başı → bugünkü randevulara 1 saat kala bildirim
  cron.schedule("0 * * * *", () => {
    randevuBugunHatirlatma().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // ── Haftalık Motivasyon ───────────────────────────────────────────────────
  // Her Pazartesi 08:30 → tüm aktif danışanlara motivasyon
  cron.schedule("30 8 * * 1", () => {
    motivasyonGonder().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // ── Tartı Günü ────────────────────────────────────────────────────────────
  // Her Pazartesi 07:00 → tartı hatırlatması
  cron.schedule("0 7 * * 1", () => {
    tartiGunuHatirlatma().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // ── Su Hatırlatma ─────────────────────────────────────────────────────────
  // Her gün 09:00, 12:00, 15:00, 18:00
  cron.schedule("0 9,12,15,18 * * *", () => {
    suHatirlatma().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // ── Günlük Özet (Diyetisyene) ─────────────────────────────────────────────
  // Her sabah 08:30 — kendi numaranıza bugünkü randevular + özet
  const adminTelefon = process.env.ADMIN_TELEFON
  if (adminTelefon) {
    cron.schedule("30 8 * * *", () => {
      gunlukOzetGonder(adminTelefon).catch(console.error)
    }, { timezone: "Europe/Istanbul" })
    console.log(`  • Günlük özet: Her sabah 08:30 → ${adminTelefon}`)
  } else {
    console.log("  • Günlük özet: ADMIN_TELEFON env değişkeni ayarlanmamış, atlanıyor.")
  }

  // ── Follow-up Otomasyonları ───────────────────────────────────────────────
  // Her gün 10:00 → dün tamamlanan randevu sonrası follow-up
  cron.schedule("0 10 * * *", () => {
    randevuSonrasiFollowup().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // Her Perşembe 09:00 → 7+ gün ölçüm girmeyen danışanlara hatırlatma
  cron.schedule("0 9 * * 4", () => {
    olcumHatirlatmaFollowup().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // Her Pazartesi 11:00 → 7+ gün aktivitesiz danışanlara "sizi özledik"
  cron.schedule("0 11 * * 1", () => {
    hareketsizDanisanFollowup().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // Her Pazar 18:00 → 30+ gün randevusu olmayan danışanlara yeni randevu önerisi
  cron.schedule("0 18 * * 0", () => {
    randevuYokFollowup().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // ── Akıllı Sequence Engine ────────────────────────────────────────────────
  // Her gün 08:30 → bekleyen sequence adımlarını çalıştır
  cron.schedule("30 8 * * *", () => {
    sequenceAdimlariniCalistir().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // Her gün 08:00 → aktivite düşüşü taraması (5+ gün ölçüm yok)
  cron.schedule("0 8 * * *", () => {
    aktiviteDususTara().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  // Her gün 09:00 → paket bitiş taraması (3 gün kalan)
  cron.schedule("0 9 * * *", () => {
    paketBitiyorTara().catch(console.error)
  }, { timezone: "Europe/Istanbul" })

  console.log("[Otomasyon] ✓ Tüm cron job'lar aktif.")
  console.log("  • Randevu hatırlatma: Her gün 09:00 ve 20:00")
  console.log("  • 1 saat öncesi uyarı: Her saat başı kontrol")
  console.log("  • Motivasyon: Her Pazartesi 08:30")
  console.log("  • Tartı günü: Her Pazartesi 07:00")
  console.log("  • Su hatırlatma: 09:00, 12:00, 15:00, 18:00")
  console.log("  • Follow-up (randevu sonrası): Her gün 10:00")
  console.log("  • Follow-up (ölçüm yok): Her Perşembe 09:00")
  console.log("  • Follow-up (hareketsiz): Her Pazartesi 11:00")
  console.log("  • Follow-up (randevu yok): Her Pazar 18:00")
}
