"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, TrendingDown, TrendingUp } from "lucide-react"
import { useOlcumler, useDanisanlar, crmStore } from "@/lib/crm-store"
import { getInitials, formatTarih, hesaplaBMI, bmiyeGoreEtiket } from "@/lib/utils-crm"
import type { Olcum } from "@/lib/types"

function bosForm(danisanId = '') {
  return {
    danisanId,
    tarih: new Date().toISOString().slice(0, 10),
    kilo: '',
    yag: '',
    kas: '',
    bel: '',
    kalca: '',
    gogus: '',
    kol: '',
    notlar: '',
  }
}

export default function OlcumlerPage() {
  const olcumler = useOlcumler()
  const danisanlar = useDanisanlar()
  const [seciliDanisan, setSeciliDanisan] = useState<string>('tumu')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(bosForm())
  const [hata, setHata] = useState('')

  const danisanMap = Object.fromEntries(danisanlar.map(d => [d.id, d]))

  const filtered = seciliDanisan === 'tumu'
    ? olcumler
    : olcumler.filter(o => o.danisan_id === seciliDanisan)

  const sortedFiltered = [...filtered].sort((a, b) => b.tarih.localeCompare(a.tarih))

  function f(key: keyof typeof form, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function kaydet() {
    if (!form.danisanId) { setHata('Lütfen danışan seçin.'); return }
    if (!form.kilo || isNaN(Number(form.kilo))) { setHata('Geçerli bir kilo girin.'); return }
    setHata('')

    const danisan = danisanMap[form.danisanId]
    const kilo_kg = Number(form.kilo)
    const bmi = danisan?.boy_cm ? hesaplaBMI(kilo_kg, danisan.boy_cm) : undefined

    const yeni: Olcum = {
      id: crypto.randomUUID(),
      danisan_id: form.danisanId,
      tarih: form.tarih,
      kilo_kg,
      bmi: bmi ?? undefined,
      yag_orani: form.yag ? Number(form.yag) : undefined,
      kas_orani: form.kas ? Number(form.kas) : undefined,
      bel_cm: form.bel ? Number(form.bel) : undefined,
      kalca_cm: form.kalca ? Number(form.kalca) : undefined,
      gogus_cm: form.gogus ? Number(form.gogus) : undefined,
      kol_cm: form.kol ? Number(form.kol) : undefined,
      notlar: form.notlar || undefined,
    }

    crmStore.addOlcum(yeni)
    setForm(bosForm())
    setAddOpen(false)
  }

  return (
    <>
      <Header
        title="Ölçümler"
        description="Danışan vücut ölçümlerini takip edin"
        action={
          <Dialog open={addOpen} onOpenChange={open => { setAddOpen(open); if (!open) { setForm(bosForm()); setHata('') } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Ölçüm Gir</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Yeni Ölçüm Girişi</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Danışan</Label>
                    <Select value={form.danisanId} onValueChange={v => f('danisanId', v)}>
                      <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                      <SelectContent>{danisanlar.map(d => <SelectItem key={d.id} value={d.id}>{d.ad} {d.soyad}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tarih</Label>
                    <Input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5"><Label>Kilo (kg) *</Label><Input type="number" step="0.1" placeholder="75.0" value={form.kilo} onChange={e => f('kilo', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Yağ Oranı (%)</Label><Input type="number" step="0.1" placeholder="25.0" value={form.yag} onChange={e => f('yag', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Kas Oranı (%)</Label><Input type="number" step="0.1" placeholder="35.0" value={form.kas} onChange={e => f('kas', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1.5"><Label>Bel (cm)</Label><Input type="number" placeholder="80" value={form.bel} onChange={e => f('bel', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Kalça (cm)</Label><Input type="number" placeholder="95" value={form.kalca} onChange={e => f('kalca', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Göğüs (cm)</Label><Input type="number" placeholder="90" value={form.gogus} onChange={e => f('gogus', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Kol (cm)</Label><Input type="number" placeholder="30" value={form.kol} onChange={e => f('kol', e.target.value)} /></div>
                </div>
                <div className="space-y-1.5"><Label>Notlar</Label><Textarea rows={2} placeholder="Ölçüm notları..." value={form.notlar} onChange={e => f('notlar', e.target.value)} /></div>
                {hata && <p className="text-xs text-destructive">{hata}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>İptal</Button>
                <Button onClick={kaydet}>Kaydet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="p-6 space-y-4">
        <Select value={seciliDanisan} onValueChange={setSeciliDanisan}>
          <SelectTrigger className="h-8 w-48 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tumu">Tüm Danışanlar</SelectItem>
            {danisanlar.map(d => <SelectItem key={d.id} value={d.id}>{d.ad} {d.soyad}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="space-y-3">
          {sortedFiltered.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Henüz ölçüm girilmemiş</CardContent></Card>
          ) : sortedFiltered.map(olcum => {
            const danisan = danisanMap[olcum.danisan_id]
            const bmi = olcum.bmi ?? (danisan?.boy_cm ? hesaplaBMI(olcum.kilo_kg, danisan.boy_cm) : null)
            const bmiInfo = bmi ? bmiyeGoreEtiket(bmi) : null

            const danisanOlcumler = olcumler
              .filter(o => o.danisan_id === olcum.danisan_id)
              .sort((a, b) => a.tarih.localeCompare(b.tarih))
            const idx = danisanOlcumler.findIndex(o => o.id === olcum.id)
            const oncekiOlcum = idx > 0 ? danisanOlcumler[idx - 1] : null
            const kiloDegisim = oncekiOlcum ? Math.round((olcum.kilo_kg - oncekiOlcum.kilo_kg) * 10) / 10 : null

            return (
              <Card key={olcum.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    {danisan && (
                      <Link href={`/danisanlar/${danisan.id}`} className="flex items-center gap-2 hover:text-primary">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">{getInitials(danisan.ad, danisan.soyad)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{danisan.ad} {danisan.soyad}</span>
                      </Link>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{formatTarih(olcum.tarih)}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center">
                    <div className="bg-primary/5 rounded-lg p-2.5">
                      <p className="text-base font-bold text-primary">{olcum.kilo_kg} kg</p>
                      <p className="text-xs text-muted-foreground">Kilo</p>
                      {kiloDegisim !== null && (
                        <p className={`text-xs font-medium flex items-center justify-center gap-0.5 mt-0.5 ${kiloDegisim < 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {kiloDegisim < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                          {kiloDegisim > 0 ? '+' : ''}{kiloDegisim}
                        </p>
                      )}
                    </div>
                    {bmi && bmiInfo && (
                      <div className="bg-muted rounded-lg p-2.5">
                        <p className="text-base font-bold">{bmi}</p>
                        <Badge variant={bmiInfo.variant} className="text-xs mt-0.5">{bmiInfo.etiket}</Badge>
                      </div>
                    )}
                    {olcum.yag_orani && <div className="bg-muted rounded-lg p-2.5"><p className="text-base font-bold">{olcum.yag_orani}%</p><p className="text-xs text-muted-foreground">Yağ</p></div>}
                    {olcum.kas_orani && <div className="bg-muted rounded-lg p-2.5"><p className="text-base font-bold">{olcum.kas_orani}%</p><p className="text-xs text-muted-foreground">Kas</p></div>}
                    {olcum.bel_cm && <div className="bg-muted rounded-lg p-2.5"><p className="text-base font-bold">{olcum.bel_cm}</p><p className="text-xs text-muted-foreground">Bel cm</p></div>}
                    {olcum.kalca_cm && <div className="bg-muted rounded-lg p-2.5"><p className="text-base font-bold">{olcum.kalca_cm}</p><p className="text-xs text-muted-foreground">Kalça cm</p></div>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </>
  )
}
