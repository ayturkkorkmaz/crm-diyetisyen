"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  UserPlus, Phone, Mail, Search, Plus, MoreHorizontal,
  CheckCircle2, Clock, MessageCircle, ArrowRight, Trash2,
  CalendarDays, AlertCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDanisanlar, crmStore } from "@/lib/crm-store"
import type { CinsiyetType, HedefTuru } from "@/lib/types"
import { useRouter } from "next/navigation"

type LeadDurumu = "yeni" | "takipte" | "ilgileniyor" | "cevap_yok" | "donustu" | "vazgecti"

interface Lead {
  id: string
  ad: string
  soyad: string
  telefon?: string
  email?: string
  kaynak?: string
  notlar?: string
  durum: LeadDurumu
  olusturma_tarihi: string
  son_temas?: string
  sonraki_temas?: string
  followup_sayisi: number
}

const DURUM_LABEL: Record<LeadDurumu, string> = {
  yeni: "Yeni",
  takipte: "Takipte",
  ilgileniyor: "İlgileniyor",
  cevap_yok: "Cevap Yok",
  donustu: "Dönüştü",
  vazgecti: "Vazgeçti",
}

const DURUM_VARIANT: Record<LeadDurumu, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  yeni: "default",
  takipte: "warning",
  ilgileniyor: "secondary",
  cevap_yok: "destructive",
  donustu: "success",
  vazgecti: "secondary",
}

const KAYNAK_SECENEKLER = ["Telefon", "WhatsApp", "Instagram", "Tavsiye", "Web Sitesi", "Diğer"]

const BASLANGIC_LEADLER: Lead[] = [
  {
    id: "l1",
    ad: "Selin",
    soyad: "Koç",
    telefon: "+90 532 111 2233",
    email: "selin@gmail.com",
    kaynak: "Instagram",
    notlar: "Kilo vermek istiyor, 15 kg hedefi var. Fiyat sordu.",
    durum: "takipte",
    olusturma_tarihi: "2026-05-01",
    son_temas: "2026-05-08",
    sonraki_temas: "2026-05-15",
    followup_sayisi: 2,
  },
  {
    id: "l2",
    ad: "Emre",
    soyad: "Yıldız",
    telefon: "+90 545 999 8877",
    kaynak: "Tavsiye",
    notlar: "Arkadaşı danışanımız. Kas yapmak istiyor.",
    durum: "ilgileniyor",
    olusturma_tarihi: "2026-05-03",
    son_temas: "2026-05-10",
    followup_sayisi: 1,
  },
  {
    id: "l3",
    ad: "Nazlı",
    soyad: "Güneş",
    telefon: "+90 501 444 5566",
    kaynak: "WhatsApp",
    notlar: "Fiyat sordu sonra cevap vermedi.",
    durum: "cevap_yok",
    olusturma_tarihi: "2026-04-28",
    son_temas: "2026-05-02",
    followup_sayisi: 3,
  },
]

const BOŞ_LEAD: Omit<Lead, "id" | "olusturma_tarihi" | "followup_sayisi"> = {
  ad: "",
  soyad: "",
  telefon: "",
  email: "",
  kaynak: "",
  notlar: "",
  durum: "yeni",
}

const BOŞ_DONUSUM_FORM = {
  boy_cm: "",
  baslangic_kilo: "",
  hedef_kilo: "",
  hedef_turu: "" as HedefTuru | "",
  dogum_tarihi: "",
  cinsiyet: "" as CinsiyetType | "",
}

function gunFarki(tarih: string): number {
  const t = new Date(tarih + "T00:00:00")
  const bugun = new Date()
  bugun.setHours(0, 0, 0, 0)
  return Math.round((bugun.getTime() - t.getTime()) / (1000 * 60 * 60 * 24))
}

