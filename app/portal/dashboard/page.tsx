"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Activity, Droplets, Scale, Camera, ShoppingCart, FileText,
  Plus, Minus, Check, Bell, TrendingDown, LogOut, ChevronDown, ChevronUp,
  MessageCircle, Send, Trophy,
} from "lucide-react"
import Link from "next/link"
import type { EylemTuru } from "@/lib/loyalty-definitions"
import { demoDanisanlar, demoDiyetPlanlari, demoOlcumler } from "@/lib/demo-data"
import type { Danisan } from "@/lib/types"
import { formatTarih } from "@/lib/utils-crm"
import { gonderimEkle, getGonderimler, yorumuOkunduIsaretle, type PortalGonderim } from "@/lib/portal-storage"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

async function loyaltyEylem(danisanId: string, tip: EylemTuru) {
  try {
    await fetch("/api/loyalty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ danisanId, tip }),
    })
  } catch { /* loyalty hatası ana akışı engellemesin */ }
}

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

export default function PortalDashboardPage() {
  const router = useRouter()
  const [danisan, setDanisan] = useState<Danisan | null>(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [aktifSekme, setAktifSekme] = useState<'ana' | 'diyet' | 'alisveris' | 'ilerleme'>('ana')
  const [suMiktari, setSuMiktari] = useState(0)
  const [suKutlamasi, setSuKutlamasi] = useState(false)
  const [kilo, setKilo] = useState('')
  const [kiloKaydedildi, setKiloKaydedildi] = useState(false)
  const [bildirimIzni, setBildirimIzni] = useState(false)
  const [gonderimler, setGonderimler] = useState<PortalGonderim[]>([])

  useEffect(() => {
    async function checkAuth() {
      // Önce sunucu tarafı cookie'yi doğrula
      let danisanId: string | null = null
      try {
        const res = await fetch("/api/portal/auth/me")
        if (res.ok) {
          const data = await res.json() as { ok: boolean; danisanId?: string }
          if (data.ok && data.danisanId) {
            danisanId = data.danisanId
            // localStorage'ı güncelle (uyumluluk için)
            localStorage.setItem("portalAuth", JSON.stringify({ danisanId }))
          }
        }
      } catch { /* bağlantı hatası */ }

      // Cookie geçerli değilse localStorage'a bak (offline fallback)
      if (!danisanId) {
        const raw = localStorage.getItem("portalAuth")
        if (raw) {
          try { danisanId = JSON.parse(raw).danisanId } catch { /* ignore */ }
        }
      }

      if (!danisanId) {
        router.replace("/portal/login")
        return
      }

      const kayitlilar: typeof demoDanisanlar = JSON.parse(localStorage.getItem("crm_danisanlar") ?? "[]")
      const liste = kayitlilar.length > 0 ? kayitlilar : demoDanisanlar
      const found = liste.find(d => d.id === danisanId)
      if (!found) {
        router.replace("/portal/login")
        return
      }
      setDanisan(found)
      setGonderimler(getGonderimler().filter(g => g.danisanId === found.id))
      setYukleniyor(false)

      const interval = setInterval(() => {
        const stored = localStorage.getItem("portalAuth")
        if (!stored) return
        try {
          const { danisanId: did } = JSON.parse(stored) as { danisanId: string }
          setGonderimler(getGonderimler().filter(g => g.danisanId === did))
        } catch { /* ignore */ }
      }, 10000)
      return () => clearInterval(interval)
    }
    checkAuth()
  }, [router])

  async function handleCikis() {
    await fetch("/api/portal/auth/logout", { method: "POST" }).catch(() => {})
    localStorage.removeItem("portalAuth")
    router.push("/portal/login")
  }

  async function bildirimIzniAl() {
    if ('Notification' in window) {
      const izin = await Notification.requestPermission()
      setBildirimIzni(izin === 'granted')
    }
  }

  function kiloyuKaydet() {
    if (!kilo || !danisan) return
    gonderimEkle({
      danisanId: danisan.id,
      tur: 'kilo',
      deger: `${kilo} kg`,
    })
    loyaltyEylem(danisan.id, 'kilo_giris')
    setKiloKaydedildi(true)
    setTimeout(() => { setKiloKaydedildi(false); setKilo('') }, 2500)
  }

  if (yukleniyor || !danisan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Activity className="h-10 w-10 text-primary mx-auto animate-pulse" />
          <p className="text-sm text-muted-foreground">Yükleniyor…</p>
        </div>
      </div>
    )
  }

  const suHedefi = 8
  const suYuzdesi = Math.min(100, (suMiktari / suHedefi) * 100)
  const tumOlcumler = JSON.parse(localStorage.getItem("crm_olcumler") ?? JSON.stringify(demoOlcumler))
  const tumPlanlar = JSON.parse(localStorage.getItem("crm_diyet_planlari") ?? JSON.stringify(demoDiyetPlanlari))
  const olcumler = tumOlcumler.filter((o: typeof demoOlcumler[0]) => o.danisan_id === danisan.id).sort((a: typeof demoOlcumler[0], b: typeof demoOlcumler[0]) => b.tarih.localeCompare(a.tarih))
  const sonOlcum = olcumler[0]
  const mevcutKilo = sonOlcum?.kilo_kg ?? danisan.baslangic_kilo ?? 0
  const toplam = danisan.baslangic_kilo && danisan.hedef_kilo ? Math.abs(danisan.baslangic_kilo - danisan.hedef_kilo) : 0
  const gidilen = danisan.baslangic_kilo ? Math.abs(danisan.baslangic_kilo - mevcutKilo) : 0
  const ilerleme = toplam > 0 ? Math.min(100, Math.round((gidilen / toplam) * 100)) : 0
  const aktivPlan = tumPlanlar.find((p: typeof demoDiyetPlanlari[0]) => p.danisan_id === danisan.id && p.aktif)
  const motivasyon = motivasyonMesajlari[new Date().getDay() % motivasyonMesajlari.length]

  return (
    <>
    <div className="max-w-md mx-auto min-h-screen flex flex-col">

      {/* Header */}
      <div className="bg-primary text-primary-foreground px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <span className="font-bold">VitaNorm</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={bildirimIzniAl} className="bg-primary-foreground/20 rounded-full p-2">
              <Bell className="h-4 w-4" />
            </button>
            <button onClick={handleCikis} className="bg-primary-foreground/20 rounded-full p-2" title="Çıkış Yap">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <h1 className="text-xl font-bold">Merhaba, {danisan.ad}! 👋</h1>
        <p className="text-primary-foreground/80 text-sm mt-0.5">{motivasyon}</p>

        {/* Kilo İlerleme */}
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
      <div className="bg-white border-b border-border flex sticky top-0 z-10">
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
      <div className="flex-1 p-4 space-y-4 pb-10 bg-slate-50/50">

        {/* BUGÜN */}
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
                  onClick={() => {
                    const yeni = Math.min(suHedefi, suMiktari + 1)
                    setSuMiktari(yeni)
                    if (danisan) loyaltyEylem(danisan.id, 'su_takibi')
                    if (yeni === suHedefi && danisan) {
                      gonderimEkle({ danisanId: danisan.id, tur: 'su', deger: `${yeni}/${suHedefi} bardak tamamlandı` })
                      setSuKutlamasi(true)
                    }
                  }}
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
                  <p className="text-xs text-muted-foreground">
                    Son: {sonOlcum ? `${sonOlcum.kilo_kg} kg — ${formatTarih(sonOlcum.tarih)}` : 'Henüz giriş yapılmadı'}
                  </p>
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
                  {kiloKaydedildi ? <><Check className="h-4 w-4" /> Kaydedildi</> : 'Kaydet'}
                </button>
              </div>
              {kiloKaydedildi && (
                <p className="text-xs text-emerald-600 mt-2 text-center">✓ Diyetisyeninize iletildi</p>
              )}
            </div>

            {/* Öğün Fotoğrafı */}
            <FotografKarti danisan={danisan} />

            {/* Diyetisyene Mesaj */}
            <MesajKarti danisan={danisan} onGonderildi={() => setGonderimler(getGonderimler().filter(g => g.danisanId === danisan.id))} />

            {/* Diyetisyen Yorumları */}
            {gonderimler.filter(g => g.diyetisyenYorumu && !g.yorumOkundu).map(g => (
              <div key={g.id} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-500 rounded-full p-2 shrink-0">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-800 mb-0.5">Diyetisyeninizden yorum</p>
                    <p className="text-xs text-emerald-600 mb-2">
                      {g.tur === 'mesaj' ? 'Mesajınız yanıtlandı' : `${g.ogun} fotoğrafınız değerlendirildi`}
                    </p>
                    <p className="text-sm text-emerald-900 bg-white rounded-xl px-3 py-2 border border-emerald-100">
                      {g.diyetisyenYorumu}
                    </p>
                    {g.tahminiKalori && (
                      <p className="text-xs text-emerald-600 mt-1.5">
                        Tahmini kalori: <strong>~{g.tahminiKalori} kcal</strong>
                      </p>
                    )}
                    <button
                      onClick={() => {
                        yorumuOkunduIsaretle(g.id)
                        setGonderimler(prev => prev.map(x => x.id === g.id ? { ...x, yorumOkundu: true } : x))
                      }}
                      className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 font-medium underline"
                    >
                      Okundu olarak işaretle
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Sadakat Programı */}
            <Link
              href="/portal/loyalty"
              className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-white text-sm">🏆 Sadakat Puanlarım</p>
                <p className="text-white/80 text-xs mt-0.5">Rozetler, görevler ve ödüller</p>
              </div>
              <Trophy className="h-8 w-8 text-white/60" />
            </Link>

            {/* Bildirim */}
            {!bildirimIzni && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Bildirimleri Aç</p>
                  <p className="text-xs text-blue-600">Su içme ve tartı günü hatırlatmaları alın</p>
                </div>
                <button onClick={bildirimIzniAl} className="bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
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
                    <Badge variant="success">Aktif Plan</Badge>
                  </div>
                  {aktivPlan.gunluk_kalori_hedefi && (
                    <p className="text-sm text-muted-foreground">Günlük hedef: {aktivPlan.gunluk_kalori_hedefi} kcal</p>
                  )}
                  {aktivPlan.notlar && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{aktivPlan.notlar}</p>
                  )}
                </div>

                {aktivPlan.haftalik_plan.map(gun => (
                  <GunlukPlanKart key={gun.gun} gun={gun} />
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

        {/* ALIŞVERİŞ */}
        {aktifSekme === 'alisveris' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-border flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <p className="font-semibold">Haftalık Alışveriş Listesi</p>
            </div>
            {alisverisListesi.map(k => (
              <AlisverisKategori key={k.kategori} kategori={k.kategori} urunler={k.urunler} />
            ))}
          </div>
        )}

        {/* İLERLEME */}
        {aktifSekme === 'ilerleme' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-border text-center">
                <p className="text-3xl font-bold text-emerald-600">
                  {danisan.baslangic_kilo && mevcutKilo
                    ? Math.abs(danisan.baslangic_kilo - mevcutKilo).toFixed(1)
                    : '0'} kg
                </p>
                <p className="text-xs text-muted-foreground mt-1">Toplam Değişim</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-border text-center">
                <p className="text-3xl font-bold text-primary">{ilerleme}%</p>
                <p className="text-xs text-muted-foreground mt-1">Hedefe Ulaşım</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <p className="font-semibold text-sm">Ölçüm Geçmişi</p>
              </div>
              {olcumler.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Henüz ölçüm girilmedi.</div>
              ) : (
                <div className="divide-y divide-border">
                  {olcumler.map((o, i, arr) => {
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    {suKutlamasi && <SuKutlamaModal onKapat={() => setSuKutlamasi(false)} />}
    </>
  )
}

function SuKutlamaModal({ onKapat }: { onKapat: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-6">
      <div className="bg-white rounded-3xl w-full max-w-sm text-center px-8 py-10 shadow-2xl">
        <div className="text-6xl mb-4">🎉</div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Droplets className="h-6 w-6 text-cyan-500" />
          <span className="text-3xl font-bold text-cyan-600">2.000 ml</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Harika iş çıkardınız!</h2>
        <p className="text-muted-foreground text-sm mb-1">Günlük su hedefinizi tamamladınız. 💧</p>
        <p className="text-muted-foreground text-sm mb-6">
          Yeterli su içmek metabolizmanızı hızlandırır ve toksinleri atar. Devam edin böyle!
        </p>
        <button
          onClick={onKapat}
          className="w-full bg-cyan-500 text-white font-semibold py-3 rounded-xl hover:bg-cyan-600 transition-colors"
        >
          Teşekkürler! 💪
        </button>
      </div>
    </div>
  )
}


function GunlukPlanKart({ gun }: { gun: { gun: string; toplam_kalori?: number; ogunler: Array<{ ad: string; saat?: string; toplam_kalori?: number; items: Array<{ ad: string; miktar: string }> }> } }) {
  const [acik, setAcik] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-border overflow-hidden">
      <button
        onClick={() => setAcik(!acik)}
        className="w-full bg-primary/5 px-4 py-2.5 flex justify-between items-center"
      >
        <p className="font-semibold text-sm">{gun.gun}</p>
        <div className="flex items-center gap-2">
          {gun.toplam_kalori && (
            <span className="text-xs text-muted-foreground">{gun.toplam_kalori} kcal</span>
          )}
          {acik ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>
      {acik && (
        <div className="divide-y divide-border">
          {gun.ogunler.map(ogun => (
            <div key={ogun.ad} className="px-4 py-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold">{ogun.ad}</p>
                <div className="flex items-center gap-1.5">
                  {ogun.saat && <span className="text-xs text-muted-foreground">{ogun.saat}</span>}
                  {ogun.toplam_kalori && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-md font-medium">{ogun.toplam_kalori} kcal</span>
                  )}
                </div>
              </div>
              <ul className="space-y-1">
                {ogun.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{item.ad}</span>
                    <span className="text-muted-foreground">{item.miktar}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Fotoğrafı maks 900px'e küçültür ve JPEG %75 kaliteye sıkıştırır */
function fotografSikistir(base64: string, maxPx = 900): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const oran = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * oran)
      canvas.height = Math.round(img.height * oran)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = () => resolve(base64)
    img.src = base64
  })
}

function FotografKarti({ danisan }: { danisan: Danisan }) {
  const [fotograf, setFotograf] = useState<string | null>(null)
  const [seciliOgun, setSeciliOgun] = useState('Öğle yemeği')
  const [gonderildi, setGonderildi] = useState(false)
  const [gonderiyor, setGonderiyor] = useState(false)

  const ogunler = ['Kahvaltı', 'Öğle yemeği', 'Akşam yemeği', 'Ara öğün']

  async function fotografGonder() {
    if (!fotograf) return
    setGonderiyor(true)
    const sikistirilmis = await fotografSikistir(fotograf)
    gonderimEkle({
      danisanId: danisan.id,
      tur: 'fotograf',
      deger: seciliOgun,
      fotografData: sikistirilmis,
      ogun: seciliOgun,
    })
    loyaltyEylem(danisan.id, 'ogun_log')
    setGonderiyor(false)
    setGonderildi(true)
  }

  if (gonderildi) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-amber-50 rounded-xl p-2"><Camera className="h-5 w-5 text-amber-500" /></div>
          <p className="font-semibold text-sm">Öğün Fotoğrafı</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center space-y-1">
          <p className="text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4" /> Gönderildi!
          </p>
          <p className="text-xs text-emerald-600">{seciliOgun} fotoğrafınız diyetisyeninize iletildi.</p>
        </div>
        <button
          onClick={() => { setFotograf(null); setGonderildi(false) }}
          className="mt-3 w-full py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
        >
          Yeni Fotoğraf Gönder
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-amber-50 rounded-xl p-2"><Camera className="h-5 w-5 text-amber-500" /></div>
        <div>
          <p className="font-semibold text-sm">Öğün Fotoğrafı</p>
          <p className="text-xs text-muted-foreground">Bugün yediklerinizi diyetisyeninize gönderin</p>
        </div>
      </div>

      {/* Öğün seçimi */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {ogunler.map(ogun => (
          <button
            key={ogun}
            onClick={() => setSeciliOgun(ogun)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              seciliOgun === ogun
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            {ogun}
          </button>
        ))}
      </div>

      {fotograf ? (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-muted aspect-video">
            <img src={fotograf} alt="Öğün" className="object-cover w-full h-full" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFotograf(null)}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted"
            >
              Tekrar Çek
            </button>
            <button
              onClick={fotografGonder}
              disabled={gonderiyor}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {gonderiyor
                ? <><span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> İşleniyor…</>
                : <><Camera className="h-4 w-4" /> Diyetisyene Gönder</>}
            </button>
          </div>
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
  )
}

function MesajKarti({ danisan, onGonderildi }: { danisan: Danisan; onGonderildi: () => void }) {
  const [metin, setMetin] = useState('')
  const [gonderildi, setGonderildi] = useState(false)

  function mesajGonder() {
    const temiz = metin.trim()
    if (!temiz) return
    gonderimEkle({
      danisanId: danisan.id,
      tur: 'mesaj',
      deger: temiz,
    })
    setGonderildi(true)
    onGonderildi()
    setTimeout(() => { setGonderildi(false); setMetin('') }, 3000)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-indigo-50 rounded-xl p-2"><MessageCircle className="h-5 w-5 text-indigo-500" /></div>
        <div>
          <p className="font-semibold text-sm">Diyetisyene Mesaj</p>
          <p className="text-xs text-muted-foreground">Soru veya notunuzu iletin</p>
        </div>
      </div>

      {gonderildi ? (
        <div className="bg-emerald-50 rounded-xl p-4 text-center space-y-1">
          <p className="text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
            <Check className="h-4 w-4" /> Mesajınız iletildi!
          </p>
          <p className="text-xs text-emerald-600">Diyetisyeniniz en kısa sürede yanıtlayacak.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={metin}
            onChange={e => setMetin(e.target.value)}
            placeholder="Örn: Bugün kendimi iyi hissetmedim, öğünleri atlasam olur mu?"
            rows={3}
            className="w-full rounded-xl border border-input px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <button
            onClick={mesajGonder}
            disabled={!metin.trim()}
            className="w-full py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" /> Gönder
          </button>
        </div>
      )}
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
      <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between">
        <p className="font-semibold text-sm">{kategori}</p>
        <span className="text-xs text-muted-foreground">{isaretliler.size}/{urunler.length}</span>
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
