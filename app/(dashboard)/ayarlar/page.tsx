"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Lock, Bell, Stethoscope, Check, Upload } from "lucide-react"

const PROFIL_KEY = "ayarlar_profil"
const KLINIK_KEY = "ayarlar_klinik"

type ProfilData = {
  ad: string
  soyad: string
  email: string
  telefon: string
  diplomaNo: string
  uzmanlik: string
}

type KlinikData = {
  ad: string
  telefon: string
  email: string
  adres: string
  ilkGorusme: string
  takipSeans: string
  olcumSeans: string
  seansSuresi: string
}

const PROFIL_VARSAYILAN: ProfilData = {
  ad: "",
  soyad: "",
  email: "",
  telefon: "",
  diplomaNo: "",
  uzmanlik: "",
}

const KLINIK_VARSAYILAN: KlinikData = {
  ad: "",
  telefon: "",
  email: "",
  adres: "",
  ilkGorusme: "500",
  takipSeans: "350",
  olcumSeans: "300",
  seansSuresi: "60",
}

function KaydetButonu({ onClick }: { onClick: () => void }) {
  const [kaydedildi, setKaydedildi] = useState(false)

  function handle() {
    setKaydedildi(true)
    onClick()
    setTimeout(() => setKaydedildi(false), 2500)
  }

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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          aktif ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            aktif ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
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

  // localStorage'dan yükle
  useEffect(() => {
    try {
      const p = localStorage.getItem(PROFIL_KEY)
      if (p) setProfil({ ...PROFIL_VARSAYILAN, ...JSON.parse(p) })
      const k = localStorage.getItem(KLINIK_KEY)
      if (k) setKlinik({ ...KLINIK_VARSAYILAN, ...JSON.parse(k) })
    } catch {}
  }, [])

  function profilKaydet() {
    localStorage.setItem(PROFIL_KEY, JSON.stringify(profil))
  }

  function klinikKaydet() {
    localStorage.setItem(KLINIK_KEY, JSON.stringify(klinik))
  }

  function sifreDegistir() {
    if (!mevcutSifre || !yeniSifre || !yeniSifreTekrar) {
      setSifreMesaji("Lütfen tüm alanları doldurun.")
      setTimeout(() => setSifreMesaji(""), 3000)
      return
    }
    if (yeniSifre !== yeniSifreTekrar) {
      setSifreMesaji("Yeni şifreler eşleşmiyor.")
      setTimeout(() => setSifreMesaji(""), 3000)
      return
    }
    setSifreMesaji("Şifre başarıyla güncellendi.")
    setMevcutSifre("")
    setYeniSifre("")
    setYeniSifreTekrar("")
    setTimeout(() => setSifreMesaji(""), 3000)
  }

  const initials = [profil.ad, profil.soyad]
    .filter(Boolean)
    .map((s) => s[0].toUpperCase())
    .join("") || "Dyt"

  return (
    <>
      <Header title="Ayarlar" description="Hesap ve klinik bilgilerini yönet" />
      <div className="p-6 max-w-2xl">
        <Tabs defaultValue="profil">
          <TabsList className="mb-6">
            <TabsTrigger value="profil" className="gap-1.5">
              <User className="h-3.5 w-3.5" /> Profil
            </TabsTrigger>
            <TabsTrigger value="klinik" className="gap-1.5">
              <Stethoscope className="h-3.5 w-3.5" /> Klinik
            </TabsTrigger>
            <TabsTrigger value="guvenlik" className="gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Güvenlik
            </TabsTrigger>
            <TabsTrigger value="bildirimler" className="gap-1.5">
              <Bell className="h-3.5 w-3.5" /> Bildirimler
            </TabsTrigger>
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
                    <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> Fotoğraf Yükle
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG veya JPG, max 2MB</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Ad</Label>
                    <Input
                      value={profil.ad}
                      onChange={(e) => setProfil({ ...profil, ad: e.target.value })}
                      placeholder="Adınız"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Soyad</Label>
                    <Input
                      value={profil.soyad}
                      onChange={(e) => setProfil({ ...profil, soyad: e.target.value })}
                      placeholder="Soyadınız"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>E-posta</Label>
                    <Input
                      type="email"
                      value={profil.email}
                      onChange={(e) => setProfil({ ...profil, email: e.target.value })}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Telefon</Label>
                    <Input
                      value={profil.telefon}
                      onChange={(e) => setProfil({ ...profil, telefon: e.target.value })}
                      placeholder="+90 5xx xxx xx xx"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Diploma No</Label>
                    <Input
                      value={profil.diplomaNo}
                      onChange={(e) => setProfil({ ...profil, diplomaNo: e.target.value })}
                      placeholder="Diyetisyen diploma numarası"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Uzmanlık Alanları</Label>
                    <Input
                      value={profil.uzmanlik}
                      onChange={(e) => setProfil({ ...profil, uzmanlik: e.target.value })}
                      placeholder="Obezite, Diyabet, Spor Beslenmesi..."
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <KaydetButonu onClick={profilKaydet} />
                </div>
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
                <div className="space-y-1.5">
                  <Label>Klinik / Muayenehane Adı</Label>
                  <Input
                    value={klinik.ad}
                    onChange={(e) => setKlinik({ ...klinik, ad: e.target.value })}
                    placeholder="Klinik adı"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Telefon</Label>
                    <Input
                      value={klinik.telefon}
                      onChange={(e) => setKlinik({ ...klinik, telefon: e.target.value })}
                      placeholder="+90 212 xxx xx xx"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>E-posta</Label>
                    <Input
                      value={klinik.email}
                      onChange={(e) => setKlinik({ ...klinik, email: e.target.value })}
                      placeholder="info@klinik.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Adres</Label>
                  <Input
                    value={klinik.adres}
                    onChange={(e) => setKlinik({ ...klinik, adres: e.target.value })}
                    placeholder="Klinik adresi"
                  />
                </div>
                <Separator />
                <p className="text-sm font-medium text-muted-foreground">Ücretler</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>İlk Görüşme Ücreti (₺)</Label>
                    <Input
                      type="number"
                      value={klinik.ilkGorusme}
                      onChange={(e) => setKlinik({ ...klinik, ilkGorusme: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Takip Seansı Ücreti (₺)</Label>
                    <Input
                      type="number"
                      value={klinik.takipSeans}
                      onChange={(e) => setKlinik({ ...klinik, takipSeans: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ölçüm Seansı Ücreti (₺)</Label>
                    <Input
                      type="number"
                      value={klinik.olcumSeans}
                      onChange={(e) => setKlinik({ ...klinik, olcumSeans: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Varsayılan Seans Süresi (dk)</Label>
                    <Input
                      type="number"
                      value={klinik.seansSuresi}
                      onChange={(e) => setKlinik({ ...klinik, seansSuresi: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <KaydetButonu onClick={klinikKaydet} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GÜVENLİK */}
          <TabsContent value="guvenlik">
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Mevcut Şifre</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={mevcutSifre}
                    onChange={(e) => setMevcutSifre(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Yeni Şifre</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={yeniSifre}
                    onChange={(e) => setYeniSifre(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Yeni Şifre (Tekrar)</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={yeniSifreTekrar}
                    onChange={(e) => setYeniSifreTekrar(e.target.value)}
                  />
                </div>
                {sifreMesaji && (
                  <div className={`rounded-lg px-3 py-2 flex items-center gap-2 text-sm ${
                    sifreMesaji.includes("başarıyla")
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                      : "bg-destructive/10 border border-destructive/20 text-destructive"
                  }`}>
                    <Check className="h-4 w-4" /> {sifreMesaji}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={sifreDegistir}>Şifreyi Güncelle</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BİLDİRİMLER */}
          <TabsContent value="bildirimler">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Tercihleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 divide-y divide-border">
                <BildirimToggle
                  baslik="Randevu hatırlatıcıları"
                  aciklama="Randevudan 1 saat önce bildirim al"
                  varsayilan={true}
                />
                <BildirimToggle
                  baslik="Gelmedi bildirimi"
                  aciklama="Danışan randevuya gelmediğinde uyar"
                  varsayilan={true}
                />
                <BildirimToggle
                  baslik="Ödeme gecikme uyarısı"
                  aciklama="Geciken ödemeleri hatırlat"
                  varsayilan={true}
                />
                <BildirimToggle
                  baslik="Haftalık özet raporu"
                  aciklama="Her Pazartesi haftalık raporu e-posta gönder"
                  varsayilan={false}
                />
                <BildirimToggle
                  baslik="Hedef tamamlama"
                  aciklama="Danışan hedefine ulaştığında bildir"
                  varsayilan={true}
                />
                <BildirimToggle
                  baslik="Yeni öğün fotoğrafı"
                  aciklama="Danışan fotoğraf gönderdiğinde bildir"
                  varsayilan={true}
                />
                <div className="flex justify-end pt-4">
                  <KaydetButonu onClick={() => {}} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
