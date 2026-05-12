"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  DollarSign, Plus, Pencil, Trash2, Check, Star,
  Package, Clock, TrendingDown,
} from "lucide-react"

const FIYAT_KEY = "fiyatlandirma_paketler"
const SAATLIK_KEY = "fiyatlandirma_saatlik"

interface Paket {
  id: string
  ad: string
  sure: string
  fiyat: number
  aciklama: string
  ozellikler: string[]
  populer: boolean
  renk: string
}

interface SaatlikFiyat {
  ilkGorusme: string
  takipSeans: string
  olcumSeans: string
  online: string
  grupSeans: string
}

const VARSAYILAN_SAATLIK: SaatlikFiyat = {
  ilkGorusme: "500",
  takipSeans: "350",
  olcumSeans: "300",
  online: "300",
  grupSeans: "200",
}

const RENK_SECENEKLER = [
  { renk: "bg-blue-50 border-blue-200 text-blue-700", label: "Mavi" },
  { renk: "bg-emerald-50 border-emerald-200 text-emerald-700", label: "Yeşil" },
  { renk: "bg-violet-50 border-violet-200 text-violet-700", label: "Mor" },
  { renk: "bg-amber-50 border-amber-200 text-amber-700", label: "Turuncu" },
  { renk: "bg-rose-50 border-rose-200 text-rose-700", label: "Pembe" },
]

