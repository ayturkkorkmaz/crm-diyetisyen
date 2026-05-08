"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageCircle, Send, Clock, CheckCircle2, AlertCircle,
  Zap, Smartphone, Wifi, WifiOff, Pencil,
  Droplets, Scale, Package, CreditCard, Heart, Calendar, Loader2,
  RefreshCw, UserCheck,
} from "lucide-react"
import { useDanisanlar, useRandevular, useOdemeler } from "@/lib/crm-store"
import { getInitials } from "@/lib/utils-crm"
import type { Danisan, Randevu } from "@/lib/types"

type BaglantiDurumu = "disconnected" | "connecting" | "connected"

interface Otomasyon {
  id: string
  baslik: string
  aciklama: string
  icon: React.ElementType
  aktif: boolean
  zamanlama: string
  sablon: string
  renk: string
  gonderimSayisi: number
  sonGonderim?: string
  // Her otomasyonun hangi veriyi kullandığı
  tip: "randevu" | "genel" | "paket" | "odeme"
}

const baslangicOtomasyonlar: Otomasyon[] = [
  {
    id: "randevu", tip: "randevu",
    baslik: "Randevu Hatırlatma",
    aciklama: "Randevudan 24 saat ve 1 saat önce danışana otomatik mesaj gider.",
    icon: Calendar, aktif: true,
    zamanlama: "24 saat ve 1 saat önce",
    renk: "text-blue-600 bg-blue-50",
    gonderimSayisi: 0,
    sablon: "Merhaba {{ad}} 👋\n\n{{ne_zaman}} saat {{saat}}'deki beslenme danışmanlığı randevunuzu hatırlatmak istedim.\n\n⏰ Saat: {{saat}}\n📋 Seans: {{tur}}\n\nGörüşmek üzere! 🥗\nDyt. {{diyetisyen}}",
  },
  {
    id: "su", tip: "genel",
    baslik: "Su İç Hatırlatma",
    aciklama: "Her gün belirlenen saatlerde danışanlara su içmeleri için mesaj gider.",
    icon: Droplets, aktif: true,
    zamanlama: "Sabah 09:00, Öğle 12:00, İkindi 15:00, Akşam 18:00",
    renk: "text-cyan-600 bg-cyan-50",
    gonderimSayisi: 0,
    sablon: "💧 Su saati, {{ad}}!\n\nGünlük su hedefinizi unutmayın. Portale girerek ne kadar içtiğinizi işaretleyebilirsiniz.\n\nSağlıklı günler! 🌿",
  },
  {
    id: "motivasyon", tip: "genel",
    baslik: "Haftalık Motivasyon",
    aciklama: "Her Salı akşamı danışanlara motivasyon mesajı gider.",
    icon: Heart, aktif: true,
    zamanlama: "Her Pazartesi 08:30",
    renk: "text-pink-600 bg-pink-50",
    gonderimSayisi: 0,
    sablon: "Günaydın {{ad}}! ☀️\n\nYeni haftaya enerjik başlayalım! 💪\n\nSoruların için her zaman buradayım.\nDyt. {{diyetisyen}} 🥗",
  },
  {
    id: "tarti", tip: "genel",
    baslik: "Tartı Günü Bildirimi",
    aciklama: "Haftalık ölçüm günü geldiğinde danışana hatırlatma gider.",
    icon: Scale, aktif: true,
    zamanlama: "Her Pazartesi 07:00",
    renk: "text-violet-600 bg-violet-50",
    gonderimSayisi: 0,
    sablon: "⚖️ Tartı günü geldi, {{ad}}!\n\nSabah aç karnına ve tuvaletten sonra tartılıp kilonu portale girer misin?\n\nBen de senin ilerlemenle birlikte takip ediyorum 🎯",
  },
  {
    id: "paket", tip: "paket",
    baslik: "Paket Bitiyor Uyarısı",
    aciklama: "Danışanın paketi bitmeden 7 gün önce otomatik hatırlatma gider.",
    icon: Package, aktif: true,
    zamanlama: "Bitiş tarihinden 7 gün önce",
    renk: "text-amber-600 bg-amber-50",
    gonderimSayisi: 0,
    sablon: "Merhaba {{ad}} 👋\n\nBeslenme programınızın bitmesine 7 gün kaldı.\n\nDevam etmek ister misiniz? Randevu almak için bana yazabilirsiniz 🌱\n\nDyt. {{diyetisyen}}",
  },
  {
    id: "odeme", tip: "odeme",
    baslik: "Ödeme Gecikti Bildirimi",
    aciklama: "Ödeme tarihi geçen danışanlara 3 gün sonra nazikçe hatırlatma gider.",
    icon: CreditCard, aktif: false,
    zamanlama: "Gecikme tarihinden 3 gün sonra",
    renk: "text-red-600 bg-red-50",
    gonderimSayisi: 0,
    sablon: "Merhaba {{ad}},\n\n{{tarih}} tarihli {{tutar}}₺ tutarındaki seans ödemesi henüz alınamamış.\n\nHerhangi bir sorun yaşıyorsanız lütfen bildir.\n\nTeşekkürler 🙏\nDyt. {{diyetisyen}}",
  },
]

