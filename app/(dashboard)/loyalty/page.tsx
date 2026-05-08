"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, Flame, Star, TrendingUp, Users, Award, Zap, RefreshCw, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  SEVIYELER, SEVIYE_STIL, ROZETLER,
  seviyeHesapla, sonrakiSeviye, seviyeIlerleme, EYLEM_PUANLARI,
  type EylemTuru,
} from "@/lib/loyalty-definitions"
import type { DanisanLoyalty } from "@/lib/loyalty-store"
import { useSyncExternalStore } from "react"
import { crmStore } from "@/lib/crm-store"
import type { Danisan } from "@/lib/types"

function useDanisanlar(): Danisan[] {
  return useSyncExternalStore(
    crmStore.subscribe,
    () => crmStore.getSnapshot().danisanlar,
    () => [] as Danisan[],
  )
}

const EYLEM_SECENEKLER: { tip: EylemTuru; label: string; puan: number }[] = [
  { tip: "randevu_geldi",  label: "Randevuya Geldi",  puan: EYLEM_PUANLARI.randevu_geldi  },
  { tip: "kilo_giris",     label: "Kilo Girişi",       puan: EYLEM_PUANLARI.kilo_giris     },
  { tip: "arkadasDavet",   label: "Arkadaş Daveti",   puan: EYLEM_PUANLARI.arkadasDavet   },
  { tip: "diyet_sadik",    label: "Diyete Sadık",      puan: EYLEM_PUANLARI.diyet_sadik    },
  { tip: "su_takibi",      label: "Su Takibi",         puan: EYLEM_PUANLARI.su_takibi      },
  { tip: "ogun_log",       label: "Öğün Kaydı",        puan: EYLEM_PUANLARI.ogun_log       },
]

