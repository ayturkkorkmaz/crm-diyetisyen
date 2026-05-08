"use client"

import { useState, use } from "react"
import { Activity, Droplets, Scale, Camera, ShoppingCart, FileText, Plus, Minus, Check, ChevronRight, Bell, TrendingDown } from "lucide-react"
import { demoDanisanlar, demoDiyetPlanlari, demoOlcumler } from "@/lib/demo-data"
import { hesaplaYas, hesaplaBMI, bmiyeGoreEtiket, formatTarih } from "@/lib/utils-crm"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const alisverisListesi = [
  { kategori: 'Sebze & Meyve', urunler: ['Ispanak (500g)', 'Brokoli (2 baş)', 'Havuç (1kg)', 'Salatalık (4 adet)', 'Domates (1kg)', 'Elma (1kg)', 'Muz (1 adet/gün)', 'Limon (4 adet)'] },
  { kategori: 'Protein', urunler: ['Tavuk göğsü (1kg)', 'Somon (500g)', 'Yumurta (12 adet)', 'Beyaz peynir (250g)', 'Yoğurt %2 yağlı (1kg)'] },
  { kategori: 'Tahıl & Baklagil', urunler: ['Yulaf ezmesi (500g)', 'Tam buğday ekmek', 'Bulgur (500g)', 'Mercimek (500g)', 'Nohut (500g)'] },
  { kategori: 'Diğer', urunler: ['Zeytinyağı (1lt)', 'Badem (200g)', 'Ceviz (200g)', 'Tarçın', 'Zerdeçal'] },
]

const motivasyonMesajlari = [
  "Her adım sizi hedefinize yaklaştırıyor! 💪",
  "Bugünkü çabalarınız yarınki sonuçlarınızdır. 🌟",
  "Küçük adımlar, büyük değişimler yaratır. 🎯",
  "Kendinize inanın, biz inanıyoruz! 🌿",
]

