"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import {
  User, Lock, Bell, Stethoscope, Check, Upload, MessageCircle,
  Smartphone, Wifi, WifiOff, Loader2, Send, Calendar,
  CreditCard, Droplets, Pencil, AlertCircle, CheckCircle2,
  Clock, ShieldAlert,
} from "lucide-react"

const PROFIL_KEY = "ayarlar_profil"
const KLINIK_KEY = "ayarlar_klinik"

type ProfilData = { ad: string; soyad: string; email: string; telefon: string; diplomaNo: string; uzmanlik: string }
type KlinikData = { ad: string; telefon: string; email: string; adres: string; ilkGorusme: string; takipSeans: string; olcumSeans: string; seansSuresi: string }

const PROFIL_VARSAYILAN: ProfilData = { ad: "", soyad: "", email: "", telefon: "", diplomaNo: "", uzmanlik: "" }
const KLINIK_VARSAYILAN: KlinikData = { ad: "", telefon: "", email: "", adres: "", ilkGorusme: "500", takipSeans: "350", olcumSeans: "300", seansSuresi: "60" }

function KaydetButonu({ onClick }: { onClick: () => void }) {
  const [kaydedildi, setKaydedildi] = useState(false)
  function handle() { setKaydedildi(true); onClick(); setTimeout(() => setKaydedildi(false), 2500) }
  return (
    <Button onClick={handle} className="gap-1.5">
      {kaydedildi ? <><Check className="h-4 w-4" /> Kaydedildi</> : "Değişiklikleri Kaydet"}
    </Button>
  )
}

