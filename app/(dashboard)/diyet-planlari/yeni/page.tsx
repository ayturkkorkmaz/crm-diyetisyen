"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronRight, ChevronLeft, Check, Plus, Trash2,
  Salad, Utensils, Copy, ChevronDown, ChevronUp, Flame,
} from "lucide-react"
import { demoDanisanlar } from "@/lib/demo-data"
import { besinAra, type Besin } from "@/lib/besin-kalori"

// ─── Tipler ───────────────────────────────────────────────────────────────────
interface OgunSablonu {
  id: string; ad: string; tur: 'ana' | 'ara'; saat: string
}
interface BesinItem {
  id: string; ad: string; miktar: string; kalori: number | null
}
type GunPlan = Record<string, BesinItem[]>

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const GUNLER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const ANA_OGUN_ADLARI: Record<number, string[]> = {
  1: ['Öğün'],
  2: ['Kahvaltı', 'Akşam Yemeği'],
  3: ['Kahvaltı', 'Öğle Yemeği', 'Akşam Yemeği'],
  4: ['Kahvaltı', 'Öğle Yemeği', 'İkindi Kahvaltısı', 'Akşam Yemeği'],
  5: ['Kahvaltı', 'Kuşluk', 'Öğle Yemeği', 'İkindi', 'Akşam Yemeği'],
  6: ['Sabah Kahvaltısı', 'Kuşluk', 'Öğle Yemeği', 'İkindi', 'Akşam Yemeği', 'Gece Öğünü'],
}
const ANA_SAATLER: Record<number, string[]> = {
  1: ['12:00'], 2: ['08:00', '19:00'], 3: ['08:00', '13:00', '19:00'],
  4: ['08:00', '13:00', '16:30', '19:30'], 5: ['08:00', '10:30', '13:00', '16:30', '19:30'],
  6: ['07:30', '10:00', '12:30', '15:30', '18:30', '21:00'],
}

function ogunSirala(anaAdet: number, araAdet: number): OgunSablonu[] {
  const analar = ANA_OGUN_ADLARI[anaAdet] ?? ANA_OGUN_ADLARI[3]
  const saatler = ANA_SAATLER[anaAdet] ?? ANA_SAATLER[3]
  const sonuc: OgunSablonu[] = []
  for (let i = 0; i < anaAdet; i++) {
    sonuc.push({ id: `ana-${i}`, ad: analar[i], tur: 'ana', saat: saatler[i] ?? '' })
    if (i < araAdet) sonuc.push({ id: `ara-${i}`, ad: `Ara Öğün${araAdet > 1 ? ` ${i + 1}` : ''}`, tur: 'ara', saat: '' })
  }
  return sonuc
}

function ogunKalori(besinler: BesinItem[]): number {
  return besinler.reduce((t, b) => t + (b.kalori ?? 0), 0)
}
function gunKalori(gunPlan: GunPlan): number {
  return Object.values(gunPlan).reduce((t, bs) => t + ogunKalori(bs), 0)
}