export default function DanisanPortaliPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const danisan = demoDanisanlar.find(d => d.id === token)

  const [aktifSekme, setAktifSekme] = useState<'ana' | 'diyet' | 'alisveris' | 'ilerleme'>('ana')
  const [suMiktari, setSuMiktari] = useState(0) // bardak (250ml)
  const [kilo, setKilo] = useState('')
  const [kiloKaydedildi, setKiloKaydedildi] = useState(false)
  const [fotograf, setFotograf] = useState<string | null>(null)
  const [fotografKaydedildi, setFotografKaydedildi] = useState(false)
  const [bildirimIzni, setBildirimIzni] = useState(false)

  if (!danisan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Portal bulunamadı</h1>
          <p className="text-muted-foreground text-sm">Diyetisyeninizden yeni bir link talep edin.</p>
        </div>
      </div>
    )
  }

  const suHedefi = 8 // bardak
  const suYuzdesi = Math.min(100, (suMiktari / suHedefi) * 100)
  const sonOlcum = demoOlcumler.filter(o => o.danisan_id === danisan.id).sort((a, b) => b.tarih.localeCompare(a.tarih))[0]
  const mevcutKilo = sonOlcum?.kilo_kg ?? danisan.baslangic_kilo ?? 0
  const toplam = danisan.baslangic_kilo && danisan.hedef_kilo ? Math.abs(danisan.baslangic_kilo - danisan.hedef_kilo) : 0
  const gidilen = danisan.baslangic_kilo ? Math.abs(danisan.baslangic_kilo - mevcutKilo) : 0
  const ilerleme = toplam > 0 ? Math.min(100, Math.round((gidilen / toplam) * 100)) : 0
  const aktivPlan = demoDiyetPlanlari.find(p => p.danisan_id === danisan.id && p.aktif)
  const motivasyon = motivasyonMesajlari[new Date().getDay() % motivasyonMesajlari.length]

  function kiloyuKaydet() {
    if (!kilo) return
    setKiloKaydedildi(true)
    setTimeout(() => { setKiloKaydedildi(false); setKilo('') }, 2000)
  }

  async function bildirimIzniAl() {
    if ('Notification' in window) {
      const izin = await Notification.requestPermission()
      setBildirimIzni(izin === 'granted')
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <span className="font-bold">VitaNorm</span>
          </div>
          <button onClick={bildirimIzniAl} className="bg-primary-foreground/20 rounded-full p-2">
            <Bell className="h-4 w-4" />
          </button>
        </div>
        <h1 className="text-xl font-bold">Merhaba, {danisan.ad}! 👋</h1>
        <p className="text-primary-foreground/80 text-sm mt-0.5">{motivasyon}</p>

        {/* Kilo ilerleme */}
        <div className="mt-4 bg-primary-foreground/10 rounded-2xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-primary-foreground/80">Hedefe ilerleme</span>
            <span className="font-bold">{ilerleme}%</span>
          </div>
          <div className="w-full bg-primary-foreground/20 rounded-full h-2">
            <div className="bg-primary-foreground rounded-full h-2 transition-all" style={{ width: `${ilerleme}%` }} />
          </div>
          <div className="flex justify-between text-xs text-primary-foreground/70 mt-1.5">
            <span>Başlangıç: {danisan.baslangic_kilo} kg</span>
            <span>Şimdi: {mevcutKilo} kg</span>
            <span>Hedef: {danisan.hedef_kilo} kg</span>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-border flex">
        {[
          { id: 'ana', label: 'Bugün' },
          { id: 'diyet', label: 'Diyet' },
          { id: 'alisveris', label: 'Alışveriş' },
          { id: 'ilerleme', label: 'İlerleme' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAktifSekme(tab.id as typeof aktifSekme)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              aktifSekme === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* İçerik */}
      <div className="flex-1 p-4 space-y-4 pb-8">

        {/* ANA SEKME */}
        {aktifSekme === 'ana' && (
          <>
            {/* Su Takibi */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-cyan-50 rounded-xl p-2"><Droplets className="h-5 w-5 text-cyan-500" /></div>
                  <div>
                    <p className="font-semibold text-sm">Su Takibi</p>
                    <p className="text-xs text-muted-foreground">{suMiktari * 250} ml / {suHedefi * 250} ml</p>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${suYuzdesi >= 100 ? 'text-cyan-500' : 'text-foreground'}`}>
                  {suMiktari}/{suHedefi}
                </span>
              </div>

              {/* Su bardakları */}
              <div className="grid grid-cols-8 gap-1.5 mb-4">
                {Array.from({ length: suHedefi }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSuMiktari(i < suMiktari ? i : i + 1)}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                      i < suMiktari
                        ? 'bg-cyan-400 text-white'
                        : 'bg-cyan-50 text-cyan-200 hover:bg-cyan-100'
                    }`}
                  >
                    <Droplets className="h-4 w-4" />
                  </button>
                ))}
              </div>

              <Progress value={suYuzdesi} className="h-2 mb-3" />

              <div className="flex gap-2">
                <button
                  onClick={() => setSuMiktari(Math.max(0, suMiktari - 1))}
                  className="flex-1 py-2 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-1 hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" /> Çıkar
                </button>
                <button
                  onClick={() => setSuMiktari(Math.min(suHedefi, suMiktari + 1))}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 text-white text-sm font-medium flex items-center justify-center gap-1 hover:bg-cyan-600 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Ekle (250ml)
                </button>
              </div>

              {suMiktari >= suHedefi && (
                <div className="mt-3 bg-cyan-50 rounded-xl p-2.5 text-center">
                  <p className="text-sm text-cyan-700 font-medium">🎉 Günlük su hedefinize ulaştınız!</p>
                </div>
              )}
            </div>

            {/* Kilo Girişi */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-violet-50 rounded-xl p-2"><Scale className="h-5 w-5 text-violet-500" /></div>
                <div>
                  <p className="font-semibold text-sm">Kilo Girişi</p>
                  <p className="text-xs text-muted-foreground">Son: {sonOlcum ? `${sonOlcum.kilo_kg} kg — ${formatTarih(sonOlcum.tarih)}` : 'Giriş yapılmadı'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    value={kilo}
                    onChange={e => setKilo(e.target.value)}
                    className="w-full rounded-xl border border-input px-4 py-3 text-lg font-bold text-center focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kg</span>
                </div>
                <button
                  onClick={kiloyuKaydet}
                  className={`px-5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors ${
                    kiloKaydedildi
                      ? 'bg-emerald-500 text-white'
                      : 'bg-violet-500 text-white hover:bg-violet-600'
                  }`}
                >
                  {kiloKaydedildi ? <><Check className="h-4 w-4" />Kaydedildi</> : 'Kaydet'}
                </button>
              </div>
            </div>

            {/* Öğün Fotoğrafı */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-amber-50 rounded-xl p-2"><Camera className="h-5 w-5 text-amber-500" /></div>
                <div>
                  <p className="font-semibold text-sm">Öğün Fotoğrafı</p>
                  <p className="text-xs text-muted-foreground">Bugün yediklerinizi fotoğraflayın</p>
                </div>
              </div>
              {fotograf ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-muted aspect-video flex items-center justify-center">
                    <img src={fotograf} alt="Öğün" className="object-cover w-full h-full" />
                  </div>
                  {fotografKaydedildi ? (
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-sm text-emerald-700 font-medium flex items-center justify-center gap-1.5">
                        <Check className="h-4 w-4" /> Diyetisyeninize gönderildi!
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setFotograf(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted">
                        Tekrar Çek
                      </button>
                      <button
                        onClick={() => { setFotografKaydedildi(true) }}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"
                      >
                        Gönder
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = ev => setFotograf(ev.target?.result as string)
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <div className="border-2 border-dashed border-amber-200 rounded-xl p-8 text-center hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
                    <Camera className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-600">Fotoğraf Çek veya Seç</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Tabağınızı fotoğraflayın</p>
                  </div>
                </label>
              )}
            </div>

            {/* Push Notification */}
            {!bildirimIzni && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Bildirimleri Aç</p>
                  <p className="text-xs text-blue-600">Su içme ve tartı günü hatırlatmaları alın</p>
                </div>
                <button
                  onClick={bildirimIzniAl}
                  className="bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                >
                  Aç
                </button>
              </div>
            )}
          </>
        )}

        {/* DİYET LİSTESİ */}
        {aktifSekme === 'diyet' && (
          <div className="space-y-3">
            {aktivPlan ? (
              <>
                <div className="bg-white rounded-2xl p-4 shadow-xs border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold">{aktivPlan.baslik}</p>
                    <Badge variant="success">Aktif</Badge>
                  </div>
                  {aktivPlan.gunluk_kalori_hedefi && (
                    <p className="text-sm text-muted-foreground">Günlük hedef: {aktivPlan.gunluk_kalori_hedefi} kcal</p>
                  )}
                  {aktivPlan.notlar && <p className="text-xs text-muted-foreground mt-1 italic">{aktivPlan.notlar}</p>}
                </div>

                {aktivPlan.haftalik_plan.map(gun => (
                  <div key={gun.gun} className="bg-white rounded-2xl shadow-xs border border-border overflow-hidden">
                    <div className="bg-primary/5 px-4 py-2.5 flex justify-between items-center">
                      <p className="font-semibold text-sm">{gun.gun}</p>
                      {gun.toplam_kalori && (
                        <span className="text-xs text-muted-foreground font-medium">{gun.toplam_kalori} kcal</span>
                      )}
                    </div>
                    <div className="divide-y divide-border">
                      {gun.ogunler.map(ogun => (
                        <div key={ogun.ad} className="px-4 py-3">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-semibold">{ogun.ad}</p>
                            <div className="flex items-center gap-1.5">
                              {ogun.saat && <span className="text-xs text-muted-foreground">{ogun.saat}</span>}
                              {ogun.toplam_kalori && <Badge variant="secondary" className="text-xs">{ogun.toplam_kalori} kcal</Badge>}
                            </div>
                          </div>
                          <ul className="space-y-1">
                            {ogun.items.map((item, i) => (
                              <li key={i} className="flex justify-between text-sm">
                                <span className="text-foreground">{item.ad}</span>
                                <span className="text-muted-foreground">{item.miktar}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center shadow-xs border border-border">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium">Henüz diyet planı yok</p>
                <p className="text-xs text-muted-foreground mt-1">Diyetisyeniniz planınızı oluşturunca burada görünecek.</p>
              </div>
            )}
          </div>
        )}

        {/* ALIŞVERİŞ LİSTESİ */}
        {aktifSekme === 'alisveris' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-border flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <p className="font-semibold">Haftalık Alışveriş Listesi</p>
            </div>
            {alisverisListesi.map(kategori => (
              <AlisverisKategori key={kategori.kategori} kategori={kategori.kategori} urunler={kategori.urunler} />
            ))}
          </div>
        )}

        {/* İLERLEME */}
        {aktifSekme === 'ilerleme' && (
          <div className="space-y-4">
            {/* Özet */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-border text-center">
                <p className="text-3xl font-bold text-emerald-600">
                  {danisan.baslangic_kilo && mevcutKilo ? Math.abs(danisan.baslangic_kilo - mevcutKilo).toFixed(1) : '0'} kg
                </p>
                <p className="text-xs text-muted-foreground mt-1">Toplam Değişim</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-border text-center">
                <p className="text-3xl font-bold text-primary">{ilerleme}%</p>
                <p className="text-xs text-muted-foreground mt-1">Hedefe Ulaşım</p>
              </div>
            </div>

            {/* Ölçüm Geçmişi */}
            <div className="bg-white rounded-2xl shadow-xs border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm">Ölçüm Geçmişi</p>
              </div>
              <div className="divide-y divide-border">
                {demoOlcumler.filter(o => o.danisan_id === danisan.id).sort((a, b) => b.tarih.localeCompare(a.tarih)).map((o, i, arr) => {
                  const onceki = arr[i + 1]
                  const fark = onceki ? (o.kilo_kg - onceki.kilo_kg) : 0
                  return (
                    <div key={o.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">{formatTarih(o.tarih)}</p>
                        {o.bel_cm && <p className="text-xs text-muted-foreground">Bel: {o.bel_cm} cm</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{o.kilo_kg} kg</p>
                        {fark !== 0 && (
                          <p className={`text-xs font-medium ${fark < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {fark > 0 ? '+' : ''}{fark.toFixed(1)} kg
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AlisverisKategori({ kategori, urunler }: { kategori: string; urunler: string[] }) {
  const [isaretliler, setIsaretliler] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setIsaretliler(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-border overflow-hidden">
      <div className="bg-muted/50 px-4 py-2.5">
        <p className="font-semibold text-sm">{kategori}</p>
      </div>
      <div className="divide-y divide-border">
        {urunler.map((urun, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/30 transition-colors text-left"
          >
            <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              isaretliler.has(i) ? 'bg-emerald-500 border-emerald-500' : 'border-border'
            }`}>
              {isaretliler.has(i) && <Check className="h-3 w-3 text-white" />}
            </div>
            <span className={`text-sm ${isaretliler.has(i) ? 'line-through text-muted-foreground' : ''}`}>{urun}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