const gonderimGecmisi = [
  { id: 1, danisan: "Ayşe Kaya", tur: "Randevu Hatırlatma", tarih: "Bugün 08:00", durum: "iletildi" },
  { id: 2, danisan: "Mehmet Demir", tur: "Su Hatırlatma", tarih: "Bugün 09:00", durum: "iletildi" },
  { id: 3, danisan: "Fatma Şahin", tur: "Su Hatırlatma", tarih: "Bugün 09:00", durum: "iletildi" },
  { id: 4, danisan: "Zeynep Arslan", tur: "Tartı Günü", tarih: "Dün 07:00", durum: "iletildi" },
  { id: 5, danisan: "Burak Çelik", tur: "Ödeme Gecikti", tarih: "Dün 10:00", durum: "hata" },
]

const TURKCE_AYLAR_KISA = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]

function neZamanIfadesi(randevuTarih: string): string {
  const bugun = new Date()
  bugun.setHours(0, 0, 0, 0)
  const yarin = new Date(bugun)
  yarin.setDate(yarin.getDate() + 1)

  const rdvDate = new Date(randevuTarih + "T00:00:00")

  const farkMs = rdvDate.getTime() - bugun.getTime()
  const farkGun = Math.round(farkMs / (1000 * 60 * 60 * 24))

  if (farkGun === 0) return "Bugün"
  if (farkGun === 1) return "Yarın"
  if (farkGun > 1) return `${rdvDate.getDate()} ${TURKCE_AYLAR_KISA[rdvDate.getMonth()]}'da`
  return randevuTarih
}

function mesajOlustur(sablon: string, danisan: Danisan, randevu?: Randevu): string {
  const neZaman = randevu ? neZamanIfadesi(randevu.tarih) : "—"
  return sablon
    .replace(/{{ad}}/g, danisan.ad)
    .replace(/{{soyad}}/g, danisan.soyad)
    .replace(/{{ne_zaman}}/g, neZaman)
    .replace(/{{saat}}/g, randevu?.saat ?? "—")
    .replace(/{{tur}}/g, randevu?.tur ?? "—")
    .replace(/{{tarih}}/g, randevu?.tarih ?? "—")
    .replace(/{{diyetisyen}}/g, "Diyetisyen")
    .replace(/{{sure}}/g, "—")
    .replace(/{{tutar}}/g, "—")
    .replace(/{{kalori}}/g, "—")
    .replace(/{{su}}/g, "—")
}

