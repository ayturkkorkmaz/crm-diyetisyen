"use client"

import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Users, CalendarDays, TrendingDown, CreditCard, ArrowUpRight, AlertCircle } from "lucide-react"
import {
  useDanisanlar, useRandevular, useOlcumler, useOdemeler,
} from "@/lib/crm-store"
import {
  formatPara, getRandevuDurumVariant, getRandevuDurumLabel,
  getInitials, getOdemeDurumVariant, getOdemeDurumLabel,
} from "@/lib/utils-crm"

function bugunStr() {
  return new Date().toISOString().slice(0, 10)
}

function bugunEtiket() {
  return new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

export default function DashboardPage() {
  const danisanlar = useDanisanlar()
  const randevular = useRandevular()
  const olcumler = useOlcumler()
  const odemeler = useOdemeler()

  const bugun = bugunStr()
  const aktifDanisanlar = danisanlar.filter(d => d.durum === "aktif")

  // Bugünkü randevular — danışan bilgisi eklenmiş
  const bugunRandevular = randevular
    .filter(r => r.tarih === bugun)
    .sort((a, b) => a.saat.localeCompare(b.saat))
    .slice(0, 5)
    .map(r => ({ ...r, danisan: danisanlar.find(d => d.id === r.danisan_id) }))

  // Bekleyen ödemeler — danışan bilgisi eklenmiş
  const bekleyenOdemeler = odemeler
    .filter(o => o.durum !== "odendi")
    .slice(0, 4)
    .map(o => ({ ...o, danisan: danisanlar.find(d => d.id === o.danisan_id) }))

  // Ortalama kilo kaybı
  const kaybEdenler = aktifDanisanlar.filter(d => d.baslangic_kilo).map(d => {
    const sonOlcum = olcumler
      .filter(o => o.danisan_id === d.id)
      .sort((a, b) => b.tarih.localeCompare(a.tarih))[0]
    if (!sonOlcum) return 0
    return d.baslangic_kilo! - sonOlcum.kilo_kg
  }).filter(k => k > 0)
  const ortKayip = kaybEdenler.length > 0
    ? (kaybEdenler.reduce((a, b) => a + b, 0) / kaybEdenler.length).toFixed(1)
    : "0.0"

  // Bu ay gelir
  const buAyStr = bugun.slice(0, 7)
  const buAyGelir = odemeler
    .filter(o => o.durum === "odendi" && o.tarih?.startsWith(buAyStr))
    .reduce((t, o) => t + o.tutar, 0)
  const bekleyenToplam = odemeler
    .filter(o => o.durum !== "odendi")
    .reduce((t, o) => t + o.tutar, 0)

  // İlerleme özeti — aktif, hedefi olan danışanlar
  const ilerleyenler = aktifDanisanlar
    .filter(d => d.baslangic_kilo && d.hedef_kilo)
    .slice(0, 4)
    .map(d => {
      const sonOlcum = olcumler
        .filter(o => o.danisan_id === d.id)
        .sort((a, b) => b.tarih.localeCompare(a.tarih))[0]
      const mevcutKilo = sonOlcum?.kilo_kg ?? d.baslangic_kilo!
      const toplam = Math.abs(d.baslangic_kilo! - d.hedef_kilo!)
      const gidilen = Math.abs(d.baslangic_kilo! - mevcutKilo)
      const yuzde = toplam > 0 ? Math.min(100, Math.round((gidilen / toplam) * 100)) : 0
      return { ...d, mevcutKilo, yuzde }
    })

  return (
    <>
      <Header title="Genel Bakış" description={`Bugün — ${bugunEtiket()}`} />
      <div className="p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Toplam Danışan</p>
                <div className="bg-blue-50 rounded-lg p-2"><Users className="h-4 w-4 text-blue-600" /></div>
              </div>
              <p className="text-3xl font-bold">{danisanlar.length}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                {aktifDanisanlar.length} aktif danışan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Bugünkü Randevu</p>
                <div className="bg-violet-50 rounded-lg p-2"><CalendarDays className="h-4 w-4 text-violet-600" /></div>
              </div>
              <p className="text-3xl font-bold">{bugunRandevular.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Planlanmış seans</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Ort. Kilo Kaybı</p>
                <div className="bg-emerald-50 rounded-lg p-2"><TrendingDown className="h-4 w-4 text-emerald-600" /></div>
              </div>
              <p className="text-3xl font-bold">−{ortKayip} kg</p>
              <p className="text-xs text-muted-foreground mt-1">Aktif danışan ortalaması</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Bu Ay Gelir</p>
                <div className="bg-amber-50 rounded-lg p-2"><CreditCard className="h-4 w-4 text-amber-600" /></div>
              </div>
              <p className="text-3xl font-bold">{formatPara(buAyGelir)}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                {formatPara(bekleyenToplam)} bekliyor
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bugünkü Randevular */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Bugünkü Randevular</CardTitle>
                <Link href="/randevular" className="text-xs text-primary hover:underline">Tümünü gör</Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {bugunRandevular.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Bugün randevu yok</p>
              ) : (
                <div className="divide-y divide-border">
                  {bugunRandevular.map((r) => (
                    <div key={r.id} className="flex items-center gap-4 px-6 py-3">
                      <div className="text-center w-12 shrink-0">
                        <p className="text-sm font-bold text-primary">{r.saat}</p>
                        <p className="text-xs text-muted-foreground">{r.sure_dk} dk</p>
                      </div>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs">
                          {r.danisan ? getInitials(r.danisan.ad, r.danisan.soyad) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{r.danisan?.ad} {r.danisan?.soyad}</p>
                        <p className="text-xs text-muted-foreground">{r.tur}</p>
                      </div>
                      <Badge variant={getRandevuDurumVariant(r.durum)}>
                        {getRandevuDurumLabel(r.durum)}
                      </Badge>
                      {r.ucret && <p className="text-sm font-medium text-muted-foreground shrink-0">{formatPara(r.ucret)}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {/* Bekleyen Ödemeler */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Bekleyen Ödemeler</CardTitle>
                  <Link href="/odemeler" className="text-xs text-primary hover:underline">Tümü</Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {bekleyenOdemeler.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Bekleyen ödeme yok</p>
                ) : (
                  <div className="divide-y divide-border">
                    {bekleyenOdemeler.map((o) => (
                      <div key={o.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{o.danisan?.ad} {o.danisan?.soyad}</p>
                          <p className="text-xs text-muted-foreground">{o.aciklama}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold">{formatPara(o.tutar)}</p>
                          <Badge variant={getOdemeDurumVariant(o.durum)} className="text-xs">
                            {getOdemeDurumLabel(o.durum)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* İlerleme Özeti */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">İlerleme Özeti</CardTitle>
                  <Link href="/danisanlar" className="text-xs text-primary hover:underline">Tümü</Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                {ilerleyenler.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Veri yok</p>
                ) : (
                  ilerleyenler.map((d) => (
                    <div key={d.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{d.ad} {d.soyad}</span>
                        <span className="text-muted-foreground">{d.mevcutKilo} / {d.hedef_kilo} kg</span>
                      </div>
                      <Progress value={d.yuzde} className="h-1.5" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
