"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft, Phone, Mail, Ruler,
  Target, AlertTriangle, Calendar, TrendingDown, Salad, CreditCard, Plus,
} from "lucide-react"
import { DanisanDuzenleDialog } from "@/components/danisan-duzenle-dialog"
import { useDanisanlar, useOlcumler, useRandevular, useDiyetPlanlari, useOdemeler, crmStore } from "@/lib/crm-store"
import {
  getInitials, getDanisanDurumLabel, getDanisanDurumVariant, getHedefLabel,
  hesaplaYas, hesaplaBMI, bmiyeGoreEtiket, formatPara, formatTarih,
  getRandevuDurumLabel, getRandevuDurumVariant, getOdemeDurumLabel, getOdemeDurumVariant,
} from "@/lib/utils-crm"
import type { Olcum } from "@/lib/types"

interface Props { params: Promise<{ id: string }> }

// Basit SVG kilo trend grafiği
function KiloGrafik({ olcumler }: { olcumler: Olcum[] }) {
  if (olcumler.length < 2) return (
    <p className="text-xs text-muted-foreground text-center py-4">
      Grafik için en az 2 ölçüm gerekli
    </p>
  )

  const sorted = [...olcumler].sort((a, b) => a.tarih.localeCompare(b.tarih))
  const W = 400, H = 120, PAD = 16

  const kilolar = sorted.map(o => o.kilo_kg)
  const minK = Math.min(...kilolar)
  const maxK = Math.max(...kilolar)
  const rangeK = maxK - minK || 1

  const points = sorted.map((o, i) => {
    const x = PAD + (i / (sorted.length - 1)) * (W - PAD * 2)
    const y = PAD + (1 - (o.kilo_kg - minK) / rangeK) * (H - PAD * 2)
    return { x, y, kilo: o.kilo_kg, tarih: o.tarih }
  })

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  // Gradient area path
  const areaPath = `M${points[0].x},${H - PAD} ` +
    points.map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${points[points.length - 1].x},${H - PAD} Z`

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 200 }}>
        <defs>
          <linearGradient id="kiloGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaPath} fill="url(#kiloGrad)" />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots + labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="hsl(var(--primary))" />
            <text
              x={p.x}
              y={p.y - 7}
              textAnchor="middle"
              fontSize="9"
              fill="hsl(var(--foreground))"
              fontWeight="600"
            >{p.kilo}</text>
          </g>
        ))}
        {/* X-axis labels */}
        {points.map((p, i) => (
          <text
            key={`lbl-${i}`}
            x={p.x}
            y={H - 2}
            textAnchor="middle"
            fontSize="8"
            fill="hsl(var(--muted-foreground))"
          >{p.tarih.slice(5)}</text>
        ))}
      </svg>
    </div>
  )
}

function bosForm() {
  return {
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

export default function DanisanDetayPage({ params }: Props) {
  const { id } = use(params)

  const danisanlar = useDanisanlar()
  const tumOlcumler = useOlcumler()
  const tumRandevular = useRandevular()
  const tumPlanlar = useDiyetPlanlari()
  const tumOdemeler = useOdemeler()

  const [olcumDialog, setOlcumDialog] = useState(false)
  const [form, setForm] = useState(bosForm())
  const [hata, setHata] = useState('')

  const danisan = danisanlar.find(d => d.id === id)
  if (!danisan) return notFound()

  const olcumler = tumOlcumler.filter(o => o.danisan_id === id).sort((a, b) => b.tarih.localeCompare(a.tarih))
  const randevular = tumRandevular.filter(r => r.danisan_id === id).sort((a, b) => b.tarih.localeCompare(a.tarih))
  const planlar = tumPlanlar.filter(p => p.danisan_id === id)
  const odemeler = tumOdemeler.filter(o => o.danisan_id === id)

  const sonOlcum = olcumler[0]
  const mevcutKilo = sonOlcum?.kilo_kg ?? danisan.baslangic_kilo
  const bmi = danisan.boy_cm && mevcutKilo ? hesaplaBMI(mevcutKilo, danisan.boy_cm) : null
  const bmiInfo = bmi ? bmiyeGoreEtiket(bmi) : null
  const yas = danisan.dogum_tarihi ? hesaplaYas(danisan.dogum_tarihi) : null

  const kKaybi = danisan.baslangic_kilo && mevcutKilo
    ? Math.round((danisan.baslangic_kilo - mevcutKilo) * 10) / 10
    : 0
  const toplam = danisan.baslangic_kilo && danisan.hedef_kilo
    ? Math.abs(danisan.baslangic_kilo - danisan.hedef_kilo)
    : 0
  const gidilen = danisan.baslangic_kilo && mevcutKilo
    ? Math.abs(danisan.baslangic_kilo - mevcutKilo)
    : 0
  const ilerlemeYuzde = toplam > 0 ? Math.min(100, Math.round((gidilen / toplam) * 100)) : 0

  function f(key: keyof ReturnType<typeof bosForm>, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function kaydet() {
    if (!form.kilo || isNaN(Number(form.kilo))) { setHata('Geçerli bir kilo girin.'); return }
    setHata('')

    const kilo_kg = Number(form.kilo)
    const bmiHesap = danisan.boy_cm ? hesaplaBMI(kilo_kg, danisan.boy_cm) : undefined

    const yeni: Olcum = {
      id: crypto.randomUUID(),
      danisan_id: id,
      tarih: form.tarih,
      kilo_kg,
      bmi: bmiHesap ?? undefined,
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
    setOlcumDialog(false)
  }

  return (
    <>
      <Header title={`${danisan.ad} ${danisan.soyad}`} description={danisan.hedef_turu ? getHedefLabel(danisan.hedef_turu) : ''} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/danisanlar"><ArrowLeft className="h-3.5 w-3.5" />Danışanlara Dön</Link>
          </Button>
          <DanisanDuzenleDialog danisan={danisan} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profil Kartı */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarFallback className="text-2xl">{getInitials(danisan.ad, danisan.soyad)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-semibold">{danisan.ad} {danisan.soyad}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    {yas && <span className="text-sm text-muted-foreground">{yas} yaş</span>}
                    {danisan.cinsiyet && <span className="text-muted-foreground">•</span>}
                    {danisan.cinsiyet && <span className="text-sm text-muted-foreground">{danisan.cinsiyet === 'kadin' ? 'Kadın' : 'Erkek'}</span>}
                  </div>
                  <div className="mt-2">
                    <Badge variant={getDanisanDurumVariant(danisan.durum)}>{getDanisanDurumLabel(danisan.durum)}</Badge>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate text-muted-foreground">{danisan.email}</span>
                  </div>
                  {danisan.telefon && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{danisan.telefon}</span>
                    </div>
                  )}
                  {danisan.boy_cm && (
                    <div className="flex items-center gap-3 text-sm">
                      <Ruler className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>Boy: {danisan.boy_cm} cm</span>
                    </div>
                  )}
                  {danisan.hedef_turu && danisan.hedef_kilo && (
                    <div className="flex items-center gap-3 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{getHedefLabel(danisan.hedef_turu)} → {danisan.hedef_kilo} kg</span>
                    </div>
                  )}
                </div>

                {(danisan.alerjiler?.length || danisan.hastaliklar?.length) ? (
                  <>
                    <Separator className="my-4" />
                    {danisan.alerjiler && danisan.alerjiler.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 mb-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />Alerjiler
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {danisan.alerjiler.map(a => <Badge key={a} variant="warning" className="text-xs">{a}</Badge>)}
                        </div>
                      </div>
                    )}
                    {danisan.hastaliklar && danisan.hastaliklar.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5">Hastalıklar / Özel Durumlar</p>
                        <div className="flex flex-wrap gap-1">
                          {danisan.hastaliklar.map(h => <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>)}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Kilo İlerleme Kartı */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Kilo İlerleme</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-lg font-bold">{danisan.baslangic_kilo}</p>
                    <p className="text-xs text-muted-foreground">Başlangıç</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2">
                    <p className="text-lg font-bold text-primary">{mevcutKilo}</p>
                    <p className="text-xs text-muted-foreground">Şimdi</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-lg font-bold">{danisan.hedef_kilo}</p>
                    <p className="text-xs text-muted-foreground">Hedef</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>İlerleme</span>
                    <span className="font-medium text-primary">{ilerlemeYuzde}%</span>
                  </div>
                  <Progress value={ilerlemeYuzde} className="h-2" />
                </div>
                {kKaybi !== 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    <span className={kKaybi > 0 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                      {kKaybi > 0 ? `−${kKaybi} kg` : `+${Math.abs(kKaybi)} kg`}
                    </span>{' '}değişim
                  </p>
                )}
                {bmi && bmiInfo && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">BMI</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{bmi}</span>
                      <Badge variant={bmiInfo.variant} className="text-xs">{bmiInfo.etiket}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sekmeler */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="olcumler">
              <TabsList>
                <TabsTrigger value="olcumler" className="gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5" />Ölçümler ({olcumler.length})
                </TabsTrigger>
                <TabsTrigger value="randevular" className="gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />Randevular ({randevular.length})
                </TabsTrigger>
                <TabsTrigger value="planlar" className="gap-1.5">
                  <Salad className="h-3.5 w-3.5" />Diyet Planları ({planlar.length})
                </TabsTrigger>
                <TabsTrigger value="odemeler" className="gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />Ödemeler ({odemeler.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="olcumler" className="mt-4 space-y-3">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOlcumDialog(true)}>
                  <Plus className="h-3.5 w-3.5" /> Ölçüm Ekle
                </Button>

                {/* Kilo Trend Grafiği */}
                {olcumler.length >= 2 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Kilo Takibi</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <KiloGrafik olcumler={olcumler} />
                    </CardContent>
                  </Card>
                )}

                {olcumler.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">Henüz ölçüm girilmemiş</CardContent></Card>
                ) : olcumler.map(o => (
                  <Card key={o.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-sm">{formatTarih(o.tarih)}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{o.kilo_kg} kg</span>
                          {o.bmi && <Badge variant={bmiyeGoreEtiket(o.bmi).variant} className="text-xs">BMI {o.bmi}</Badge>}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs text-center">
                        {o.yag_orani && <div className="bg-muted rounded p-1.5"><p className="font-semibold">{o.yag_orani}%</p><p className="text-muted-foreground">Yağ</p></div>}
                        {o.kas_orani && <div className="bg-muted rounded p-1.5"><p className="font-semibold">{o.kas_orani}%</p><p className="text-muted-foreground">Kas</p></div>}
                        {o.bel_cm && <div className="bg-muted rounded p-1.5"><p className="font-semibold">{o.bel_cm} cm</p><p className="text-muted-foreground">Bel</p></div>}
                        {o.kalca_cm && <div className="bg-muted rounded p-1.5"><p className="font-semibold">{o.kalca_cm} cm</p><p className="text-muted-foreground">Kalça</p></div>}
                      </div>
                      {o.notlar && <p className="text-xs text-muted-foreground mt-2">{o.notlar}</p>}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="randevular" className="mt-4 space-y-3">
                <Button size="sm" variant="outline" className="gap-1.5">+ Randevu Ekle</Button>
                {randevular.map(r => (
                  <Card key={r.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-center w-14 shrink-0">
                        <p className="text-sm font-bold">{r.saat}</p>
                        <p className="text-xs text-muted-foreground">{r.sure_dk} dk</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{r.tur}</p>
                        <p className="text-xs text-muted-foreground">{formatTarih(r.tarih)}</p>
                      </div>
                      <Badge variant={getRandevuDurumVariant(r.durum)}>{getRandevuDurumLabel(r.durum)}</Badge>
                      {r.ucret && <p className="text-sm font-medium shrink-0">{formatPara(r.ucret)}</p>}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="planlar" className="mt-4 space-y-3">
                <Button size="sm" variant="outline" asChild className="gap-1.5">
                  <Link href="/diyet-planlari">+ Diyet Planı Oluştur</Link>
                </Button>
                {planlar.map(p => (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{p.baslik}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatTarih(p.baslangic_tarihi)}</p>
                          {p.gunluk_kalori_hedefi && <p className="text-xs text-muted-foreground">Günlük hedef: {p.gunluk_kalori_hedefi} kcal</p>}
                        </div>
                        <div className="flex gap-2">
                          {p.aktif && <Badge variant="success">Aktif</Badge>}
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/diyet-planlari/${p.id}`}>Görüntüle</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="odemeler" className="mt-4 space-y-3">
                {odemeler.map(o => (
                  <Card key={o.id}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{o.aciklama}</p>
                        <p className="text-xs text-muted-foreground">{formatTarih(o.tarih)}{o.odeme_yontemi && ` • ${o.odeme_yontemi}`}</p>
                      </div>
                      <Badge variant={getOdemeDurumVariant(o.durum)}>{getOdemeDurumLabel(o.durum)}</Badge>
                      <p className="text-sm font-semibold shrink-0">{formatPara(o.tutar)}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Ölçüm Ekleme Dialogu */}
      <Dialog open={olcumDialog} onOpenChange={open => { setOlcumDialog(open); if (!open) { setForm(bosForm()); setHata('') } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Yeni Ölçüm — {danisan.ad} {danisan.soyad}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tarih</Label>
                <Input type="date" value={form.tarih} onChange={e => f('tarih', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Kilo (kg) *</Label>
                <Input type="number" step="0.1" placeholder="75.0" value={form.kilo} onChange={e => f('kilo', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            <Button variant="outline" onClick={() => setOlcumDialog(false)}>İptal</Button>
            <Button onClick={kaydet}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