export default function LoyaltyPage() {
  const [tumLoyalty, setTumLoyalty] = useState<DanisanLoyalty[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [poanVerModal, setPuanVerModal] = useState(false)
  const [secilenDanisanId, setSecilenDanisanId] = useState("")
  const [secilenEylem, setSecilenEylem] = useState<EylemTuru>("randevu_geldi")
  const [gonderiyor, setGonderiyor] = useState(false)
  const danisanlar = useDanisanlar()

  const yukle = useCallback(async () => {
    try {
      const res = await fetch("/api/loyalty", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json() as { ok: boolean; tumler: DanisanLoyalty[] }
      const sirali = (data.tumler ?? []).sort((a, b) => b.toplamPuan - a.toplamPuan)
      setTumLoyalty(sirali)
    } finally {
      setYukleniyor(false)
    }
  }, [])

  useEffect(() => {
    yukle()
    const iv = setInterval(yukle, 60000)
    return () => clearInterval(iv)
  }, [yukle])

  function danisanAd(id: string): string {
    const d = danisanlar.find(d => d.id === id)
    return d ? `${d.ad} ${d.soyad}` : id
  }

  async function puanVer() {
    if (!secilenDanisanId || !secilenEylem) return
    setGonderiyor(true)
    await fetch("/api/loyalty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ danisanId: secilenDanisanId, tip: secilenEylem }),
    })
    setGonderiyor(false)
    setPuanVerModal(false)
    yukle()
  }

  // ── Özet istatistikler ────────────────────────────────────────────────
  const toplamAktif = tumLoyalty.length
  const ortalamaPuan = toplamAktif > 0
    ? Math.round(tumLoyalty.reduce((s, l) => s + l.toplamPuan, 0) / toplamAktif)
    : 0
  const enIyiSeri = tumLoyalty.reduce((max, l) => Math.max(max, l.mevcutSeri), 0)
  const toplamRozet = tumLoyalty.reduce((s, l) => s + l.kazanilmisRozetler.length, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 rounded-xl p-2.5">
            <Trophy className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Sadakat Programı</h1>
            <p className="text-sm text-muted-foreground">Danışan bağlılığını ve motivasyonunu takip et</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={yukle} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Yenile
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setPuanVerModal(true)}>
            <Plus className="h-3.5 w-3.5" />
            Puan Ver
          </Button>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Aktif Üye</span>
            </div>
            <p className="text-2xl font-bold">{toplamAktif}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Ort. Puan</span>
            </div>
            <p className="text-2xl font-bold">{ortalamaPuan}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">En Uzun Seri</span>
            </div>
            <p className="text-2xl font-bold">{enIyiSeri} gün</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Toplam Rozet</span>
            </div>
            <p className="text-2xl font-bold">{toplamRozet}</p>
          </CardContent>
        </Card>
      </div>

      {/* Liderlik Tablosu */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Liderlik Tablosu
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {yukleniyor ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Yükleniyor…</div>
          ) : tumLoyalty.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Henüz hiçbir danışan puan kazanmadı.</p>
              <p className="text-xs mt-1">Danışanlar portal üzerinden aktivite yaptıkça burada görünür.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tumLoyalty.map((loyalty, idx) => {
                const seviye = seviyeHesapla(loyalty.toplamPuan)
                const sonraki = sonrakiSeviye(loyalty.toplamPuan)
                const ilerleme = seviyeIlerleme(loyalty.toplamPuan)
                const stil = SEVIYE_STIL[seviye.id]
                const ad = danisanAd(loyalty.danisanId)

                return (
                  <div key={loyalty.danisanId} className="flex items-center gap-4 px-5 py-4">
                    {/* Sıra */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      idx === 0 ? "bg-amber-400 text-white" :
                      idx === 1 ? "bg-slate-400 text-white" :
                      idx === 2 ? "bg-orange-400 text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Danışan */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{ad}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stil.bg} ${stil.text}`}>
                          {seviye.ikon} {seviye.ad}
                        </span>
                        {loyalty.mevcutSeri >= 7 && (
                          <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full">
                            🔥 {loyalty.mevcutSeri}g
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={ilerleme} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground shrink-0">
                          {sonraki ? `${loyalty.toplamPuan}/${sonraki.minPuan}` : "MAX"}
                        </span>
                      </div>
                    </div>

                    {/* Rozetler */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {loyalty.kazanilmisRozetler.slice(0, 4).map(rid => {
                        const rozet = ROZETLER.find(r => r.id === rid)
                        return rozet ? (
                          <span key={rid} title={rozet.ad} className="text-base">{rozet.ikon}</span>
                        ) : null
                      })}
                      {loyalty.kazanilmisRozetler.length > 4 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{loyalty.kazanilmisRozetler.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Puan */}
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">{loyalty.toplamPuan.toLocaleString("tr-TR")}</p>
                      <p className="text-xs text-muted-foreground">puan</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seviye Açıklaması */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Seviye Sistemi
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SEVIYELER.map(s => {
              const stil = SEVIYE_STIL[s.id]
              return (
                <div key={s.id} className={`rounded-xl px-3 py-2 ${stil.bg}`}>
                  <span className="text-lg">{s.ikon}</span>
                  <p className={`text-sm font-semibold mt-0.5 ${stil.text}`}>{s.ad}</p>
                  <p className="text-xs text-muted-foreground">{s.minPuan}+ puan</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Puan Ver Modal */}
      {poanVerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Manuel Puan Ver
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Danışan</label>
                <select
                  value={secilenDanisanId}
                  onChange={e => setSecilenDanisanId(e.target.value)}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Danışan seçin…</option>
                  {danisanlar.map(d => (
                    <option key={d.id} value={d.id}>{d.ad} {d.soyad}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Eylem Türü</label>
                <select
                  value={secilenEylem}
                  onChange={e => setSecilenEylem(e.target.value as EylemTuru)}
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {EYLEM_SECENEKLER.map(e => (
                    <option key={e.tip} value={e.tip}>{e.label} (+{e.puan} puan)</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setPuanVerModal(false)}>
                İptal
              </Button>
              <Button
                className="flex-1"
                disabled={!secilenDanisanId || gonderiyor}
                onClick={puanVer}
              >
                {gonderiyor ? "Kaydediliyor…" : "Puan Ver"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