const VARSAYILAN_PAKETLER: Paket[] = [
  {
    id: "p1",
    ad: "Başlangıç Paketi",
    sure: "1 Ay",
    fiyat: 1500,
    aciklama: "Sağlıklı beslenmeye başlangıç için ideal",
    ozellikler: ["İlk Görüşme", "2 Takip Seansı", "Haftalık Diyet Planı", "WhatsApp Desteği"],
    populer: false,
    renk: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    id: "p2",
    ad: "Standart Paket",
    sure: "3 Ay",
    fiyat: 3800,
    aciklama: "En çok tercih edilen program",
    ozellikler: ["İlk Görüşme", "5 Takip Seansı", "Aylık Ölçüm", "Haftalık Diyet Planı", "WhatsApp Desteği"],
    populer: true,
    renk: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  {
    id: "p3",
    ad: "Premium Paket",
    sure: "6 Ay",
    fiyat: 6500,
    aciklama: "Kapsamlı ve sürdürülebilir değişim",
    ozellikler: ["İlk Görüşme", "10 Takip Seansı", "Aylık Ölçüm", "Haftalık Diyet Planı", "Online Görüşme", "Öncelikli Destek"],
    populer: false,
    renk: "bg-violet-50 border-violet-200 text-violet-700",
  },
]

function bosForm(): Omit<Paket, "id"> {
  return {
    ad: "", sure: "", fiyat: 0, aciklama: "", ozellikler: [],
    populer: false, renk: "bg-blue-50 border-blue-200 text-blue-700",
  }
}

function KaydetButonu({ onClick }: { onClick: () => void }) {
  const [kaydedildi, setKaydedildi] = useState(false)
  function handle() { setKaydedildi(true); onClick(); setTimeout(() => setKaydedildi(false), 2500) }
  return (
    <Button onClick={handle} className="gap-1.5">
      {kaydedildi ? <><Check className="h-4 w-4" />Kaydedildi</> : "Kaydet"}
    </Button>
  )
}

export default function FiyatlandirmaPage() {
  const [paketler, setPaketler] = useState<Paket[]>(VARSAYILAN_PAKETLER)
  const [saatlik, setSaatlik] = useState<SaatlikFiyat>(VARSAYILAN_SAATLIK)
  const [addOpen, setAddOpen] = useState(false)
  const [duzenleId, setDuzenleId] = useState<string | null>(null)
  const [form, setForm] = useState(bosForm())
  const [ozellikText, setOzellikText] = useState("")
  const [silOnayId, setSilOnayId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const p = localStorage.getItem(FIYAT_KEY)
      if (p) setPaketler(JSON.parse(p))
      const s = localStorage.getItem(SAATLIK_KEY)
      if (s) setSaatlik({ ...VARSAYILAN_SAATLIK, ...JSON.parse(s) })
    } catch {}
  }, [])

  function saatlikKaydet() { localStorage.setItem(SAATLIK_KEY, JSON.stringify(saatlik)) }

  function paketKaydet() {
    if (!form.ad || !form.fiyat) return
    const ozellikler = ozellikText.split("\n").map(s => s.trim()).filter(Boolean)
    if (duzenleId) {
      const guncellendi = paketler.map(p => p.id === duzenleId ? { ...form, id: duzenleId, ozellikler } : p)
      setPaketler(guncellendi)
      localStorage.setItem(FIYAT_KEY, JSON.stringify(guncellendi))
    } else {
      const yeni: Paket = { ...form, id: `p-${Date.now()}`, ozellikler }
      const yeniList = [...paketler, yeni]
      setPaketler(yeniList)
      localStorage.setItem(FIYAT_KEY, JSON.stringify(yeniList))
    }
    setAddOpen(false); setDuzenleId(null); setForm(bosForm()); setOzellikText("")
  }

  function duzenle(p: Paket) {
    setForm({ ad: p.ad, sure: p.sure, fiyat: p.fiyat, aciklama: p.aciklama, ozellikler: p.ozellikler, populer: p.populer, renk: p.renk })
    setOzellikText(p.ozellikler.join("\n"))
    setDuzenleId(p.id); setAddOpen(true)
  }

  function sil(id: string) {
    const yeni = paketler.filter(p => p.id !== id)
    setPaketler(yeni); localStorage.setItem(FIYAT_KEY, JSON.stringify(yeni))
    setSilOnayId(null)
  }

  function togglePopuler(id: string) {
    const guncellendi = paketler.map(p => ({ ...p, populer: p.id === id ? !p.populer : false }))
    setPaketler(guncellendi); localStorage.setItem(FIYAT_KEY, JSON.stringify(guncellendi))
  }

  return (
    <>
      <Header
        title="Fiyatlandırma"
        description="Seans ücretleri ve program paketleri"
        action={
          <Button size="sm" className="gap-1.5" onClick={() => { setForm(bosForm()); setOzellikText(""); setDuzenleId(null); setAddOpen(true) }}>
            <Plus className="h-3.5 w-3.5" />Paket Ekle
          </Button>
        }
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Seans Ücretleri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Bireysel Seans Ücretleri</CardTitle>
            <CardDescription>Tekil seans başı ücretler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {[
                { key: "ilkGorusme" as keyof SaatlikFiyat, label: "İlk Görüşme", icon: "🤝" },
                { key: "takipSeans" as keyof SaatlikFiyat, label: "Takip Seansı", icon: "📊" },
                { key: "olcumSeans" as keyof SaatlikFiyat, label: "Ölçüm Seansı", icon: "⚖️" },
                { key: "online" as keyof SaatlikFiyat, label: "Online Görüşme", icon: "💻" },
                { key: "grupSeans" as keyof SaatlikFiyat, label: "Grup Seansı", icon: "👥" },
              ].map(({ key, label, icon }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="flex items-center gap-1.5"><span>{icon}</span>{label} (₺)</Label>
                  <Input
                    type="number"
                    value={saatlik[key]}
                    onChange={e => setSaatlik(prev => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <KaydetButonu onClick={saatlikKaydet} />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Program Paketleri */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2"><Package className="h-5 w-5 text-primary" />Program Paketleri</h2>
              <p className="text-sm text-muted-foreground">Danışanlara sunduğunuz özel programlar</p>
            </div>
          </div>

          {paketler.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Henüz paket eklenmemiş</p>
                <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setAddOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />İlk Paketi Ekle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paketler.map(p => (
                <Card key={p.id} className={`relative border-2 ${p.populer ? "border-primary" : "border-border"}`}>
                  {p.populer && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gap-1 bg-primary text-primary-foreground px-3">
                        <Star className="h-3 w-3" />En Popüler
                      </Badge>
                    </div>
                  )}
                  <CardContent className={`p-5 rounded-xl ${p.renk.split(" ").slice(0, 2).join(" ")}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-base">{p.ad}</p>
                        <p className={`text-xs mt-0.5 ${p.renk.split(" ")[2]}`}>{p.sure}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => duzenle(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setSilOnayId(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-3xl font-bold">{p.fiyat.toLocaleString("tr-TR")}</span>
                      <span className="text-sm text-muted-foreground">₺</span>
                      {p.sure && <span className="text-xs text-muted-foreground">/ {p.sure}</span>}
                    </div>

                    {p.aciklama && <p className="text-xs text-muted-foreground mb-3">{p.aciklama}</p>}

                    <div className="space-y-1.5 mb-4">
                      {p.ozellikler.map((oz, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <Check className={`h-3.5 w-3.5 shrink-0 ${p.renk.split(" ")[2]}`} />
                          <span>{oz}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 text-xs h-8 gap-1 ${p.populer ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" : ""}`}
                        onClick={() => togglePopuler(p.id)}
                      >
                        <Star className="h-3 w-3" />
                        {p.populer ? "Popüler Kaldır" : "Popüler Yap"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Kazanç Özeti */}
        {paketler.length > 0 && (
          <Card className="bg-muted/30 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-emerald-600" />
                Fiyat Karşılaştırması
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paketler.map(p => {
                  const takipSeansSayisi = p.ozellikler.filter(o => o.toLowerCase().includes("takip")).length
                  const saatlikFiyat = Number(saatlik.ilkGorusme) + takipSeansSayisi * Number(saatlik.takipSeans)
                  const tasarruf = saatlikFiyat > p.fiyat ? saatlikFiyat - p.fiyat : 0
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{p.ad}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{p.fiyat.toLocaleString("tr-TR")} ₺</span>
                        {tasarruf > 0 && (
                          <Badge variant="success" className="text-xs">
                            {tasarruf.toLocaleString("tr-TR")} ₺ tasarruf
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paket Ekle/Düzenle Dialog */}
      <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) { setForm(bosForm()); setOzellikText(""); setDuzenleId(null) } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {duzenleId ? "Paketi Düzenle" : "Yeni Paket Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Paket Adı <span className="text-destructive">*</span></Label>
                <Input placeholder="Başlangıç Paketi" value={form.ad} onChange={e => setForm(p => ({ ...p, ad: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Süre</Label>
                <Input placeholder="3 Ay" value={form.sure} onChange={e => setForm(p => ({ ...p, sure: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Fiyat (₺) <span className="text-destructive">*</span></Label>
                <Input type="number" placeholder="3800" value={form.fiyat || ""} onChange={e => setForm(p => ({ ...p, fiyat: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Açıklama</Label>
              <Input placeholder="Kısa açıklama..." value={form.aciklama} onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Özellikler (her satıra bir özellik)</Label>
              <Textarea
                rows={5}
                placeholder={"İlk Görüşme\n2 Takip Seansı\nHaftalık Diyet Planı"}
                value={ozellikText}
                onChange={e => setOzellikText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Kart Rengi</Label>
              <div className="flex gap-2 flex-wrap">
                {RENK_SECENEKLER.map(r => (
                  <button
                    key={r.renk}
                    onClick={() => setForm(p => ({ ...p, renk: r.renk }))}
                    className={`px-3 py-1.5 rounded-lg text-xs border-2 font-medium transition-all ${r.renk} ${form.renk === r.renk ? "ring-2 ring-primary ring-offset-1" : ""}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="populer"
                checked={form.populer}
                onChange={e => setForm(p => ({ ...p, populer: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              <Label htmlFor="populer" className="cursor-pointer">En Popüler olarak işaretle</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>İptal</Button>
            <Button onClick={paketKaydet} disabled={!form.ad || !form.fiyat}>
              {duzenleId ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sil Onay */}
      <Dialog open={!!silOnayId} onOpenChange={open => { if (!open) setSilOnayId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />Paketi Sil
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Bu paketi silmek istediğinizden emin misiniz?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSilOnayId(null)}>İptal</Button>
            <Button variant="destructive" onClick={() => silOnayId && sil(silOnayId)}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
