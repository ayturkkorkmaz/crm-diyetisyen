"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Trophy, Flame, Star, TrendingUp, Users, Award, Zap, RefreshCw, Plus,
  AlertTriangle, Clock, MessageCircle, TrendingDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SEVIYELER, SEVIYE_STIL, ROZETLER,
  seviyeHesapla, sonrakiSeviye, seviyeIlerleme, EYLEM_PUANLARI,
  type EylemTuru,
} from "@/lib/loyalty-definitions"
import type { DanisanLoyalty } from "@/lib/loyalty-store"
import { useSyncExternalStore } from "react"
import { crmStore } from "@/lib/crm-store"
import type { Danisan } from "@/lib/types"

const BOSH_DIZI: never[] = []

function useDanisanlar(): Danisan[] {
  return useSyncExternalStore(
    crmStore.subscribe,
    () => crmStore.getSnapshot().danisanlar,
    () => BOSH_DIZI as Danisan[],
  )
}

function useRandevular() {
  return useSyncExternalStore(
    crmStore.subscribe,
    () => crmStore.getSnapshot().randevular,
    () => BOSH_DIZI,
  )
}

function useOdemeler() {
  return useSyncExternalStore(
    crmStore.subscribe,
    () => crmStore.getSnapshot().odemeler,
    () => BOSH_DIZI,
  )
}

const EYLEM_SECENEKLER: { tip: EylemTuru; label: string; puan: number }[] = [
  { tip: "randevu_geldi",  label: "Randevuya Geldi",  puan: EYLEM_PUANLARI.randevu_geldi  },
  { tip: "kilo_giris",     label: "Kilo Girişi",       puan: EYLEM_PUANLARI.kilo_giris     },
  { tip: "arkadasDavet",   label: "Arkadaş Daveti",   puan: EYLEM_PUANLARI.arkadasDavet   },
  { tip: "diyet_sadik",    label: "Diyete Sadık",      puan: EYLEM_PUANLARI.diyet_sadik    },
]

// ── Müşteri Süresi Hesaplama ────────────────────────────────────────────────
function musteriSuresiAy(kayitTarihi: string): number {
  const kayit = new Date(kayitTarihi + "T00:00:00")
  const bugun = new Date()
  const ayFarki = (bugun.getFullYear() - kayit.getFullYear()) * 12 + (bugun.getMonth() - kayit.getMonth())
  return Math.max(0, ayFarki)
}

function suresiEtiket(ay: number): string {
  if (ay < 1) return "Bu ay başladı"
  if (ay === 1) return "1 aydır"
  if (ay < 12) return `${ay} aydır`
  const yil = Math.floor(ay / 12)
  const kalanAy = ay % 12
  if (kalanAy === 0) return `${yil} yıldır`
  return `${yil} yıl ${kalanAy} aydır`
}

// ── Müşteri Kayıp Riski Skoru ────────────────────────────────────────────────
interface RiskAnaliz {
  danisanId: string
  ad: string
  puan: number // 0-100, yüksek = yüksek risk
  nedenler: string[]
  scriptOnerisi: string
}

