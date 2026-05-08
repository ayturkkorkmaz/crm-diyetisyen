"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trophy, Flame, Lock, ChevronLeft, RefreshCw, Zap, Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  SEVIYELER, SEVIYE_STIL, ROZETLER, CHALLENGE_SABLONLARI,
  seviyeHesapla, sonrakiSeviye, seviyeIlerleme,
  EYLEM_ETIKETLER,
  type EylemTuru,
} from "@/lib/loyalty-definitions"
import type { DanisanLoyalty } from "@/lib/loyalty-store"
import Link from "next/link"

function zamanGecti(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return "az önce"
  if (diff < 60) return `${diff} dk önce`
  const saat = Math.floor(diff / 60)
  if (saat < 24) return `${saat} sa önce`
  return `${Math.floor(saat / 24)} gün önce`
}

function gunStr(offsetGun: number): string {
  const d = new Date()
  d.setDate(d.getDate() - offsetGun)
  return d.toISOString().slice(0, 10)
}

export default function PortalLoyaltyPage() {
  const router = useRouter()
  const [loyalty, setLoyalty] = useState<DanisanLoyalty | null>(null)
  const [danisanId, setDanisanId] = useState<string | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [yenileniyor, setYenileniyor] = useState(false)

  async function yukle(did: string) {
    const res = await fetch(`/api/loyalty?danisanId=${did}`, { cache: "no-store" })
    if (res.ok) {
      const data = await res.json() as DanisanLoyalty & { ok: boolean }
      setLoyalty(data)
    }
  }

  useEffect(() => {
    async function init() {
      let did: string | null = null
      try {
        const res = await fetch("/api/portal/auth/me")
        if (res.ok) {
          const data = await res.json() as { ok: boolean; danisanId?: string }
          if (data.ok && data.danisanId) did = data.danisanId
        }
      } catch { /* ignore */ }

      if (!did) {
        const raw = localStorage.getItem("portalAuth")
        if (raw) {
          try { did = JSON.parse(raw).danisanId } catch { /* ignore */ }
        }
      }

      if (!did) { router.replace("/portal/login"); return }

      setDanisanId(did)
      await yukle(did)
      setYukleniyor(false)
    }
    init()
  }, [router])

  async function yenile() {
    if (!danisanId) return
    setYenileniyor(true)
    await yukle(danisanId)
    setYenileniyor(false)
  }

  if (yukleniyor || !loyalty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Trophy className="h-8 w-8 text-amber-500 animate-pulse" />
      </div>
    )
  }

  const seviye = seviyeHesapla(loyalty.toplamPuan)
  const sonraki = sonrakiSeviye(loyalty.toplamPuan)
  const ilerleme = seviyeIlerleme(loyalty.toplamPuan)
  const stil = SEVIYE_STIL[seviye.id]

  // Son 7 günlük aktivite
  const son7Gun = Array.from({ length: 7 }, (_, i) => {
    const tarih = gunStr(6 - i)
    const aktif = loyalty.gecmis.some(k => k.tarih.slice(0, 10) === tarih)
    return { tarih, aktif }
  })

  // Aktif challenge
  const aktifChallenge = loyalty.aktifChallenge && !loyalty.aktifChallenge.tamamlandi
    ? loyalty.aktifChallenge
    : null
  const challengeSablon = aktifChallenge
    ? CHALLENGE_SABLONLARI.find(s => s.id === aktifChallenge.sablonId)
    : null

  // Challenge ilerleme sayısı
  const challengeIlerleme = challengeSablon && aktifChallenge
    ? loyalty.gecmis.filter(k => {
        const pencereBaslangic = new Date(aktifChallenge.baslaAt)
        return k.tip === challengeSablon.hedefEylem &&
          k.tarih >= pencereBaslangic.toISOString()
      }).length
    : 0

  // Son 10 eylem
  const sonEylemler = [...loyalty.gecmis].reverse().slice(0, 10)

  return (
    <div className="max-w-md mx-auto min-h-screen pb-10">

      {/* Header */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-5">
          <Link href="/portal/dashboard" className="bg-white/20 rounded-full p-2">
            <ChevronLeft className="h-4 w-4 text-white" />
          </Link>
          <h1 className="text-white font-bold">Sadakat Puanlarım</h1>
          <button onClick={yenile} className="bg-white/20 rounded-full p-2" disabled={yenileniyor}>
            <RefreshCw className={`h-4 w-4 text-white ${yenileniyor ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Puan + Seviye */}
        <div className="bg-white/20 rounded-2xl p-5 text-center">
          <p className="text-5xl font-black text-white">{loyalty.toplamPuan.toLocaleString("tr-TR")}</p>
          <p className="text-white/80 text-sm mt-1">toplam puan</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${stil.bg} ${stil.text}`}>
              {seviye.ikon} {seviye.ad}
            </span>
          </div>
          {sonraki && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Seviye {seviye.id}</span>
                <span>{sonraki.minPuan - loyalty.toplamPuan} puan kaldı → {sonraki.ikon} {sonraki.ad}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${ilerleme}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Seri */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-orange-50 rounded-xl p-2">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Günlük Seri</p>
                <p className="text-xs text-muted-foreground">En uzun: {loyalty.enUzunSeri} gün</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-orange-500">{loyalty.mevcutSeri}</p>
              <p className="text-xs text-muted-foreground">gün</p>
            </div>
          </div>
          {/* Son 7 gün */}
          <div className="flex gap-1.5">
            {son7Gun.map(({ tarih, aktif }) => {
              const gun = new Date(tarih).toLocaleDateString("tr-TR", { weekday: "narrow" })
              return (
                <div key={tarih} className="flex-1 text-center">
                  <div className={`h-8 rounded-lg flex items-center justify-center text-sm ${
                    aktif ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-300"
                  }`}>
                    {aktif ? "🔥" : "·"}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{gun}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Aktif Challenge */}
        {challengeSablon && aktifChallenge && (
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-violet-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-violet-50 rounded-xl p-2">
                <Zap className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">{challengeSablon.baslik}</p>
                <p className="text-xs text-muted-foreground">{challengeSablon.aciklama}</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                  +{challengeSablon.bonus + 30} puan
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>İlerleme</span>
              <span>{challengeIlerleme}/{challengeSablon.hedefSayi}</span>
            </div>
            <Progress
              value={Math.min(100, (challengeIlerleme / challengeSablon.hedefSayi) * 100)}
              className="h-2"
            />
          </div>
        )}

        {/* Rozetler */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-amber-50 rounded-xl p-2">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <p className="font-semibold text-sm">
              Rozetler
              <span className="text-xs text-muted-foreground font-normal ml-1.5">
                {loyalty.kazanilmisRozetler.length}/{ROZETLER.length}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {ROZETLER.map(rozet => {
              const kazanildi = loyalty.kazanilmisRozetler.includes(rozet.id)
              return (
                <div
                  key={rozet.id}
                  className={`rounded-xl p-3 text-center transition-all ${
                    kazanildi
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-slate-50 border border-slate-100 opacity-50"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {kazanildi ? rozet.ikon : <Lock className="h-5 w-5 text-slate-300 mx-auto" />}
                  </div>
                  <p className={`text-xs font-medium leading-tight ${kazanildi ? "text-amber-800" : "text-muted-foreground"}`}>
                    {rozet.ad}
                  </p>
                  {!kazanildi && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      {rozet.aciklama}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Puan Geçmişi */}
        <div className="bg-white rounded-2xl shadow-xs border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Star className="h-4 w-4 text-amber-500" />
            <p className="font-semibold text-sm">Son Kazanımlar</p>
          </div>
          {sonEylemler.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Henüz aktivite yok. Uygulamayı kullandıkça puan kazanırsın!
            </p>
          ) : (
            <div className="divide-y divide-border">
              {sonEylemler.map(kayit => (
                <div key={kayit.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {EYLEM_ETIKETLER[kayit.tip as EylemTuru] ?? kayit.tip}
                    </p>
                    <p className="text-xs text-muted-foreground">{zamanGecti(kayit.tarih)}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">+{kayit.puan}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nasıl puan kazanılır? */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-5 border border-border">
          <p className="font-semibold text-sm mb-3">Nasıl puan kazanırsın?</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex justify-between"><span>💧 Günlük su takibi</span><strong>+10</strong></li>
            <li className="flex justify-between"><span>🍽️ Öğün logu</span><strong>+15</strong></li>
            <li className="flex justify-between"><span>⚖️ Kilo girişi</span><strong>+20</strong></li>
            <li className="flex justify-between"><span>📅 Randevuya katılma</span><strong>+50</strong></li>
            <li className="flex justify-between"><span>🔥 7 günlük seri bonusu</span><strong>+100</strong></li>
            <li className="flex justify-between"><span>🤝 Arkadaş daveti</span><strong>+200</strong></li>
            <li className="flex justify-between"><span>⚡ 30 günlük seri bonusu</span><strong>+500</strong></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
