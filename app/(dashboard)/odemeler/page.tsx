"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, CreditCard, CheckCircle, Clock } from "lucide-react"
import { useOdemeler, useDanisanlar, crmStore } from "@/lib/crm-store"
import { getInitials, formatPara, formatTarih, getOdemeDurumLabel, getOdemeDurumVariant } from "@/lib/utils-crm"
import type { OdemeDurumu, Odeme } from "@/lib/types"

function bosForm() {
  return {
    danisanId: '',
    tutar: '',
    tarih: new Date().toISOString().slice(0, 10),
    aciklama: '',
    durum: 'odendi' as OdemeDurumu,
    yontem: '' as Odeme['odeme_yontemi'] | '',
  }
}

export default function OdemelerPage() {
  const odemeler = useOdemeler()
  const danisanlar = useDanisanlar()
  const [durumFilter, setDurumFilter] = useState<OdemeDurumu | 'tumu'>('tumu')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(bosForm())
  const [hata, setHata] = useState('')

  const danisanMap = Object.fromEntries(danisanlar.map(d => [d.id, d]))

  const filtered = odemeler.filter(o =>
    durumFilter === 'tumu' || o.durum === durumFilter
  ).sort((a, b) => b.tarih.localeCompare(a.tarih))

  const toplam = odemeler.reduce((s, o) => s + o.tutar, 0)
  const odenen = odemeler.filter(o => o.durum === 'odendi').reduce((s, o) => s + o.tutar, 0)
  const bekleyen = odemeler.filter(o => o.durum !== 'odendi').reduce((s, o) => s + o.tutar, 0)

  const yontemLabel: Record<string, string> = { nakit: 'Nakit', kart: 'Kart', havale: 'Havale' }

  function f<K extends keyof ReturnType<typeof bosForm>>(key: K, val: ReturnType<typeof bosForm>[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function kaydet() {
    if (!form.danisanId) { setHata('Lütfen danışan seçin.'); return }
    if (!form.tutar || isNaN(Number(form.tutar)) || Number(form.tutar) <= 0) { setHata('Geçerli bir tutar girin.'); return }
    if (!form.aciklama.trim()) { setHata('Açıklama zorunludur.'); return }
    setHata('')

    crmStore.addOdeme({
      id: crypto.randomUUID(),
      danisan_id: form.danisanId,
      tarih: form.tarih,
      tutar: Number(form.tutar),
      aciklama: form.aciklama.trim(),
      durum: form.durum,
      odeme_yontemi: (form.yontem || undefined) as Odeme['odeme_yontemi'],
    })
    setForm(bosForm())
    setAddOpen(false)
  }

  return (
    <>
      <Header
        title="Ödemeler"
        description="Danışan ödeme takibi"
        action={
          <Dialog open={addOpen} onOpenChange={open => { setAddOpen(open); if (!open) { setForm(bosForm()); setHata('') } }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Ödeme Ekle</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Yeni Ödeme Kaydı</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Danışan *</Label>
                  <Select value={form.danisanId} onValueChange={v => f('danisanId', v)}>
                    <SelectTrigger><SelectValue placeholder="Danışan seçin" /></SelectTrigger>
                    <SelectContent>{danisanlar.map(d => <SelectItem key={d.id} value={d.id}>{d.ad} {d.soyad}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tutar (₺) *</Label>
                    <Input type="number" placeholder="350" value={form.tutar} onChange={e => f('tutar', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tarih</Label>
                    <Input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Açıklama *</Label>
                  <Input placeholder="Takip seansı" value={form.aciklama} onChange={e => f('aciklama', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Durum</Label>
                    <Select value={form.durum} onValueChange={v => f('durum', v as OdemeDurumu)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="odendi">Ödendi</SelectItem>
                        <SelectItem value="bekliyor">Bekliyor</SelectItem>
                        <SelectItem value="gecikti">Gecikti</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Ödeme Yöntemi</Label>
                    <Select value={form.yontem} onValueChange={v => f('yontem', v as Odeme['odeme_yontemi'])}>
                      <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nakit">Nakit</SelectItem>
                        <SelectItem value="kart">Kart</SelectItem>
                        <SelectItem value="havale">Havale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
        <div className="grid grid-cols-3 gap-3">
          <Card><div className="p-4 flex items-center gap-3">
            <div className="bg-emerald-50 rounded-lg p-2"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-xs text-muted-foreground">Toplam Tahsilat</p><p className="text-xl font-bold">{formatPara(odenen)}</p></div>
          </div></Card>
          <Card><div className="p-4 flex items-center gap-3">
            <div className="bg-amber-50 rounded-lg p-2"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div><p className="text-xs text-muted-foreground">Bekleyen / Geciken</p><p className="text-xl font-bold">{formatPara(bekleyen)}</p></div>
          </div></Card>
          <Card><div className="p-4 flex items-center gap-3">
            <div className="bg-blue-50 rounded-lg p-2"><CreditCard className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-xs text-muted-foreground">Toplam Ciro</p><p className="text-xl font-bold">{formatPara(toplam)}</p></div>
          </div></Card>
        </div>

        <Select value={durumFilter} onValueChange={v => setDurumFilter(v as OdemeDurumu | 'tumu')}>
          <SelectTrigger className="h-8 w-40 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="tumu">Tüm Ödemeler</SelectItem>
            <SelectItem value="odendi">Ödendi</SelectItem>
            <SelectItem value="bekliyor">Bekliyor</SelectItem>
            <SelectItem value="gecikti">Gecikti</SelectItem>
          </SelectContent>
        </Select>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danışan</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead className="hidden sm:table-cell">Tarih</TableHead>
                <TableHead className="hidden md:table-cell">Yöntem</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Kayıt bulunamadı</TableCell>
                </TableRow>
              ) : filtered.map(o => {
                const danisan = danisanMap[o.danisan_id]
                return (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link href={`/danisanlar/${o.danisan_id}`} className="flex items-center gap-2 hover:text-primary">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-xs">
                            {danisan ? getInitials(danisan.ad, danisan.soyad) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{danisan?.ad} {danisan?.soyad}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{o.aciklama}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{formatTarih(o.tarih)}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {o.odeme_yontemi ? yontemLabel[o.odeme_yontemi] : '—'}
                    </TableCell>
                    <TableCell><Badge variant={getOdemeDurumVariant(o.durum)}>{getOdemeDurumLabel(o.durum)}</Badge></TableCell>
                    <TableCell className="text-right font-semibold">{formatPara(o.tutar)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  )
}