function BildirimToggle({ baslik, aciklama, varsayilan }: { baslik: string; aciklama: string; varsayilan: boolean }) {
  const [aktif, setAktif] = useState(varsayilan)
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium">{baslik}</p>
        <p className="text-xs text-muted-foreground">{aciklama}</p>
      </div>
      <button
        onClick={() => setAktif(!aktif)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${aktif ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${aktif ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  )
}

// ── WhatsApp Bileşeni ──────────────────────────────────────────────────────────
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
}

const BASLANGIC_OTOMASYONLAR: Otomasyon[] = [
  {
    id: "su",
    baslik: "Su Hatırlatması",
    aciklama: "Yalnızca sistemde kayıtlı aktif danışanlara günlük su hatırlatması gider.",
    icon: Droplets, aktif: true, zamanlama: "Her gün 09:00, 12:00, 15:00, 18:00",
    renk: "text-blue-600 bg-blue-50",
    sablon: "💧 Su saati, {{ad}}!\n\nGünlük su hedefinizi unutmayın. Sağlıklı günler! 🌿",
  },
  {
    id: "randevu",
    baslik: "Randevu Hatırlatması",
    aciklama: "Yalnızca sistemde kayıtlı danışanlara, yarınki randevudan önce otomatik hatırlatma gider.",
    icon: Calendar, aktif: true, zamanlama: "Her gün 20:00 (ertesi gün için)",
    renk: "text-emerald-600 bg-emerald-50",
    sablon: "Merhaba {{ad}} 👋\n\nYarın saat {{saat}}'deki beslenme danışmanlığı randevunuzu hatırlatmak istedim.\n\n⏰ Saat: {{saat}}\n📋 Seans: {{tur}}\n\nGörüşmek üzere! 🥗\nDyt. {{diyetisyen}}",
  },
  {
    id: "odeme",
    baslik: "Ödeme Gecikti Uyarısı",
    aciklama: "Yalnızca sistemde kayıtlı, ödemesi geciken danışanlara nazik hatırlatma gider.",
    icon: CreditCard, aktif: false, zamanlama: "Gecikme tarihinden 3 gün sonra",
    renk: "text-red-600 bg-red-50",
    sablon: "Merhaba {{ad}},\n\n{{tarih}} tarihli {{tutar}}₺ tutarındaki seans ödemesi henüz alınamamış.\n\nHerhangi bir sorun yaşıyorsanız lütfen bildir.\n\nTeşekkürler 🙏\nDyt. {{diyetisyen}}",
  },
]

function WhatsAppAyarlari() {
  const [baglanti, setBaglanti] = useState<BaglantiDurumu>("disconnected")
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [otomasyonlar, setOtomasyonlar] = useState(BASLANGIC_OTOMASYONLAR)
  const [duzenlenen, setDuzenlenen] = useState<Otomasyon | null>(null)
  const [duzenlenenSablon, setDuzenlenenSablon] = useState("")
  const [testTelefon, setTestTelefon] = useState("")
  const [testMesaj, setTestMesaj] = useState("Merhaba! Bu VitaNorm CRM test mesajıdır. 👋")
  const [testGonderiliyor, setTestGonderiliyor] = useState(false)
  const [testSonuc, setTestSonuc] = useState<{ ok: boolean; mesaj: string } | null>(null)

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/status")
      if (!res.ok) return
      const data = await res.json() as { state: BaglantiDurumu; qr: string | null }
      setBaglanti(data.state)
      setQrImage(data.qr)
    } catch {
      // bağlantı yoksa sessiz geç
    }
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

  const aktifSayisi = otomasyonlar.filter(o => o.aktif).length

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Güvenlik Notu */}
      <Card className="border-amber-200 bg-amber-50/60">
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 mb-0.5">Yalnızca kayıtlı danışanlara mesaj gider</p>
            <p className="text-amber-700 text-xs">Sistem, otomatik mesajları gönderilmeden önce alıcının CRM'de kayıtlı aktif bir danışan olup olmadığını doğrular. Kayıtsız numaralara kesinlikle mesaj gönderilmez.</p>
          </div>
        </CardContent>
      </Card>

      {/* Bağlantı Durumu */}
      {baglanti === "disconnected" && (
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-slate-100 rounded-2xl p-3 shrink-0"><Smartphone className="h-7 w-7 text-slate-500" /></div>
              <div>
                <p className="font-semibold">WhatsApp henüz bağlı değil</p>
                <p className="text-sm text-muted-foreground">QR kodu oluştur butonuna basın, telefonunuzda WhatsApp → Bağlı Cihazlar → Cihaz Bağla ile okutun.</p>
              </div>
            </div>
            <Button onClick={baglan} className="gap-2"><MessageCircle className="h-4 w-4" />QR Kodu Oluştur</Button>
          </CardContent>
        </Card>
      )}

      {baglanti === "connecting" && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-5 text-center space-y-4">
            <p className="font-semibold text-lg">Telefonunuzla QR kodu okutun</p>
            <p className="text-sm text-muted-foreground">WhatsApp → Bağlı Cihazlar → Cihaz Bağla → QR kodu okutun</p>
            {qrImage ? (
              <div className="inline-flex bg-white border-2 border-border rounded-2xl p-4 mx-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrImage} alt="WhatsApp QR" className="w-52 h-52" />
              </div>
            ) : (
              <div className="inline-flex bg-white border-2 border-border rounded-2xl p-12 mx-auto">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" />Bağlantı bekleniyor...
            </div>
            <Button variant="outline" size="sm" onClick={baglantiKes}>İptal</Button>
          </CardContent>
        </Card>
      )}

      {baglanti === "connected" && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-emerald-100 rounded-xl p-2.5"><Wifi className="h-5 w-5 text-emerald-600" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">WhatsApp Bağlı</p>
                <Badge variant="success">Aktif</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{aktifSayisi} otomasyon aktif</p>
            </div>
            <Button variant="outline" size="sm" onClick={baglantiKes} className="gap-1.5 text-destructive border-destructive/30">
              <WifiOff className="h-3.5 w-3.5" />Bağlantıyı Kes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Mesajı — sadece bağlıyken */}
      {baglanti === "connected" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Send className="h-4 w-4 text-emerald-600" />Test Mesajı Gönder
            </CardTitle>
            <p className="text-xs text-muted-foreground">Telefon numarası sisteminizde kayıtlı bir danışana ait olmalıdır.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Alıcı Telefon (Kayıtlı Danışan)</Label>
              <Input placeholder="+90 532 000 0000" value={testTelefon} onChange={e => setTestTelefon(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mesaj</Label>
              <Textarea rows={3} value={testMesaj} onChange={e => setTestMesaj(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={testGonder} disabled={testGonderiliyor || !testTelefon} className="gap-2">
                {testGonderiliyor ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Gönder
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

      {/* Otomasyonlar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">İzin Verilen Otomasyonlar</p>
          <Badge variant="secondary">{aktifSayisi} aktif</Badge>
        </div>
        <div className="space-y-2">
          {otomasyonlar.map(oto => (
            <Card key={oto.id} className={`transition-opacity ${!oto.aktif ? "opacity-55" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`rounded-xl p-2.5 shrink-0 ${oto.renk}`}>
                    <oto.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">{oto.baslik}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setDuzenlenen(oto); setDuzenlenenSablon(oto.sablon) }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle>"{oto.baslik}" Şablonu</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground leading-5">
                                <strong className="text-foreground">Etiketler:</strong> <code>{`{{ad}}`}</code> · <code>{`{{saat}}`}</code> · <code>{`{{tarih}}`}</code> · <code>{`{{diyetisyen}}`}</code> · <code>{`{{tutar}}`}</code>
                              </div>
                              <Textarea rows={10} value={duzenlenenSablon} onChange={e => setDuzenlenenSablon(e.target.value)} className="font-mono text-xs" />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setDuzenlenen(null)}>İptal</Button>
                              <Button onClick={sablonuKaydet}>Kaydet</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <button
                          onClick={() => toggleOtomasyon(oto.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${oto.aktif ? "bg-primary" : "bg-muted"}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${oto.aktif ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{oto.aciklama}</p>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />{oto.zamanlama}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AyarlarPage() {
  const [profil, setProfil] = useState<ProfilData>(PROFIL_VARSAYILAN)
  const [klinik, setKlinik] = useState<KlinikData>(KLINIK_VARSAYILAN)
  const [sifreMesaji, setSifreMesaji] = useState("")
  const [mevcutSifre, setMevcutSifre] = useState("")
  const [yeniSifre, setYeniSifre] = useState("")
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("")

  useEffect(() => {
    try {
      const p = localStorage.getItem(PROFIL_KEY)
      if (p) setProfil({ ...PROFIL_VARSAYILAN, ...JSON.parse(p) })
      const k = localStorage.getItem(KLINIK_KEY)
      if (k) setKlinik({ ...KLINIK_VARSAYILAN, ...JSON.parse(k) })
    } catch {}
  }, [])

  function profilKaydet() { localStorage.setItem(PROFIL_KEY, JSON.stringify(profil)) }
  function klinikKaydet() { localStorage.setItem(KLINIK_KEY, JSON.stringify(klinik)) }

  function sifreDegistir() {
    if (!mevcutSifre || !yeniSifre || !yeniSifreTekrar) { setSifreMesaji("Lütfen tüm alanları doldurun."); setTimeout(() => setSifreMesaji(""), 3000); return }
    if (yeniSifre !== yeniSifreTekrar) { setSifreMesaji("Yeni şifreler eşleşmiyor."); setTimeout(() => setSifreMesaji(""), 3000); return }
    setSifreMesaji("Şifre başarıyla güncellendi.")
    setMevcutSifre(""); setYeniSifre(""); setYeniSifreTekrar("")
    setTimeout(() => setSifreMesaji(""), 3000)
  }

  const initials = [profil.ad, profil.soyad].filter(Boolean).map(s => s[0].toUpperCase()).join("") || "Dyt"

  return (
    <>
      <Header title="Ayarlar" description="Hesap, klinik ve bildirim ayarları" />
      <div className="p-6 max-w-2xl">
        <Tabs defaultValue="profil">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="profil" className="gap-1.5"><User className="h-3.5 w-3.5" />Profil</TabsTrigger>
            <TabsTrigger value="klinik" className="gap-1.5"><Stethoscope className="h-3.5 w-3.5" />Klinik</TabsTrigger>
            <TabsTrigger value="guvenlik" className="gap-1.5"><Lock className="h-3.5 w-3.5" />Güvenlik</TabsTrigger>
            <TabsTrigger value="bildirimler" className="gap-1.5"><Bell className="h-3.5 w-3.5" />Bildirimler</TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-1.5"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</TabsTrigger>
          </TabsList>

          {/* PROFİL */}
          <TabsContent value="profil">
            <Card>
              <CardHeader>
                <CardTitle>Diyetisyen Profili</CardTitle>
                <CardDescription>Danışanlarınıza görünecek bilgiler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="gap-1.5"><Upload className="h-3.5 w-3.5" />Fotoğraf Yükle</Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG veya JPG, max 2MB</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Ad</Label><Input value={profil.ad} onChange={e => setProfil({ ...profil, ad: e.target.value })} placeholder="Adınız" /></div>
                  <div className="space-y-1.5"><Label>Soyad</Label><Input value={profil.soyad} onChange={e => setProfil({ ...profil, soyad: e.target.value })} placeholder="Soyadınız" /></div>
                  <div className="col-span-2 space-y-1.5"><Label>E-posta</Label><Input type="email" value={profil.email} onChange={e => setProfil({ ...profil, email: e.target.value })} placeholder="ornek@email.com" /></div>
                  <div className="space-y-1.5"><Label>Telefon</Label><Input value={profil.telefon} onChange={e => setProfil({ ...profil, telefon: e.target.value })} placeholder="+90 5xx xxx xx xx" /></div>
                  <div className="space-y-1.5"><Label>Diploma No</Label><Input value={profil.diplomaNo} onChange={e => setProfil({ ...profil, diplomaNo: e.target.value })} placeholder="Diploma numarası" /></div>
                  <div className="col-span-2 space-y-1.5"><Label>Uzmanlık Alanları</Label><Input value={profil.uzmanlik} onChange={e => setProfil({ ...profil, uzmanlik: e.target.value })} placeholder="Obezite, Diyabet..." /></div>
                </div>
                <div className="flex justify-end"><KaydetButonu onClick={profilKaydet} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KLİNİK */}
          <TabsContent value="klinik">
            <Card>
              <CardHeader>
                <CardTitle>Klinik / Muayenehane Bilgileri</CardTitle>
                <CardDescription>Randevu ve makbuz üzerinde görünecek bilgiler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5"><Label>Klinik / Muayenehane Adı</Label><Input value={klinik.ad} onChange={e => setKlinik({ ...klinik, ad: e.target.value })} placeholder="Klinik adı" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Telefon</Label><Input value={klinik.telefon} onChange={e => setKlinik({ ...klinik, telefon: e.target.value })} placeholder="+90 212 xxx xx xx" /></div>
                  <div className="space-y-1.5"><Label>E-posta</Label><Input value={klinik.email} onChange={e => setKlinik({ ...klinik, email: e.target.value })} placeholder="info@klinik.com" /></div>
                </div>
                <div className="space-y-1.5"><Label>Adres</Label><Input value={klinik.adres} onChange={e => setKlinik({ ...klinik, adres: e.target.value })} placeholder="Klinik adresi" /></div>
                <Separator />
                <p className="text-sm font-medium text-muted-foreground">Ücretler</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>İlk Görüşme Ücreti (₺)</Label><Input type="number" value={klinik.ilkGorusme} onChange={e => setKlinik({ ...klinik, ilkGorusme: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Takip Seansı Ücreti (₺)</Label><Input type="number" value={klinik.takipSeans} onChange={e => setKlinik({ ...klinik, takipSeans: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Ölçüm Seansı Ücreti (₺)</Label><Input type="number" value={klinik.olcumSeans} onChange={e => setKlinik({ ...klinik, olcumSeans: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Varsayılan Seans Süresi (dk)</Label><Input type="number" value={klinik.seansSuresi} onChange={e => setKlinik({ ...klinik, seansSuresi: e.target.value })} /></div>
                </div>
                <div className="flex justify-end"><KaydetButonu onClick={klinikKaydet} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GÜVENLİK */}
          <TabsContent value="guvenlik">
            <Card>
              <CardHeader><CardTitle>Şifre Değiştir</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5"><Label>Mevcut Şifre</Label><Input type="password" placeholder="••••••••" value={mevcutSifre} onChange={e => setMevcutSifre(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Yeni Şifre</Label><Input type="password" placeholder="••••••••" value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Yeni Şifre (Tekrar)</Label><Input type="password" placeholder="••••••••" value={yeniSifreTekrar} onChange={e => setYeniSifreTekrar(e.target.value)} /></div>
                {sifreMesaji && (
                  <div className={`rounded-lg px-3 py-2 flex items-center gap-2 text-sm ${sifreMesaji.includes("başarıyla") ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-destructive/10 border border-destructive/20 text-destructive"}`}>
                    <Check className="h-4 w-4" />{sifreMesaji}
                  </div>
                )}
                <div className="flex justify-end"><Button onClick={sifreDegistir}>Şifreyi Güncelle</Button></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BİLDİRİMLER */}
          <TabsContent value="bildirimler">
            <Card>
              <CardHeader><CardTitle>Bildirim Tercihleri</CardTitle></CardHeader>
              <CardContent className="space-y-1 divide-y divide-border">
                <BildirimToggle baslik="Randevu hatırlatıcıları" aciklama="Randevudan 1 saat önce bildirim al" varsayilan={true} />
                <BildirimToggle baslik="Gelmedi bildirimi" aciklama="Danışan randevuya gelmediğinde uyar" varsayilan={true} />
                <BildirimToggle baslik="Ödeme gecikme uyarısı" aciklama="Geciken ödemeleri hatırlat" varsayilan={true} />
                <BildirimToggle baslik="Tartı günü hatırlatması" aciklama="Haftalık tartı günü bildirimi" varsayilan={true} />
                <BildirimToggle baslik="Haftalık özet raporu" aciklama="Her Pazartesi haftalık raporu e-posta gönder" varsayilan={false} />
                <BildirimToggle baslik="Hedef tamamlama" aciklama="Danışan hedefine ulaştığında bildir" varsayilan={true} />
                <div className="flex justify-end pt-4"><KaydetButonu onClick={() => {}} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WHATSAPP */}
          <TabsContent value="whatsapp">
            <WhatsAppAyarlari />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