// ─── Besin Satırı ─────────────────────────────────────────────────────────────
function BesinSatiri({
  besin, onGuncelle, onSil,
}: {
  besin: BesinItem
  onGuncelle: (alan: 'ad' | 'miktar' | 'kalori', deger: string | number | null) => void
  onSil: () => void
}) {
  const [oneri, setOneri] = useState<Besin[]>([])
  const [acik, setAcik] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function dis(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setAcik(false) }
    document.addEventListener('mousedown', dis)
    return () => document.removeEventListener('mousedown', dis)
  }, [])

  function adDegisti(v: string) {
    onGuncelle('ad', v)
    const sonuclar = besinAra(v)
    setOneri(sonuclar)
    setAcik(sonuclar.length > 0)
  }

  function oneriSec(b: Besin) {
    onGuncelle('ad', b.ad)
    onGuncelle('miktar', b.porsiyon)
    onGuncelle('kalori', b.kalori)
    setAcik(false)
    setOneri([])
  }

  return (
    <div className="flex items-start gap-1.5">
      {/* Besin adı + autocomplete */}
      <div className="relative flex-1 min-w-0" ref={ref}>
        <input
          type="text"
          placeholder="Besin adı ara… (örn: kola, peynir, tavuk)"
          value={besin.ad}
          onChange={e => adDegisti(e.target.value)}
          onFocus={() => besin.ad && setAcik(oneri.length > 0)}
          className="w-full text-sm border border-input rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        {acik && oneri.length > 0 && (
          <div className="absolute top-full left-0 z-30 mt-1 bg-white border border-border rounded-xl shadow-xl"
               style={{ minWidth: '320px', maxHeight: '300px', overflowY: 'auto' }}>
            <div className="sticky top-0 bg-gray-50 border-b border-border px-3 py-1.5">
              <p className="text-xs text-muted-foreground font-medium">{oneri.length} sonuç</p>
            </div>
            {oneri.map(b => (
              <button
                key={b.ad}
                onMouseDown={() => oneriSec(b)}
                className="w-full text-left px-3 py-2.5 hover:bg-primary/5 flex items-center justify-between gap-3 border-b border-border/40 last:border-0 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{b.ad}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.porsiyon} · {b.kategori}</p>
                </div>
                <span className="text-sm font-bold text-amber-600 shrink-0 flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg">
                  <Flame className="h-3.5 w-3.5" />{b.kalori}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Miktar */}
      <input
        type="text"
        placeholder="Miktar"
        value={besin.miktar}
        onChange={e => onGuncelle('miktar', e.target.value)}
        className="w-24 shrink-0 text-sm border border-input rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
      />

      {/* Kalori */}
      <div className="flex items-center gap-0.5 shrink-0">
        <input
          type="number"
          placeholder="kcal"
          value={besin.kalori ?? ''}
          onChange={e => onGuncelle('kalori', e.target.value ? Number(e.target.value) : null)}
          className="w-16 text-sm border border-amber-200 bg-amber-50 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-amber-400 font-medium text-amber-700"
        />
        <span className="text-xs text-muted-foreground">kcal</span>
      </div>

      {/* Sil */}
      <button onClick={onSil} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-1.5">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ─── Ana Sayfa ─────────────────────────────────────────────────────────────────
export default function YeniDiyetPlaniPage() {
  const router = useRouter()

  const [adim, setAdim] = useState(1)
  const [seciliDanisanId, setSeciliDanisanId] = useState('')
  const [planAdi, setPlanAdi] = useState('')
  const [kaloriHedefi, setKaloriHedefi] = useState('')
  const [notlar, setNotlar] = useState('')

  const [anaOgunAdet, setAnaOgunAdet] = useState(3)
  const [araOgunAdet, setAraOgunAdet] = useState(2)
  const [ogunler, setOgunler] = useState<OgunSablonu[]>(() => ogunSirala(3, 2))

  const [aktifGun, setAktifGun] = useState('Pazartesi')
  const [gunPlanlar, setGunPlanlar] = useState<Record<string, GunPlan>>(() => {
    const init: Record<string, GunPlan> = {}
    GUNLER.forEach(g => { init[g] = {} })
    return init
  })

  const [kaydedildi, setKaydedildi] = useState(false)

  // ─── Adım 2 yardımcılar ───────────────────────────────────────────────────
  function ogunAdiGuncelle(id: string, v: string) { setOgunler(p => p.map(o => o.id === id ? { ...o, ad: v } : o)) }
  function saatGuncelle(id: string, v: string) { setOgunler(p => p.map(o => o.id === id ? { ...o, saat: v } : o)) }
  function adedeDegistir(a: number, ar: number) {
    const clamped = Math.max(0, Math.min(ar, a - 1))
    setAnaOgunAdet(a); setAraOgunAdet(clamped); setOgunler(ogunSirala(a, clamped))
  }

  // ─── Adım 3 yardımcılar ───────────────────────────────────────────────────
  function besinEkle(gun: string, ogunId: string) {
    setGunPlanlar(prev => {
      const gp = { ...prev[gun] }
      gp[ogunId] = [...(gp[ogunId] ?? []), { id: String(Date.now()), ad: '', miktar: '', kalori: null }]
      return { ...prev, [gun]: gp }
    })
  }

  function besinGuncelle(gun: string, ogunId: string, besinId: string, alan: 'ad' | 'miktar' | 'kalori', deger: string | number | null) {
    setGunPlanlar(prev => {
      const gp = { ...prev[gun] }
      gp[ogunId] = (gp[ogunId] ?? []).map(b => b.id === besinId ? { ...b, [alan]: deger } : b)
      return { ...prev, [gun]: gp }
    })
  }

  function besinSil(gun: string, ogunId: string, besinId: string) {
    setGunPlanlar(prev => {
      const gp = { ...prev[gun] }
      gp[ogunId] = (gp[ogunId] ?? []).filter(b => b.id !== besinId)
      return { ...prev, [gun]: gp }
    })
  }

  function gunuKopyala(kaynak: string, hedefler: string[]) {
    setGunPlanlar(prev => {
      const src = prev[kaynak]
      const yeni = { ...prev }
      hedefler.forEach(g => {
        const kopya: GunPlan = {}
        Object.entries(src).forEach(([oid, bs]) => {
          kopya[oid] = bs.map(b => ({ ...b, id: `${Date.now()}-${g}-${b.id}` }))
        })
        yeni[g] = kopya
      })
      return yeni
    })
  }

  // ─── Kaydet ───────────────────────────────────────────────────────────────
  function planKaydet() {
    const danisan = demoDanisanlar.find(d => d.id === seciliDanisanId)!
    const yeniPlan = {
      id: String(Date.now()),
      danisan_id: seciliDanisanId,
      baslik: planAdi,
      gunluk_kalori_hedefi: kaloriHedefi ? parseInt(kaloriHedefi) : undefined,
      baslangic_tarihi: new Date().toISOString().split('T')[0],
      aktif: true,
      notlar: notlar || undefined,
      danisan,
      haftalik_plan: GUNLER.map(gun => ({
        gun,
        toplam_kalori: gunKalori(gunPlanlar[gun]),
        ogunler: ogunler.map(o => ({
          ad: o.ad,
          saat: o.saat || undefined,
          toplam_kalori: ogunKalori(gunPlanlar[gun][o.id] ?? []) || undefined,
          items: (gunPlanlar[gun][o.id] ?? [])
            .filter(b => b.ad.trim())
            .map(b => ({ ad: b.ad, miktar: b.miktar })),
        })),
      })),
    }
    const mevcutlar = JSON.parse(localStorage.getItem('vitanorm_diyet_planlari') ?? '[]')
    localStorage.setItem('vitanorm_diyet_planlari', JSON.stringify([yeniPlan, ...mevcutlar]))
    setKaydedildi(true)
    setTimeout(() => router.push('/diyet-planlari'), 1500)
  }

  const adim1Gecerli = seciliDanisanId && planAdi.trim()
  const aktifGunToplamKalori = gunKalori(gunPlanlar[aktifGun])
  const hedefKalori = kaloriHedefi ? parseInt(kaloriHedefi) : null
  const kaloriYuzdesi = hedefKalori ? Math.min(100, Math.round((aktifGunToplamKalori / hedefKalori) * 100)) : null

  if (kaydedildi) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold">Plan Oluşturuldu!</h2>
          <p className="text-muted-foreground text-sm">Diyet planları sayfasına yönlendiriliyorsunuz…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Yeni Diyet Planı"
        description="Adım adım diyet planı oluşturun"
        action={
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Geri
          </Button>
        }
      />

      {/* İlerleme */}
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="flex items-center gap-0 max-w-lg">
          {[{ no: 1, baslik: 'Danışan & Plan' }, { no: 2, baslik: 'Öğün Yapısı' }, { no: 3, baslik: 'Plan Editörü' }].map((a, i) => (
            <div key={a.no} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${adim > a.no ? 'bg-emerald-500 text-white' : adim === a.no ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {adim > a.no ? <Check className="h-3.5 w-3.5" /> : a.no}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${adim === a.no ? 'text-foreground' : 'text-muted-foreground'}`}>{a.baslik}</span>
              </div>
              {i < 2 && <div className={`h-px w-12 mx-3 ${adim > a.no ? 'bg-emerald-400' : 'bg-border'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-6">

        {/* ── ADIM 1 ── */}
        {adim === 1 && (
          <div className="max-w-lg space-y-5">
            <div>
              <h2 className="text-lg font-semibold mb-0.5">Danışan ve Plan Bilgileri</h2>
              <p className="text-sm text-muted-foreground">Hangi danışan için plan oluşturuyorsunuz?</p>
            </div>
            <div className="space-y-2">
              <Label>Danışan <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {demoDanisanlar.map(d => (
                  <button key={d.id} onClick={() => setSeciliDanisanId(d.id)}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${seciliDanisanId === d.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${seciliDanisanId === d.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {d.ad[0]}{d.soyad[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.ad} {d.soyad}</p>
                        <p className="text-xs text-muted-foreground">{d.hedef_kilo ? `Hedef: ${d.hedef_kilo} kg` : d.durum}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Plan Adı <span className="text-destructive">*</span></Label>
              <Input placeholder="Örn: Kilo Verme Planı, Kas Kazanım Diyeti…" value={planAdi} onChange={e => setPlanAdi(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Günlük Kalori Hedefi (kcal) <span className="text-muted-foreground text-xs">— opsiyonel</span></Label>
              <Input type="number" placeholder="Örn: 1600" value={kaloriHedefi} onChange={e => setKaloriHedefi(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Notlar <span className="text-muted-foreground text-xs">— opsiyonel</span></Label>
              <Textarea placeholder="Danışana özel notlar, uyarılar…" value={notlar} onChange={e => setNotlar(e.target.value)} rows={2} className="resize-none" />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setAdim(2)} disabled={!adim1Gecerli} className="gap-1.5">
                Devam <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── ADIM 2 ── */}
        {adim === 2 && (
          <div className="max-w-lg space-y-5">
            <div>
              <h2 className="text-lg font-semibold mb-0.5">Öğün Yapısı</h2>
              <p className="text-sm text-muted-foreground">Kaç ana öğün ve ara öğün olacak? İsimlerini özelleştirin.</p>
            </div>
            <div className="border border-border rounded-xl p-4 space-y-4">
              {[
                { baslik: 'Ana Öğün Sayısı', aciklama: 'Kahvaltı, öğle, akşam gibi', deger: anaOgunAdet, min: 1, max: 6, onChange: (v: number) => adedeDegistir(v, araOgunAdet) },
                { baslik: 'Ara Öğün Sayısı', aciklama: 'Ana öğünler arasına dağıtılır', deger: araOgunAdet, min: 0, max: anaOgunAdet - 1, onChange: (v: number) => adedeDegistir(anaOgunAdet, v) },
              ].map(item => (
                <div key={item.baslik} className="flex items-center justify-between">
                  <div><p className="font-medium text-sm">{item.baslik}</p><p className="text-xs text-muted-foreground">{item.aciklama}</p></div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => item.onChange(Math.max(item.min, item.deger - 1))} disabled={item.deger <= item.min} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-bold w-4 text-center">{item.deger}</span>
                    <button onClick={() => item.onChange(Math.min(item.max, item.deger + 1))} disabled={item.deger >= item.max} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-40">
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Öğün sırası ve isimleri</Label>
              {ogunler.map((o, i) => (
                <div key={o.id} className={`flex items-center gap-3 p-3 rounded-xl border ${o.tur === 'ana' ? 'border-primary/20 bg-primary/3' : 'border-border bg-muted/30'}`}>
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${o.tur === 'ana' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
                  <Input value={o.ad} onChange={e => ogunAdiGuncelle(o.id, e.target.value)} className="flex-1 h-8 text-sm" placeholder={o.tur === 'ana' ? 'Öğün adı' : 'Ara öğün adı'} />
                  <Input type="time" value={o.saat} onChange={e => saatGuncelle(o.id, e.target.value)} className="w-28 h-8 text-sm" />
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${o.tur === 'ana' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{o.tur === 'ana' ? 'Ana' : 'Ara'}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setAdim(1)} className="gap-1.5"><ChevronLeft className="h-4 w-4" /> Geri</Button>
              <Button onClick={() => setAdim(3)} className="gap-1.5">Plan Editörüne Geç <ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* ── ADIM 3: Plan Editörü ── */}
        {adim === 3 && (
          <div className="space-y-4">

            {/* Başlık + Kalori Özeti */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{planAdi}</h2>
                <p className="text-sm text-muted-foreground">
                  {demoDanisanlar.find(d => d.id === seciliDanisanId)?.ad} için
                  {hedefKalori && ` · Hedef: ${hedefKalori} kcal/gün`}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAdim(2)} className="gap-1 shrink-0">
                <ChevronLeft className="h-4 w-4" /> Öğün Yapısı
              </Button>
            </div>

            {/* Gün sekmeleri */}
            <div className="flex gap-0 border-b border-border overflow-x-auto">
              {GUNLER.map(gun => {
                const gunToplamKalori = gunKalori(gunPlanlar[gun])
                const dolu = gunToplamKalori > 0
                return (
                  <button key={gun} onClick={() => setAktifGun(gun)}
                    className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${aktifGun === gun ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                    <span>{gun}</span>
                    {dolu && (
                      <span className={`ml-1.5 text-xs font-bold ${aktifGun === gun ? 'text-primary' : 'text-muted-foreground'}`}>
                        {gunToplamKalori} kcal
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Günlük kalori özet bar */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-4">
              <Flame className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-amber-800">
                    {aktifGun} — Toplam Kalori
                  </p>
                  <p className="text-sm font-bold text-amber-700">
                    {aktifGunToplamKalori} kcal
                    {hedefKalori && <span className="font-normal text-amber-500"> / {hedefKalori} kcal</span>}
                  </p>
                </div>
                {hedefKalori && (
                  <div className="w-full bg-amber-200/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${kaloriYuzdesi! > 110 ? 'bg-red-500' : kaloriYuzdesi! > 95 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                      style={{ width: `${Math.min(100, kaloriYuzdesi!)}%` }}
                    />
                  </div>
                )}
              </div>
              {hedefKalori && (
                <span className={`text-sm font-bold shrink-0 ${kaloriYuzdesi! > 110 ? 'text-red-600' : kaloriYuzdesi! > 95 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  %{kaloriYuzdesi}
                </span>
              )}
            </div>

            {/* Kopyalama */}
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs text-muted-foreground">{aktifGun} planını kopyala:</span>
              <button onClick={() => gunuKopyala(aktifGun, GUNLER.filter(g => g !== aktifGun))}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted flex items-center gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Tüm Günlere
              </button>
              <button onClick={() => gunuKopyala(aktifGun, ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'].filter(g => g !== aktifGun))}
                className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted flex items-center gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Hafta İçine
              </button>
            </div>

            {/* Öğün kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {ogunler.map(ogun => {
                const besinler = gunPlanlar[aktifGun]?.[ogun.id] ?? []
                const ogunToplam = ogunKalori(besinler)
                return (
                  <div key={ogun.id} className={`rounded-xl border overflow-hidden ${ogun.tur === 'ana' ? 'border-primary/20' : 'border-border'}`}>
                    {/* Öğün başlık */}
                    <div className={`px-4 py-2.5 flex items-center justify-between ${ogun.tur === 'ana' ? 'bg-primary/5' : 'bg-muted/40'}`}>
                      <div className="flex items-center gap-2">
                        <Utensils className={`h-3.5 w-3.5 ${ogun.tur === 'ana' ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="font-semibold text-sm">{ogun.ad}</p>
                        {ogun.saat && <span className="text-xs text-muted-foreground font-mono">{ogun.saat}</span>}
                      </div>
                      {ogunToplam > 0 && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Flame className="h-3.5 w-3.5" />
                          {ogunToplam} kcal
                        </div>
                      )}
                    </div>

                    {/* Besinler */}
                    <div className="bg-white p-3 space-y-2">
                      {/* Kolon başlıkları */}
                      {besinler.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-0.5">
                          <span className="flex-1">Besin</span>
                          <span className="w-24 text-center">Miktar</span>
                          <span className="w-16 text-center">Kalori</span>
                          <span className="w-4" />
                        </div>
                      )}

                      {besinler.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">Henüz besin eklenmedi</p>
                      )}

                      {besinler.map(besin => (
                        <BesinSatiri
                          key={besin.id}
                          besin={besin}
                          onGuncelle={(alan, deger) => besinGuncelle(aktifGun, ogun.id, besin.id, alan, deger)}
                          onSil={() => besinSil(aktifGun, ogun.id, besin.id)}
                        />
                      ))}

                      <button onClick={() => besinEkle(aktifGun, ogun.id)}
                        className="w-full text-xs text-primary hover:text-primary/80 border border-dashed border-primary/30 hover:border-primary/50 rounded-lg py-1.5 flex items-center justify-center gap-1.5 transition-colors">
                        <Plus className="h-3.5 w-3.5" /> Besin Ekle
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Kaydet */}
            <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
              <div className="text-sm text-muted-foreground">
                {GUNLER.filter(g => gunKalori(gunPlanlar[g]) > 0).length} / 7 gün dolduruldu
              </div>
              <Button onClick={planKaydet} size="lg" className="gap-2 px-8">
                <Salad className="h-4 w-4" /> Planı Kaydet
              </Button>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