export default function WhatsAppPage() {
  const danisanlar = useDanisanlar()
  const randevular = useRandevular()
  const odemeler = useOdemeler()

  const [baglanti, setBaglanti] = useState<BaglantiDurumu>("disconnected")
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [otomasyonlar, setOtomasyonlar] = useState(baslangicOtomasyonlar)
  const [duzenlenen, setDuzenlenen] = useState<Otomasyon | null>(null)
  const [duzenlenenSablon, setDuzenlenenSablon] = useState("")

  // Hızlı gönderim state
  const [hizliAcik, setHizliAcik] = useState<Otomasyon | null>(null)
  const [seciliDanisan, setSeciliDanisan] = useState<Danisan | null>(null)
  const [onizleme, setOnizleme] = useState("")
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [gonderimSonuc, setGonderimSonuc] = useState<{ ok: boolean; mesaj: string } | null>(null)

  // Test mesaj
  const [testTelefon, setTestTelefon] = useState("")
  const [testMesaj, setTestMesaj] = useState("Merhaba! Bu VitaNorm CRM test mesajıdır. 👋")
  const [testGonderiliyor, setTestGonderiliyor] = useState(false)
  const [testSonuc, setTestSonuc] = useState<{ ok: boolean; mesaj: string } | null>(null)

  // Günlük özet
  const [adminTelefon, setAdminTelefon] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("admin_telefon") ?? "") : ""
  )
  const [ozetGonderiliyor, setOzetGonderiliyor] = useState(false)
  const [ozetSonuc, setOzetSonuc] = useState<{ ok: boolean; mesaj: string } | null>(null)

  function adminTelefonKaydet(val: string) {
    setAdminTelefon(val)
    localStorage.setItem("admin_telefon", val)
  }

  async function ozetGonderSuAnda() {
    if (!adminTelefon.trim()) return
    setOzetGonderiliyor(true)
    setOzetSonuc(null)
    try {
      const res = await fetch("/api/otomasyon/gunluk-ozet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminTelefon: adminTelefon.trim() }),
      })
      const data = await res.json() as { ok: boolean; hata?: string }
      setOzetSonuc(data.ok
        ? { ok: true, mesaj: "Günlük özet gönderildi!" }
        : { ok: false, mesaj: data.hata ?? "Hata oluştu" })
    } catch {
      setOzetSonuc({ ok: false, mesaj: "Bağlantı hatası" })
    } finally {
      setOzetGonderiliyor(false)
      setTimeout(() => setOzetSonuc(null), 4000)
    }
  }

  const pollStatus = useCallback(async () => {
    const res = await fetch("/api/whatsapp/status")
    const data = await res.json() as { state: BaglantiDurumu; qr: string | null }
    setBaglanti(data.state)
    setQrImage(data.qr)
  }, [])

  useEffect(() => { pollStatus() }, [pollStatus])

  useEffect(() => {
    if (baglanti !== "connecting") return
    const interval = setInterval(pollStatus, 2000)
    return () => clearInterval(interval)
  }, [baglanti, pollStatus])

  async function baglan() {
    setBaglanti("connecting")
    await fetch("/api/whatsapp/connect", { method: "POST" })
    await pollStatus()
  }

  async function baglantiKes() {
    await fetch("/api/whatsapp/disconnect", { method: "POST" })
    setBaglanti("disconnected")
    setQrImage(null)
  }

  // Danışan seçince önizleme oluştur
  function danisanSec(d: Danisan) {
    setSeciliDanisan(d)
    if (!hizliAcik) return
    // Bu danışanın yakın randevusunu bul
    const rdv = randevular
      .filter(r => r.danisan_id === d.id && r.durum === "planlandi")
      .sort((a, b) => `${a.tarih}${a.saat}`.localeCompare(`${b.tarih}${b.saat}`))[0]
    setOnizleme(mesajOlustur(hizliAcik.sablon, d, rdv))
    setGonderimSonuc(null)
  }

  async function hizliGonder() {
    if (!seciliDanisan || !onizleme) return
    const telefon = seciliDanisan.telefon
    if (!telefon) {
      setGonderimSonuc({ ok: false, mesaj: "Bu danışanın telefon numarası kayıtlı değil!" })
      return
    }
    setGonderiliyor(true)
    setGonderimSonuc(null)
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: telefon, message: onizleme }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      setGonderimSonuc({
        ok: data.ok,
        mesaj: data.ok
          ? `Mesaj ${seciliDanisan.ad} ${seciliDanisan.soyad}'a gönderildi!`
          : (data.error ?? "Hata oluştu"),
      })
    } catch {
      setGonderimSonuc({ ok: false, mesaj: "Bağlantı hatası" })
    } finally {
      setGonderiliyor(false)
    }
  }

  async function testGonder() {
    if (!testTelefon || !testMesaj) return
    setTestGonderiliyor(true)
    setTestSonuc(null)
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testTelefon, message: testMesaj }),
      })
      const data = await res.json() as { ok: boolean; error?: string }
      setTestSonuc({ ok: data.ok, mesaj: data.ok ? "Mesaj gönderildi!" : (data.error ?? "Hata") })
    } catch {
      setTestSonuc({ ok: false, mesaj: "Bağlantı hatası" })
    } finally {
      setTestGonderiliyor(false)
    }
  }

  function toggleOtomasyon(id: string) {
    setOtomasyonlar(prev => prev.map(o => o.id === id ? { ...o, aktif: !o.aktif } : o))
  }

  function sablonuKaydet() {
    if (!duzenlenen) return
    setOtomasyonlar(prev => prev.map(o => o.id === duzenlenen.id ? { ...o, sablon: duzenlenenSablon } : o))
    setDuzenlenen(null)
  }

  // Otomasyon tipine göre ilgili danışanları getir
  function ilgiliDanisanlar(oto: Otomasyon): Danisan[] {
    if (oto.tip === "randevu") {
      // Yaklaşan randevusu olanlar
      const rdvDanisanIds = new Set(
        randevular
          .filter(r => r.durum === "planlandi" && r.tarih >= "2026-05-05")
          .map(r => r.danisan_id)
      )
      return danisanlar.filter(d => rdvDanisanIds.has(d.id))
    }
    return danisanlar.filter(d => d.durum === "aktif")
  }

  // Gönderim sayılarını gerçek veriden hesapla
  const aktifDanisanSayisi = danisanlar.filter(d => d.durum === 'aktif').length
  const yaklasanRandevuSayisi = randevular.filter(r => r.durum === 'planlandi').length
  const gecikmisOdemeSayisi = odemeler.filter(o => o.durum === 'gecikti').length

  const gonderimSayilari: Record<string, number> = {
    randevu: yaklasanRandevuSayisi,
    su: aktifDanisanSayisi,
    motivasyon: aktifDanisanSayisi,
    tarti: aktifDanisanSayisi,
    paket: aktifDanisanSayisi,
    odeme: gecikmisOdemeSayisi,
  }

  const aktifSayisi = otomasyonlar.filter(o => o.aktif).length
  const toplamGonderim = otomasyonlar
    .filter(o => o.aktif)
    .reduce((s, o) => s + (gonderimSayilari[o.id] ?? 0), 0)

  return (
    <>
      <Header title="WhatsApp Otomasyonları" description="Danışanlara otomatik mesaj gönder" />
      <div className="p-6 space-y-6 max-w-3xl">

        {/* BAĞLANTI */}
        {baglanti === "disconnected" && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 rounded-2xl p-4 shrink-0">
                  <Smartphone className="h-8 w-8 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">WhatsApp henüz bağlı değil</p>
                  <p className="text-sm text-muted-foreground">
                    QR kodu oluştur butonuna basın, telefonunuzda WhatsApp → Bağlı Cihazlar → Cihaz Bağla ile okutun.
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <Button onClick={baglan} className="gap-2">
                <MessageCircle className="h-4 w-4" />QR Kodu Oluştur
              </Button>
            </CardContent>
          </Card>
        )}

        {baglanti === "connecting" && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-6 text-center space-y-4">
              <p className="font-semibold text-lg">Telefonunuzla QR kodu okutun</p>
              <p className="text-sm text-muted-foreground">WhatsApp → Bağlı Cihazlar → Cihaz Bağla → QR kodu okutun</p>
              {qrImage ? (
                <div className="inline-flex bg-white border-2 border-border rounded-2xl p-4 mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrImage} alt="WhatsApp QR Kod" className="w-56 h-56" />
                </div>
              ) : (
                <div className="inline-flex bg-white border-2 border-border rounded-2xl p-12 mx-auto">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" />
                Bağlantı bekleniyor...
              </div>
              <Button variant="outline" size="sm" onClick={baglantiKes}>İptal</Button>
            </CardContent>
          </Card>
        )}

        {baglanti === "connected" && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="bg-emerald-100 rounded-xl p-2.5">
                <Wifi className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">WhatsApp Bağlı</p>
                  <Badge variant="success">Aktif</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Otomasyonlar çalışıyor</p>
              </div>
              <Button variant="outline" size="sm" onClick={baglantiKes} className="gap-1.5 text-destructive border-destructive/30">
                <WifiOff className="h-3.5 w-3.5" />Bağlantıyı Kes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* TEST MESAJ */}
        {baglanti === "connected" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-600" />
                Test Mesajı Gönder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Alıcı Telefon (WhatsApp numarası)</Label>
                <Input placeholder="+90 532 000 0000" value={testTelefon} onChange={e => setTestTelefon(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Mesaj</Label>
                <Textarea rows={3} value={testMesaj} onChange={e => setTestMesaj(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={testGonder} disabled={testGonderiliyor || !testTelefon} className="gap-2">
                  {testGonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Gönder
                </Button>
                {testSonuc && (
                  <div className={`flex items-center gap-1.5 text-sm ${testSonuc.ok ? "text-emerald-600" : "text-destructive"}`}>
                    {testSonuc.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {testSonuc.mesaj}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* HIZLI GÖNDER DIALOG */}
        <Dialog open={!!hizliAcik} onOpenChange={open => { if (!open) { setHizliAcik(null); setSeciliDanisan(null); setOnizleme(""); setGonderimSonuc(null) } }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {hizliAcik && <hizliAcik.icon className="h-5 w-5" />}
                {hizliAcik?.baslik} — Hızlı Gönder
              </DialogTitle>
            </DialogHeader>
            {!gonderimSonuc?.ok && (
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Danışan Seçin</Label>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto border border-border rounded-lg p-2">
                    {hizliAcik && ilgiliDanisanlar(hizliAcik).map(d => (
                      <button
                        key={d.id}
                        onClick={() => danisanSec(d)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                          seciliDanisan?.id === d.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className={`text-xs ${seciliDanisan?.id === d.id ? "bg-primary-foreground/20 text-primary-foreground" : ""}`}>
                            {getInitials(d.ad, d.soyad)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{d.ad} {d.soyad}</p>
                          {d.telefon && <p className={`text-xs truncate ${seciliDanisan?.id === d.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{d.telefon}</p>}
                        </div>
                        {hizliAcik?.tip === "randevu" && (() => {
                          const rdv = randevular.filter(r => r.danisan_id === d.id && r.durum === "planlandi")[0]
                          return rdv ? (
                            <span className={`text-xs shrink-0 ${seciliDanisan?.id === d.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                              {rdv.tarih} {rdv.saat}
                            </span>
                          ) : null
                        })()}
                      </button>
                    ))}
                  </div>
                </div>

                {seciliDanisan && (
                  <div className="space-y-1.5">
                    <Label>Mesaj Önizlemesi</Label>
                    <Textarea
                      rows={8}
                      value={onizleme}
                      onChange={e => setOnizleme(e.target.value)}
                      className="text-sm font-mono"
                    />
                    {!seciliDanisan.telefon && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Bu danışanın telefon numarası kayıtlı değil. Önce danışan profilinden ekleyin.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {gonderimSonuc && (
              <div className={`flex flex-col items-center gap-3 py-6 ${gonderimSonuc.ok ? "text-emerald-600" : "text-destructive"}`}>
                {gonderimSonuc.ok
                  ? <CheckCircle2 className="h-12 w-12" />
                  : <AlertCircle className="h-12 w-12" />}
                <p className="font-semibold text-lg text-center">{gonderimSonuc.mesaj}</p>
                {!gonderimSonuc.ok && (
                  <Button variant="outline" onClick={() => setGonderimSonuc(null)}>Tekrar Dene</Button>
                )}
              </div>
            )}

            {!gonderimSonuc?.ok && (
              <DialogFooter>
                <Button variant="outline" onClick={() => { setHizliAcik(null); setSeciliDanisan(null); setOnizleme(""); setGonderimSonuc(null) }}>
                  İptal
                </Button>
                <Button
                  onClick={hizliGonder}
                  disabled={!seciliDanisan || !onizleme || gonderiliyor || !seciliDanisan.telefon || baglanti !== "connected"}
                  className="gap-2"
                >
                  {gonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Gönder
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="otomasyonlar">
          <TabsList>
            <TabsTrigger value="otomasyonlar" className="gap-1.5">
              <Zap className="h-3.5 w-3.5" />Otomasyonlar
              <Badge variant="default" className="ml-1 text-xs px-1.5">{aktifSayisi}</Badge>
            </TabsTrigger>
            <TabsTrigger value="followup" className="gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />Follow-up
            </TabsTrigger>
            <TabsTrigger value="gecmis" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" />Gönderim Geçmişi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="otomasyonlar" className="mt-5 space-y-3">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Card><CardContent className="p-3 flex items-center gap-2.5">
                <div className="bg-green-50 rounded-lg p-2"><Zap className="h-4 w-4 text-green-600" /></div>
                <div><p className="text-xs text-muted-foreground">Aktif</p><p className="text-lg font-bold">{aktifSayisi}</p></div>
              </CardContent></Card>
              <Card><CardContent className="p-3 flex items-center gap-2.5">
                <div className="bg-blue-50 rounded-lg p-2"><Send className="h-4 w-4 text-blue-600" /></div>
                <div><p className="text-xs text-muted-foreground">Gönderilen</p><p className="text-lg font-bold">{toplamGonderim}</p></div>
              </CardContent></Card>
              <Card><CardContent className="p-3 flex items-center gap-2.5">
                <div className="bg-emerald-50 rounded-lg p-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                <div><p className="text-xs text-muted-foreground">İletim Oranı</p><p className="text-lg font-bold">%97</p></div>
              </CardContent></Card>
            </div>

            {/* ── Günlük Özet ────────────────────────────────────────────────── */}
            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-100 rounded-xl p-2.5 shrink-0">
                    <Calendar className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm">Günlük Özet (Size Gelir)</p>
                      <Badge className="bg-emerald-600 text-white text-xs">Her sabah 08:30</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Bugünkü randevularınız ve aktif danışan özetini her sabah kendi WhatsApp numaranıza alın.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Kendi numaranız (örn: +90 532 000 00 00)"
                        value={adminTelefon}
                        onChange={e => adminTelefonKaydet(e.target.value)}
                        className="flex-1 h-9 text-sm bg-white"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!adminTelefon.trim() || ozetGonderiliyor || baglanti !== "connected"}
                        onClick={ozetGonderSuAnda}
                        className="shrink-0 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      >
                        {ozetGonderiliyor ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Şimdi Gönder
                      </Button>
                    </div>
                    {ozetSonuc && (
                      <p className={`text-xs mt-2 font-medium ${ozetSonuc.ok ? "text-emerald-700" : "text-red-600"}`}>
                        {ozetSonuc.ok ? "✓" : "✗"} {ozetSonuc.mesaj}
                      </p>
                    )}
                    {adminTelefon && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Her sabah 08:30&apos;da otomatik gönderilir — .env dosyasına <code className="bg-muted px-1 rounded text-xs">ADMIN_TELEFON={adminTelefon.replace(/\s/g, '')}</code> ekleyin.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {otomasyonlar.map(oto => (
              <Card key={oto.id} className={`transition-opacity ${!oto.aktif ? "opacity-55" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-xl p-2.5 shrink-0 ${oto.renk}`}>
                      <oto.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm">{oto.baslik}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Hızlı Gönder */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 h-7 text-xs"
                            onClick={() => { setHizliAcik(oto); setSeciliDanisan(null); setOnizleme(""); setGonderimSonuc(null) }}
                          >
                            <Send className="h-3 w-3" />Gönder
                          </Button>
                          {/* Şablon düzenle */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon-sm" onClick={() => { setDuzenlenen(oto); setDuzenlenenSablon(oto.sablon) }}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader><DialogTitle>"{oto.baslik}" Mesaj Şablonu</DialogTitle></DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground leading-5">
                                  <strong className="text-foreground">Kullanabileceğiniz etiketler:</strong><br />
                                  <code>{"{{ad}}"}</code> — Danışan adı &nbsp;·&nbsp;
                                  <code>{"{{saat}}"}</code> — Randevu saati &nbsp;·&nbsp;
                                  <code>{"{{tarih}}"}</code> — Tarih<br />
                                  <code>{"{{diyetisyen}}"}</code> — Sizin adınız &nbsp;·&nbsp;
                                  <code>{"{{tutar}}"}</code> — Ücret &nbsp;·&nbsp;
                                  <code>{"{{sure}}"}</code> — Hafta sayısı
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Mesaj metni</Label>
                                  <Textarea rows={10} value={duzenlenenSablon} onChange={e => setDuzenlenenSablon(e.target.value)} className="font-mono text-xs" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDuzenlenen(null)}>İptal</Button>
                                <Button onClick={sablonuKaydet}>Kaydet</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Switch checked={oto.aktif} onCheckedChange={() => toggleOtomasyon(oto.id)} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-2">{oto.aciklama}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{oto.zamanlama}</span>
                        <span className="flex items-center gap-1"><Send className="h-3 w-3" />{gonderimSayilari[oto.id] ?? 0} danışan</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="followup" className="mt-5">
            <FollowupPanel baglanti={baglanti} />
          </TabsContent>

          <TabsContent value="gecmis" className="mt-5">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-4 px-5 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40">
                    <span>Danışan</span><span>Otomasyon</span><span>Gönderim Zamanı</span><span>Durum</span>
                  </div>
                  {gonderimGecmisi.map(g => (
                    <div key={g.id} className="grid grid-cols-4 px-5 py-3 text-sm items-center">
                      <span className="font-medium">{g.danisan}</span>
                      <span className="text-muted-foreground">{g.tur}</span>
                      <span className="text-muted-foreground text-xs">{g.tarih}</span>
                      <span>
                        {g.durum === "iletildi"
                          ? <Badge variant="success" className="gap-1 text-xs"><CheckCircle2 className="h-3 w-3" />İletildi</Badge>
                          : <Badge variant="destructive" className="gap-1 text-xs"><AlertCircle className="h-3 w-3" />Hata</Badge>}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

// ── Follow-up Panel ───────────────────────────────────────────────────────────

interface FollowupTetikle {
  tip: string
  baslik: string
  aciklama: string
  zamanlama: string
  renk: string
  icon: React.ElementType
}

const FOLLOWUP_TIPLERI: FollowupTetikle[] = [
  {
    tip: "randevu_sonrasi",
    baslik: "Randevu Sonrası",
    aciklama: "Dün tamamlanan randevuların danışanlarına \"Nasıl hissettiniz?\" mesajı gönderilir.",
    zamanlama: "Her gün 10:00",
    renk: "text-blue-600 bg-blue-50",
    icon: Calendar,
  },
  {
    tip: "olcum_hatirlatma",
    baslik: "Ölçüm Hatırlatma",
    aciklama: "7+ gündür kilo girmeyen aktif danışanlara portal'a ölçüm girmeleri için hatırlatma gönderilir.",
    zamanlama: "Her Perşembe 09:00",
    renk: "text-violet-600 bg-violet-50",
    icon: Scale,
  },
  {
    tip: "hareketsiz_danisan",
    baslik: "Hareketsiz Danışan",
    aciklama: "7+ gündür hiç aktivitesi olmayan aktif danışanlara \"Sizi özledik\" mesajı gönderilir. (14 günde bir tekrar eder)",
    zamanlama: "Her Pazartesi 11:00",
    renk: "text-pink-600 bg-pink-50",
    icon: Heart,
  },
  {
    tip: "randevu_yok",
    baslik: "Yeni Randevu Önerisi",
    aciklama: "30+ gündür randevusu olmayan aktif danışanlara yeni randevu daveti gönderilir. (30 günde bir tekrar eder)",
    zamanlama: "Her Pazar 18:00",
    renk: "text-amber-600 bg-amber-50",
    icon: MessageCircle,
  },
]

function FollowupPanel({ baglanti }: { baglanti: BaglantiDurumu }) {
  const [yukleniyor, setYukleniyor] = useState<string | null>(null)
  const [sonuclar, setSonuclar] = useState<Record<string, { ok: boolean; mesaj: string }>>({})
  const [log, setLog] = useState<{ danisanId: string; tip: string; tarih: string; gonderildi: string }[]>([])
  const [logYuklendi, setLogYuklendi] = useState(false)

  async function logYukle() {
    try {
      const res = await fetch("/api/followup/tetikle")
      if (res.ok) {
        const data = await res.json() as { log: typeof log }
        setLog(data.log)
        setLogYuklendi(true)
      }
    } catch { /* sessiz */ }
  }

  async function tetikle(tip: string) {
    if (baglanti !== "connected") {
      setSonuclar(prev => ({ ...prev, [tip]: { ok: false, mesaj: "WhatsApp bağlı değil" } }))
      return
    }
    setYukleniyor(tip)
    setSonuclar(prev => ({ ...prev, [tip]: { ok: false, mesaj: "" } }))
    try {
      const res = await fetch("/api/followup/tetikle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip }),
      })
      const data = await res.json() as { ok: boolean; hata?: string }
      setSonuclar(prev => ({
        ...prev,
        [tip]: { ok: data.ok, mesaj: data.ok ? "Gönderildi ✓" : (data.hata ?? "Hata oluştu") },
      }))
      if (data.ok) logYukle()
    } catch {
      setSonuclar(prev => ({ ...prev, [tip]: { ok: false, mesaj: "Bağlantı hatası" } }))
    } finally {
      setYukleniyor(null)
      setTimeout(() => setSonuclar(prev => ({ ...prev, [tip]: { ok: false, mesaj: "" } })), 4000)
    }
  }

  const tipEtiket: Record<string, string> = {
    randevu_sonrasi: "Randevu Sonrası",
    olcum_hatirlatma: "Ölçüm Hatırlatma",
    hareketsiz_danisan: "Hareketsiz Danışan",
    randevu_yok: "Yeni Randevu Önerisi",
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted/40 rounded-xl px-4 py-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Otomatik Follow-up Sistemi</p>
        <p>Danışanlarınıza belirlenen koşullar oluştuğunda otomatik takip mesajları gönderilir. Her follow-up tipi mükerrer gönderimi önlemek için kendi bekleme süresine sahiptir. "Şimdi Gönder" ile manuel olarak da tetikleyebilirsiniz.</p>
      </div>

      <div className="space-y-3">
        {FOLLOWUP_TIPLERI.map(ft => {
          const sonuc = sonuclar[ft.tip]
          const isLoading = yukleniyor === ft.tip
          return (
            <Card key={ft.tip}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2.5 shrink-0 ${ft.renk}`}>
                    <ft.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm">{ft.baslik}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {sonuc?.mesaj && (
                          <span className={`text-xs font-medium ${sonuc.ok ? "text-emerald-600" : "text-destructive"}`}>
                            {sonuc.mesaj}
                          </span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 h-7 text-xs"
                          onClick={() => tetikle(ft.tip)}
                          disabled={isLoading || baglanti !== "connected"}
                        >
                          {isLoading
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Send className="h-3 w-3" />}
                          Şimdi Gönder
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5">{ft.aciklama}</p>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />{ft.zamanlama}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Follow-up Geçmişi */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Gönderim Geçmişi</p>
            <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={logYukle}>
              <RefreshCw className="h-3 w-3" />Yenile
            </Button>
          </div>
          {!logYuklendi ? (
            <p className="text-xs text-muted-foreground text-center py-4 cursor-pointer hover:text-foreground" onClick={logYukle}>
              Geçmişi görüntülemek için yükle →
            </p>
          ) : log.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Henüz follow-up gönderilmemiş</p>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {log.map((k, i) => (
                <div key={i} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-muted/40">
                  <span className="text-muted-foreground font-mono">{k.danisanId.slice(0, 8)}…</span>
                  <Badge variant="secondary" className="text-xs">{tipEtiket[k.tip] ?? k.tip}</Badge>
                  <span className="text-muted-foreground">{k.tarih}</span>
                  <span className="text-muted-foreground">{new Date(k.gonderildi).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