function formatTarih(tarih: string): string {
  return new Date(tarih + "T00:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })
}

export default function PotansiyelMusterilerPage() {
  const danisanlar = useDanisanlar()
  const router = useRouter()
  const [leadler, setLeadler] = useState<Lead[]>(BASLANGIC_LEADLER)
  const [search, setSearch] = useState("")
  const [durumFilter, setDurumFilter] = useState<LeadDurumu | "tumu">("tumu")
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ ...BOŞ_LEAD })
  const [kaydedildi, setKaydedildi] = useState(false)
  const [donusumOpen, setDonusumOpen] = useState<Lead | null>(null)
  const [donusumForm, setDonusumForm] = useState({ ...BOŞ_DONUSUM_FORM })
  const [notDialog, setNotDialog] = useState<Lead | null>(null)
  const [notText, setNotText] = useState("")
  const [silOnayId, setSilOnayId] = useState<string | null>(null)

  const filtered = leadler.filter(l => {
    const matchSearch = !search || `${l.ad} ${l.soyad} ${l.telefon ?? ""} ${l.email ?? ""}`.toLowerCase().includes(search.toLowerCase())
    const matchDurum = durumFilter === "tumu" || l.durum === durumFilter
    return matchSearch && matchDurum
  })

  const istatistik = {
    toplam: leadler.filter(l => l.durum !== "donustu" && l.durum !== "vazgecti").length,
    takipte: leadler.filter(l => l.durum === "takipte").length,
    ilgileniyor: leadler.filter(l => l.durum === "ilgileniyor").length,
    donustu: leadler.filter(l => l.durum === "donustu").length,
    cevapYok: leadler.filter(l => l.durum === "cevap_yok").length,
  }

  function set(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function kaydet() {
    if (!form.ad || !form.soyad) return
    const yeni: Lead = {
      id: `l-${Date.now()}`,
      ...form,
      olusturma_tarihi: new Date().toISOString().slice(0, 10),
      son_temas: new Date().toISOString().slice(0, 10),
      followup_sayisi: 0,
    }
    setLeadler(prev => [yeni, ...prev])
    setKaydedildi(true)
    setTimeout(() => { setAddOpen(false); setForm({ ...BOŞ_LEAD }); setKaydedildi(false) }, 700)
  }

  function durumGuncelle(id: string, yeniDurum: LeadDurumu) {
    setLeadler(prev => prev.map(l => l.id === id ? {
      ...l,
      durum: yeniDurum,
      son_temas: new Date().toISOString().slice(0, 10),
      followup_sayisi: l.followup_sayisi + 1,
    } : l))
  }

  function notKaydet() {
    if (!notDialog) return
    setLeadler(prev => prev.map(l => l.id === notDialog.id ? {
      ...l,
      notlar: notText,
      son_temas: new Date().toISOString().slice(0, 10),
    } : l))
    setNotDialog(null)
    setNotText("")
  }

  function danisanaDonustur() {
    if (!donusumOpen) return
    crmStore.addDanisan({
      id: `d-${Date.now()}`,
      created_at: new Date().toISOString(),
      kayit_tarihi: new Date().toISOString().slice(0, 10),
      ad: donusumOpen.ad,
      soyad: donusumOpen.soyad,
      email: donusumOpen.email ?? `${donusumOpen.ad.toLowerCase()}.${donusumOpen.soyad.toLowerCase()}@girilmedi.com`,
      telefon: donusumOpen.telefon,
      dogum_tarihi: donusumForm.dogum_tarihi || undefined,
      cinsiyet: (donusumForm.cinsiyet as CinsiyetType) || undefined,
      boy_cm: donusumForm.boy_cm ? Number(donusumForm.boy_cm) : undefined,
      baslangic_kilo: donusumForm.baslangic_kilo ? Number(donusumForm.baslangic_kilo) : undefined,
      hedef_kilo: donusumForm.hedef_kilo ? Number(donusumForm.hedef_kilo) : undefined,
      hedef_turu: (donusumForm.hedef_turu as HedefTuru) || undefined,
      durum: "aktif",
      notlar: donusumOpen.notlar,
    })
    setLeadler(prev => prev.map(l => l.id === donusumOpen.id ? { ...l, durum: "donustu" as LeadDurumu } : l))
    setDonusumOpen(null)
    setDonusumForm({ ...BOŞ_DONUSUM_FORM })
    router.push("/danisanlar")
  }

  return (
    <>
      <Header
        title="Potansiyel Müşteriler"
        description="Satış öncesi lead takibi ve otomatik follow-up"
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" />Lead Ekle
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Aktif Lead", value: istatistik.toplam, color: "text-blue-600 bg-blue-50" },
            { label: "Takipte", value: istatistik.takipte, color: "text-amber-600 bg-amber-50" },
            { label: "İlgileniyor", value: istatistik.ilgileniyor, color: "text-violet-600 bg-violet-50" },
            { label: "Cevap Yok", value: istatistik.cevapYok, color: "text-red-600 bg-red-50" },
            { label: "Danışana Dönüştü", value: istatistik.donustu, color: "text-emerald-600 bg-emerald-50" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-3 text-center">
                <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Follow-up Bilgi Kutusu */}
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-xl p-2 shrink-0">
                <MessageCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Otomatik Follow-up Sistemi</p>
                <p className="text-xs text-blue-700 mt-0.5 leading-5">
                  Potansiyel müşterileriniz <strong>WhatsApp Ayarları</strong> üzerinden otomatik takip edilir.
                  İlk temastan itibaren <strong>3. gün, 7. gün ve 14. gün</strong> otomatik mesaj gönderilir.
                  Danışana dönüştüğünde follow-up durur. <strong>Hiçbir manuel işlem gerektirmez.</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtreler */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="İsim, telefon ara..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={durumFilter} onValueChange={v => setDurumFilter(v as LeadDurumu | "tumu")}>
            <SelectTrigger className="h-8 w-40 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tumu">Tüm Durumlar</SelectItem>
              {(Object.keys(DURUM_LABEL) as LeadDurumu[]).map(d => (
                <SelectItem key={d} value={d}>{DURUM_LABEL[d]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lead Listesi */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Kayıt bulunamadı.</p>
              </CardContent>
            </Card>
          ) : filtered.map(l => {
            const sonTemasFarki = l.son_temas ? gunFarki(l.son_temas) : null
            const acil = sonTemasFarki !== null && sonTemasFarki >= 7 && l.durum !== "donustu" && l.durum !== "vazgecti"
            return (
              <Card key={l.id} className={acil ? "border-amber-300" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        l.durum === "donustu" ? "bg-emerald-100 text-emerald-700" :
                        l.durum === "cevap_yok" ? "bg-red-100 text-red-700" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {l.ad[0]}{l.soyad[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{l.ad} {l.soyad}</p>
                          <Badge variant={DURUM_VARIANT[l.durum]} className="text-xs">{DURUM_LABEL[l.durum]}</Badge>
                          {acil && (
                            <Badge variant="warning" className="text-xs gap-1">
                              <AlertCircle className="h-3 w-3" />{sonTemasFarki}g temas yok
                            </Badge>
                          )}
                          {l.followup_sayisi > 0 && (
                            <span className="text-xs text-muted-foreground">{l.followup_sayisi} follow-up</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          {l.telefon && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{l.telefon}</span>}
                          {l.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{l.email}</span>}
                          {l.kaynak && <span>Kaynak: {l.kaynak}</span>}
                          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatTarih(l.olusturma_tarihi)}</span>
                        </div>
                        {l.notlar && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{l.notlar}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {l.durum !== "donustu" && l.durum !== "vazgecti" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs h-8 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => { setDonusumOpen(l); setDonusumForm({ ...BOŞ_DONUSUM_FORM }) }}
                        >
                          <ArrowRight className="h-3 w-3" />
                          Danışana Dönüştür
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => { setNotDialog(l); setNotText(l.notlar ?? "") }}>
                            <MessageCircle className="h-3.5 w-3.5 mr-2" />Not Güncelle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => durumGuncelle(l.id, "takipte")}>
                            <Clock className="h-3.5 w-3.5 mr-2" />Takipte İşaretle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => durumGuncelle(l.id, "ilgileniyor")}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />İlgileniyor İşaretle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => durumGuncelle(l.id, "cevap_yok")}>
                            <AlertCircle className="h-3.5 w-3.5 mr-2" />Cevap Yok İşaretle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => durumGuncelle(l.id, "vazgecti")} className="text-muted-foreground">
                            Vazgeçti İşaretle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setSilOnayId(l.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" />Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Lead Ekle Dialog */}
      <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) { setForm({ ...BOŞ_LEAD }); setKaydedildi(false) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserPlus className="h-4 w-4" />Yeni Potansiyel Müşteri</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ad <span className="text-destructive">*</span></Label>
                <Input placeholder="Adı" value={form.ad} onChange={e => set("ad", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Soyad <span className="text-destructive">*</span></Label>
                <Input placeholder="Soyadı" value={form.soyad} onChange={e => set("soyad", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Telefon</Label>
                <Input placeholder="+90 5xx xxx xx xx" value={form.telefon} onChange={e => set("telefon", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>E-posta</Label>
                <Input type="email" placeholder="email@gmail.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Kaynak</Label>
              <Select value={form.kaynak} onValueChange={v => set("kaynak", v)}>
                <SelectTrigger><SelectValue placeholder="Nereden geldi?" /></SelectTrigger>
                <SelectContent>
                  {KAYNAK_SECENEKLER.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>İlk Görüşme Notu</Label>
              <Textarea rows={3} placeholder="Ne istiyor? Hedefi? Endişeleri?" value={form.notlar} onChange={e => set("notlar", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>İptal</Button>
            <Button onClick={kaydet} disabled={!form.ad || !form.soyad || kaydedildi} className="gap-1.5">
              {kaydedildi ? <><CheckCircle2 className="h-4 w-4" />Eklendi!</> : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Not Güncelle Dialog */}
      <Dialog open={!!notDialog} onOpenChange={open => { if (!open) { setNotDialog(null); setNotText("") } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Not Güncelle — {notDialog?.ad} {notDialog?.soyad}</DialogTitle></DialogHeader>
          <Textarea rows={5} value={notText} onChange={e => setNotText(e.target.value)} placeholder="Görüşme notu..." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotDialog(null)}>İptal</Button>
            <Button onClick={notKaydet}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Danışana Dönüştür Dialog */}
      <Dialog open={!!donusumOpen} onOpenChange={open => { if (!open) { setDonusumOpen(null); setDonusumForm({ ...BOŞ_DONUSUM_FORM }) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <ArrowRight className="h-5 w-5" />
              Danışana Dönüştür
            </DialogTitle>
          </DialogHeader>
          <div className="bg-emerald-50 rounded-xl p-3 text-sm text-emerald-800">
            <strong>{donusumOpen?.ad} {donusumOpen?.soyad}</strong> danışan listesine eklenecek.
            Ek bilgileri girmek ister misiniz?
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Doğum Tarihi</Label>
                <Input type="date" value={donusumForm.dogum_tarihi} onChange={e => setDonusumForm(p => ({ ...p, dogum_tarihi: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Cinsiyet</Label>
                <Select value={donusumForm.cinsiyet} onValueChange={v => setDonusumForm(p => ({ ...p, cinsiyet: v as CinsiyetType }))}>
                  <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kadin">Kadın</SelectItem>
                    <SelectItem value="erkek">Erkek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Boy (cm)</Label>
                <Input type="number" placeholder="175" value={donusumForm.boy_cm} onChange={e => setDonusumForm(p => ({ ...p, boy_cm: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Başlangıç Kilosu (kg)</Label>
                <Input type="number" placeholder="80" value={donusumForm.baslangic_kilo} onChange={e => setDonusumForm(p => ({ ...p, baslangic_kilo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Hedef Kilo (kg)</Label>
                <Input type="number" placeholder="70" value={donusumForm.hedef_kilo} onChange={e => setDonusumForm(p => ({ ...p, hedef_kilo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Hedef Türü</Label>
                <Select value={donusumForm.hedef_turu} onValueChange={v => setDonusumForm(p => ({ ...p, hedef_turu: v as HedefTuru }))}>
                  <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kilo_verme">Kilo Verme</SelectItem>
                    <SelectItem value="kilo_alma">Kilo Alma</SelectItem>
                    <SelectItem value="koruma">Kilo Koruma</SelectItem>
                    <SelectItem value="kas_kazanimi">Kas Kazanımı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Separator />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDonusumOpen(null)}>İptal</Button>
            <Button onClick={danisanaDonustur} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4" />Danışan Olarak Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sil Onay */}
      <Dialog open={!!silOnayId} onOpenChange={open => { if (!open) setSilOnayId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />Lead Sil
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Bu kaydı silmek istediğinizden emin misiniz?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSilOnayId(null)}>İptal</Button>
            <Button variant="destructive" onClick={() => { setLeadler(prev => prev.filter(l => l.id !== silOnayId)); setSilOnayId(null) }}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
