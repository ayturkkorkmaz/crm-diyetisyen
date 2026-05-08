"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Phone, Mail, Target, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react"
import { useDanisanlar, crmStore } from "@/lib/crm-store"
import { getInitials, getDanisanDurumLabel, getDanisanDurumVariant, getHedefLabel, hesaplaYas, hesaplaBMI, bmiyeGoreEtiket } from "@/lib/utils-crm"
import type { DanisanDurumu, HedefTuru, CinsiyetType } from "@/lib/types"

const BOŞ_FORM = {
  ad: "", soyad: "", email: "", telefon: "",
  dogum_tarihi: "", cinsiyet: "" as CinsiyetType | "",
  boy_cm: "", baslangic_kilo: "", hedef_kilo: "",
  hedef_turu: "" as HedefTuru | "",
  alerjiler: "", hastaliklar: "", notlar: "",
}

export default function DanisanlarPage() {
  const danisanlar = useDanisanlar()
  const [search, setSearch] = useState("")
  const [durumFilter, setDurumFilter] = useState<DanisanDurumu | "tumu">("tumu")
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(BOŞ_FORM)
  const [kaydedildi, setKaydedildi] = useState(false)
  const [silOnayId, setSilOnayId] = useState<string | null>(null)

  const filtered = danisanlar.filter(d => {
    const matchSearch = search === "" || `${d.ad} ${d.soyad} ${d.email}`.toLowerCase().includes(search.toLowerCase())
    const matchDurum = durumFilter === "tumu" || d.durum === durumFilter
    return matchSearch && matchDurum
  })

  function set(k: keyof typeof form, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function kaydet() {
    if (!form.ad || !form.soyad || !form.email) return
    crmStore.addDanisan({
      id: `d-${Date.now()}`,
      created_at: new Date().toISOString(),
      kayit_tarihi: new Date().toISOString().slice(0, 10),
      ad: form.ad.trim(),
      soyad: form.soyad.trim(),
      email: form.email.trim(),
      telefon: form.telefon || undefined,
      dogum_tarihi: form.dogum_tarihi || undefined,
      cinsiyet: (form.cinsiyet as CinsiyetType) || undefined,
      boy_cm: form.boy_cm ? Number(form.boy_cm) : undefined,
      baslangic_kilo: form.baslangic_kilo ? Number(form.baslangic_kilo) : undefined,
      hedef_kilo: form.hedef_kilo ? Number(form.hedef_kilo) : undefined,
      hedef_turu: (form.hedef_turu as HedefTuru) || undefined,
      durum: "aktif",
      alerjiler: form.alerjiler ? form.alerjiler.split(",").map(s => s.trim()).filter(Boolean) : [],
      hastaliklar: form.hastaliklar ? form.hastaliklar.split(",").map(s => s.trim()).filter(Boolean) : [],
      notlar: form.notlar || undefined,
    })
    setKaydedildi(true)
    setTimeout(() => {
      setAddOpen(false)
      setForm(BOŞ_FORM)
      setKaydedildi(false)
    }, 800)
  }

  return (
    <>
      <Header
        title="Danışanlar"
        description={`${danisanlar.length} danışan kayıtlı`}
        action={
          <Dialog open={addOpen} onOpenChange={v => { setAddOpen(v); if (!v) { setForm(BOŞ_FORM); setKaydedildi(false) } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Danışan Ekle</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Yeni Danışan Ekle</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Ad <span className="text-destructive">*</span></Label>
                  <Input placeholder="Berkay" value={form.ad} onChange={e => set("ad", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Soyad <span className="text-destructive">*</span></Label>
                  <Input placeholder="Sırtaş" value={form.soyad} onChange={e => set("soyad", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>E-posta <span className="text-destructive">*</span></Label>
                  <Input type="email" placeholder="berkay@gmail.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefon</Label>
                  <Input placeholder="+90 532 000 0000" value={form.telefon} onChange={e => set("telefon", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Doğum Tarihi</Label>
                  <Input type="date" value={form.dogum_tarihi} onChange={e => set("dogum_tarihi", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Cinsiyet</Label>
                  <Select value={form.cinsiyet} onValueChange={v => set("cinsiyet", v)}>
                    <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kadin">Kadın</SelectItem>
                      <SelectItem value="erkek">Erkek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Boy (cm)</Label>
                  <Input type="number" placeholder="175" value={form.boy_cm} onChange={e => set("boy_cm", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Başlangıç Kilosu (kg)</Label>
                  <Input type="number" placeholder="80" value={form.baslangic_kilo} onChange={e => set("baslangic_kilo", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Hedef Kilo (kg)</Label>
                  <Input type="number" placeholder="70" value={form.hedef_kilo} onChange={e => set("hedef_kilo", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Hedef Türü</Label>
                  <Select value={form.hedef_turu} onValueChange={v => set("hedef_turu", v)}>
                    <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kilo_verme">Kilo Verme</SelectItem>
                      <SelectItem value="kilo_alma">Kilo Alma</SelectItem>
                      <SelectItem value="koruma">Kilo Koruma</SelectItem>
                      <SelectItem value="kas_kazanimi">Kas Kazanımı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Alerjiler</Label>
                  <Input placeholder="Laktoz, Gluten (virgülle ayırın)" value={form.alerjiler} onChange={e => set("alerjiler", e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Hastalıklar / Özel Durumlar</Label>
                  <Input placeholder="Diyabet, Hipotiroid..." value={form.hastaliklar} onChange={e => set("hastaliklar", e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Notlar</Label>
                  <Textarea rows={3} placeholder="Danışan hakkında ek notlar..." value={form.notlar} onChange={e => set("notlar", e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>İptal</Button>
                <Button
                  onClick={kaydet}
                  disabled={!form.ad || !form.soyad || !form.email || kaydedildi}
                  className="gap-1.5"
                >
                  {kaydedildi ? <><CheckCircle2 className="h-4 w-4" />Eklendi!</> : "Kaydet"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="İsim veya e-posta ara..."
              className="pl-8 h-8 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={durumFilter} onValueChange={v => setDurumFilter(v as DanisanDurumu | "tumu")}>
            <SelectTrigger className="h-8 w-36 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tumu">Tüm Danışanlar</SelectItem>
              <SelectItem value="aktif">Aktif</SelectItem>
              <SelectItem value="pasif">Pasif</SelectItem>
              <SelectItem value="beklemede">Beklemede</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danışan</TableHead>
                <TableHead className="hidden md:table-cell">İletişim</TableHead>
                <TableHead className="hidden sm:table-cell">Boy / Kilo</TableHead>
                <TableHead className="hidden lg:table-cell">BMI</TableHead>
                <TableHead className="hidden lg:table-cell">Hedef</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="hidden xl:table-cell">Alerjiler</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    Danışan bulunamadı
                  </TableCell>
                </TableRow>
              ) : filtered.map(d => {
                const yas = d.dogum_tarihi ? hesaplaYas(d.dogum_tarihi) : null
                const bmi = d.boy_cm && d.baslangic_kilo ? hesaplaBMI(d.baslangic_kilo, d.boy_cm) : null
                const bmiInfo = bmi ? bmiyeGoreEtiket(bmi) : null
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link href={`/danisanlar/${d.id}`} className="flex items-center gap-3 hover:text-primary">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback>{getInitials(d.ad, d.soyad)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{d.ad} {d.soyad}</p>
                          {yas && <p className="text-xs text-muted-foreground">{yas} yaş • {d.cinsiyet === "kadin" ? "Kadın" : "Erkek"}</p>}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{d.email}</p>
                        {d.telefon && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{d.telefon}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {d.boy_cm && d.baslangic_kilo ? <span>{d.boy_cm} cm / {d.baslangic_kilo} kg</span> : "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {bmi && bmiInfo ? (
                        <div>
                          <span className="text-sm font-medium">{bmi}</span>
                          <Badge variant={bmiInfo.variant} className="ml-1.5 text-xs">{bmiInfo.etiket}</Badge>
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {d.hedef_turu && d.hedef_kilo ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="h-3 w-3" />
                          {getHedefLabel(d.hedef_turu)} → {d.hedef_kilo} kg
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getDanisanDurumVariant(d.durum)}>{getDanisanDurumLabel(d.durum)}</Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {d.alerjiler && d.alerjiler.length > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          {d.alerjiler.join(", ")}
                        </div>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/danisanlar/${d.id}`}>Profili Görüntüle</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`/randevular`}>Randevu Ekle</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`/danisanlar/${d.id}?tab=olcumler`}>Ölçüm Gir</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setSilOnayId(d.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Silme Onay Dialogu */}
      <Dialog open={!!silOnayId} onOpenChange={open => { if (!open) setSilOnayId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />Danışanı Sil
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {(() => {
              const d = danisanlar.find(x => x.id === silOnayId)
              return d ? `"${d.ad} ${d.soyad}" adlı danışanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.` : ""
            })()}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSilOnayId(null)}>İptal</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (silOnayId) crmStore.deleteDanisan(silOnayId)
                setSilOnayId(null)
              }}
            >
              Evet, Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