function riskHesapla(
  danisan: Danisan,
  randevular: ReturnType<typeof useRandevular>,
  odemeler: ReturnType<typeof useOdemeler>,
  loyalty?: DanisanLoyalty,
): RiskAnaliz {
  let puan = 0
  const nedenler: string[] = []

  const bugun = new Date()
  const bugunStr = bugun.toISOString().slice(0, 10)

  // Son randevu kontrolü
  const danisanRandevular = randevular
    .filter(r => r.danisan_id === danisan.id && r.durum === "tamamlandi")
    .sort((a, b) => b.tarih.localeCompare(a.tarih))
  const sonRandevu = danisanRandevular[0]

  if (!sonRandevu) {
    puan += 30
    nedenler.push("Hiç tamamlanmış randevu yok")
  } else {
    const gunFark = Math.round((bugun.getTime() - new Date(sonRandevu.tarih + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24))
    if (gunFark > 45) { puan += 35; nedenler.push(`${gunFark} gündür randevu yok`) }
    else if (gunFark > 30) { puan += 20; nedenler.push(`${gunFark} gündür randevu yok`) }
    else if (gunFark > 14) { puan += 10 }
  }

  // Gecikmiş ödeme kontrolü
  const gecikmisOdemeler = odemeler.filter(o => o.danisan_id === danisan.id && o.durum === "gecikti")
  if (gecikmisOdemeler.length > 0) {
    puan += 25
    nedenler.push(`${gecikmisOdemeler.length} gecikmiş ödeme`)
  }

  // Loyalty aktivitesi
  if (!loyalty || loyalty.toplamPuan === 0) {
    puan += 15
    nedenler.push("Hiç sadakat puanı yok")
  } else if (loyalty.mevcutSeri === 0) {
    puan += 10
    nedenler.push("Aktif seri yok")
  }

  // Müşteri süresi (uzun süreli müşteri kaybı daha değerli)
  const ay = musteriSuresiAy(danisan.kayit_tarihi)
  const ayBonusu = ay >= 12 ? 15 : ay >= 6 ? 10 : 5
  if (puan >= 30) puan = Math.min(100, puan + ayBonusu) // Uzun süre müşteri ve yüksek risk = kritik

  // Script önerisi
  let scriptOnerisi = `Merhaba ${danisan.ad}, ${suresiEtiket(ay)} danışanımsınız. `
  if (nedenler.includes("Hiç tamamlanmış randevu yok")) {
    scriptOnerisi += "Sürecinizle ilgili konuşmak isterim, uygun bir zaman var mı?"
  } else if (sonRandevu) {
    const gunFark = Math.round((bugun.getTime() - new Date(sonRandevu.tarih + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24))
    if (gunFark > 30) scriptOnerisi += `Son görüşmemizin üzerinden ${gunFark} gün geçmiş. Nasıl gidiyor? Yeni randevu alabilir miyiz?`
    else scriptOnerisi += "Son randevunuzu değerlendirmek ve ilerleyen süreci planlamak için görüşelim."
  }
  if (gecikmisOdemeler.length > 0) scriptOnerisi += " Bekleyen ödemeleriniz hakkında da konuşabiliriz."

  return { danisanId: danisan.id, ad: `${danisan.ad} ${danisan.soyad}`, puan, nedenler, scriptOnerisi }
}

function riskRenk(puan: number): string {
  if (puan >= 60) return "text-red-600 bg-red-50 border-red-200"
  if (puan >= 35) return "text-amber-600 bg-amber-50 border-amber-200"
  return "text-emerald-600 bg-emerald-50 border-emerald-200"
}

function riskEtiket(puan: number): string {
  if (puan >= 60) return "Yüksek Risk"
  if (puan >= 35) return "Orta Risk"
  return "Düşük Risk"
}

export default function LoyaltyPage() {
  const [tumLoyalty, setTumLoyalty] = useState<DanisanLoyalty[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [puanVerModal, setPuanVerModal] = useState(false)
  const [secilenDanisanId, setSecilenDanisanId] = useState("")
  const [secilenEylem, setSecilenEylem] = useState<EylemTuru>("randevu_geldi")
  const [gonderiyor, setGonderiyor] = useState(false)
  const [acikScript, setAcikScript] = useState<string | null>(null)
  const danisanlar = useDanisanlar()
  const randevular = useRandevular()
  const odemeler = useOdemeler()

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

  // Müşteri süresi istatistikleri
  const aktifDanisanlar = danisanlar.filter(d => d.durum === "aktif")
  const ortalamaAy = aktifDanisanlar.length > 0
    ? Math.round(aktifDanisanlar.reduce((s, d) => s + musteriSuresiAy(d.kayit_tarihi), 0) / aktifDanisanlar.length)
    : 0
  const enUzunMusteri = aktifDanisanlar.reduce((max, d) => {
    const ay = musteriSuresiAy(d.kayit_tarihi)
    return ay > max.ay ? { ad: `${d.ad} ${d.soyad}`, ay } : max
  }, { ad: "—", ay: 0 })

  // Risk analizleri
  const riskAnalizleri = aktifDanisanlar
    .map(d => riskHesapla(d, randevular, odemeler, tumLoyalty.find(l => l.danisanId === d.id)))
    .sort((a, b) => b.puan - a.puan)
    .filter(r => r.puan >= 20)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 rounded-xl p-2.5">
            <Trophy className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Sadakat & Müşteri Analizi</h1>
            <p className="text-sm text-muted-foreground">Bağlılık, müşteri süresi ve kayıp riski</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={yukle} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />Yenile
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setPuanVerModal(true)}>
            <Plus className="h-3.5 w-3.5" />Puan Ver
          </Button>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Aktif Danışan</span>
            </div>
            <p className="text-2xl font-bold">{aktifDanisanlar.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-violet-500" />
              <span className="text-xs text-muted-foreground">Ort. Müşteri Süresi</span>
            </div>
            <p className="text-2xl font-bold">{ortalamaAy} ay</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">En Uzun Müşteri</span>
            </div>
            <p className="text-base font-bold leading-tight truncate">{enUzunMusteri.ad}</p>
            <p className="text-xs text-muted-foreground">{suresiEtiket(enUzunMusteri.ay)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-muted-foreground">Risk Altında</span>
            </div>
            <p className="text-2xl font-bold">{riskAnalizleri.filter(r => r.puan >= 35).length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risk">
        <TabsList>
          <TabsTrigger value="risk" className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />Kayıp Riski
          </TabsTrigger>
          <TabsTrigger value="liderlik" className="gap-1.5">
            <Star className="h-3.5 w-3.5" />Sadakat Tablosu
          </TabsTrigger>
          <TabsTrigger value="sureler" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />Müşteri Süreleri
          </TabsTrigger>
        </TabsList>

        {/* ── Kayıp Riski Raporu ──────────────────────────────────────── */}
        <TabsContent value="risk" className="mt-5 space-y-4">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-4 text-sm text-amber-900">
              <p className="font-semibold mb-1">Bu rapor yalnızca sizin için</p>
              <p className="text-xs leading-5">
                Risk skorları danışanlarınıza gösterilmez ve hiçbir otomasyona bağlı değildir.
                Sistem sadece size uyarı verir ve basit bir script önerisi sunar. Görüşmeyi nasıl yapacağınıza siz karar verin.
              </p>
            </CardContent>
          </Card>

          {riskAnalizleri.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Risk altında danışan yok — harika!</p>
              </CardContent>
            </Card>
          ) : riskAnalizleri.map(r => (
            <Card key={r.danisanId} className={`border ${riskRenk(r.puan).split(" ")[2]}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${riskRenk(r.puan).split(" ").slice(1, 3).join(" ")}`}>
                      {r.puan}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{r.ad}</p>
                        <Badge
                          className={`text-xs ${r.puan >= 60 ? "bg-red-100 text-red-700 border border-red-200" : r.puan >= 35 ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-emerald-100 text-emerald-700 border border-emerald-200"}`}
                        >
                          {riskEtiket(r.puan)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {r.nedenler.map((n, i) => (
                          <span key={i} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{n}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="w-24 shrink-0">
                    <div className="text-xs text-muted-foreground text-right mb-1">Risk</div>
                    <Progress value={r.puan} className={`h-2 ${r.puan >= 60 ? "[&>div]:bg-red-500" : r.puan >= 35 ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500"}`} />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Script Önerisi</p>
                      <p className="text-xs leading-5 italic">"{r.scriptOnerisi}"</p>
                    </div>
                    <button
                      onClick={() => setAcikScript(acikScript === r.danisanId ? null : r.danisanId)}
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      {acikScript === r.danisanId ? "Kapat" : "Tam Görüntüle"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Sadakat Liderlik Tablosu ────────────────────────────────── */}
        <TabsContent value="liderlik" className="mt-5 space-y-4">
          <div className="grid grid-cols-3 gap-3 mb-2">
            <Card><CardContent className="p-3 flex items-center gap-2.5">
              <div className="bg-blue-50 rounded-lg p-2"><Users className="h-4 w-4 text-blue-600" /></div>
              <div><p className="text-xs text-muted-foreground">Aktif Üye</p><p className="text-lg font-bold">{toplamAktif}</p></div>
            </CardContent></Card>
            <Card><CardContent className="p-3 flex items-center gap-2.5">
              <div className="bg-emerald-50 rounded-lg p-2"><TrendingUp className="h-4 w-4 text-emerald-600" /></div>
              <div><p className="text-xs text-muted-foreground">Ort. Puan</p><p className="text-lg font-bold">{ortalamaPuan}</p></div>
            </CardContent></Card>
            <Card><CardContent className="p-3 flex items-center gap-2.5">
              <div className="bg-violet-50 rounded-lg p-2"><Award className="h-4 w-4 text-violet-600" /></div>
              <div><p className="text-xs text-muted-foreground">Toplam Rozet</p><p className="text-lg font-bold">{toplamRozet}</p></div>
            </CardContent></Card>
          </div>

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
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tumLoyalty.map((loyalty, idx) => {
                    const seviye = seviyeHesapla(loyalty.toplamPuan)
                    const sonraki = sonrakiSeviye(loyalty.toplamPuan)
                    const ilerleme = seviyeIlerleme(loyalty.toplamPuan)
                    const stil = SEVIYE_STIL[seviye.id]
                    const ad = danisanAd(loyalty.danisanId)
                    const danisan = danisanlar.find(d => d.id === loyalty.danisanId)
                    const ay = danisan ? musteriSuresiAy(danisan.kayit_tarihi) : 0
                    return (
                      <div key={loyalty.danisanId} className="flex items-center gap-4 px-5 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          idx === 0 ? "bg-amber-400 text-white" :
                          idx === 1 ? "bg-slate-400 text-white" :
                          idx === 2 ? "bg-orange-400 text-white" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="font-medium text-sm truncate">{ad}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stil.bg} ${stil.text}`}>
                              {seviye.ikon} {seviye.ad}
                            </span>
                            {ay > 0 && (
                              <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                                {suresiEtiket(ay)}
                              </span>
                            )}
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
                        <div className="flex items-center gap-0.5 shrink-0">
                          {loyalty.kazanilmisRozetler.slice(0, 4).map(rid => {
                            const rozet = ROZETLER.find(r => r.id === rid)
                            return rozet ? (
                              <span key={rid} title={rozet.ad} className="text-base">{rozet.ikon}</span>
                            ) : null
                          })}
                          {loyalty.kazanilmisRozetler.length > 4 && (
                            <span className="text-xs text-muted-foreground ml-1">+{loyalty.kazanilmisRozetler.length - 4}</span>
                          )}
                        </div>
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

          <Card className="bg-muted/30 border-dashed">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />Seviye Sistemi
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
        </TabsContent>

        {/* ── Müşteri Süreleri ────────────────────────────────────────── */}
        <TabsContent value="sureler" className="mt-5 space-y-3">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="grid grid-cols-4 px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40">
                  <span>Danışan</span>
                  <span>Kayıt Tarihi</span>
                  <span>Süre</span>
                  <span>Durum</span>
                </div>
                {[...aktifDanisanlar]
                  .sort((a, b) => musteriSuresiAy(b.kayit_tarihi) - musteriSuresiAy(a.kayit_tarihi))
                  .map(d => {
                    const ay = musteriSuresiAy(d.kayit_tarihi)
                    return (
                      <div key={d.id} className="grid grid-cols-4 px-5 py-3 text-sm items-center">
                        <span className="font-medium">{d.ad} {d.soyad}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(d.kayit_tarihi + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="font-semibold text-primary">{suresiEtiket(ay)}</span>
                        <span>
                          {ay >= 12
                            ? <Badge variant="success" className="text-xs">Uzun Dönem</Badge>
                            : ay >= 6
                            ? <Badge variant="secondary" className="text-xs">Düzenli</Badge>
                            : <Badge variant="default" className="text-xs">Yeni</Badge>
                          }
                        </span>
                      </div>
                    )
                  })}
                {aktifDanisanlar.length === 0 && (
                  <div className="px-5 py-12 text-center text-muted-foreground text-sm">Aktif danışan yok</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Puan Ver Modal */}
      {puanVerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />Manuel Puan Ver
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
              <Button variant="outline" className="flex-1" onClick={() => setPuanVerModal(false)}>İptal</Button>
              <Button className="flex-1" disabled={!secilenDanisanId || gonderiyor} onClick={puanVer}>
                {gonderiyor ? "Kaydediliyor…" : "Puan Ver"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
