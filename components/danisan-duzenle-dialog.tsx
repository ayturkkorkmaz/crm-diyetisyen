"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Edit } from "lucide-react"
import { crmStore } from "@/lib/crm-store"
import type { Danisan, HedefTuru, CinsiyetType } from "@/lib/types"

interface Props {
  danisan: Danisan
}

export function DanisanDuzenleDialog({ danisan }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    ad: danisan.ad,
    soyad: danisan.soyad,
    email: danisan.email,
    telefon: danisan.telefon ?? '',
    dogum_tarihi: danisan.dogum_tarihi ?? '',
    cinsiyet: danisan.cinsiyet ?? '',
    boy_cm: danisan.boy_cm?.toString() ?? '',
    baslangic_kilo: danisan.baslangic_kilo?.toString() ?? '',
    hedef_kilo: danisan.hedef_kilo?.toString() ?? '',
    hedef_turu: danisan.hedef_turu ?? '',
    alerjiler: danisan.alerjiler?.join(', ') ?? '',
    hastaliklar: danisan.hastaliklar?.join(', ') ?? '',
    notlar: danisan.notlar ?? '',
  })

  function set(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function kaydet() {
    if (!form.ad || !form.soyad || !form.email) return
    crmStore.updateDanisan({
      ...danisan,
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
      alerjiler: form.alerjiler ? form.alerjiler.split(',').map(s => s.trim()).filter(Boolean) : [],
      hastaliklar: form.hastaliklar ? form.hastaliklar.split(',').map(s => s.trim()).filter(Boolean) : [],
      notlar: form.notlar || undefined,
    })
    setOpen(false)
  }

  return (
    <>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Edit className="h-3.5 w-3.5" />Düzenle
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{danisan.ad} {danisan.soyad} — Düzenle</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ad</Label>
              <Input value={form.ad} onChange={e => set('ad', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Soyad</Label>
              <Input value={form.soyad} onChange={e => set('soyad', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>E-posta</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefon</Label>
              <Input value={form.telefon} onChange={e => set('telefon', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Doğum Tarihi</Label>
              <Input type="date" value={form.dogum_tarihi} onChange={e => set('dogum_tarihi', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Cinsiyet</Label>
              <Select value={form.cinsiyet} onValueChange={v => set('cinsiyet', v)}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kadin">Kadın</SelectItem>
                  <SelectItem value="erkek">Erkek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Boy (cm)</Label>
              <Input type="number" value={form.boy_cm} onChange={e => set('boy_cm', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Başlangıç Kilosu (kg)</Label>
              <Input type="number" value={form.baslangic_kilo} onChange={e => set('baslangic_kilo', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hedef Kilo (kg)</Label>
              <Input type="number" value={form.hedef_kilo} onChange={e => set('hedef_kilo', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hedef Türü</Label>
              <Select value={form.hedef_turu} onValueChange={v => set('hedef_turu', v)}>
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
              <Input
                value={form.alerjiler}
                onChange={e => set('alerjiler', e.target.value)}
                placeholder="Laktoz, Gluten (virgülle ayırın)"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Hastalıklar / Özel Durumlar</Label>
              <Input
                value={form.hastaliklar}
                onChange={e => set('hastaliklar', e.target.value)}
                placeholder="Diyabet, Hipotiroid..."
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Notlar</Label>
              <Textarea rows={3} value={form.notlar} onChange={e => set('notlar', e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={kaydet}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
