"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Smartphone, Copy, Check, Users, Activity, Droplets, Scale,
  Camera, Clock, ExternalLink, KeyRound, X, Send, Flame, Sparkles,
  MessageCircle, ShieldCheck, Eye, EyeOff,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDanisanlar } from "@/lib/crm-store"
import type { Danisan } from "@/lib/types"
import { getInitials, getDanisanDurumLabel, getDanisanDurumVariant } from "@/lib/utils-crm"
import {
  getGonderimler, gonderimOnayla, yorumEkle, kaloriTahminEt,
  zamanFormatla, gonderimSil, type PortalGonderim,
} from "@/lib/portal-storage"
import type { WaGonderim } from "@/lib/server-portal-store"

const HIZLI_YANITLAR = [
  "Harika görünüyor! 👏 Devam edin böyle.",
  "Mükemmel bir öğün! ✨ Porsiyonlar çok uygun.",
  "Güzel bir seçim! 🌿 Biraz daha sebze ekleyebiliriz.",
  "Karbonhidrat biraz fazla, bir sonraki öğünde dikkat edelim.",
  "Protein kaynağınız eksik, yanına yoğurt veya yumurta ekleyin.",
  "Porsiyonu biraz azaltalım, genel olarak iyi bir tercih. 👍",
]

const portalUrl = 'localhost:3000/portal/login'

export default function PortalYonetimPage() {
  const danisanlar = useDanisanlar()
  const [kopyalandi, setKopyalandi] = useState(false)
  const [gonderimler, setGonderimler] = useState<PortalGonderim[]>([])
  const [aktifFoto, setAktifFoto] = useState<PortalGonderim | null>(null)
  const [yorum, setYorum] = useState('')
  const [kalori, setKalori] = useState<number | null>(null)
  const [kaloriHesaplaniyor, setKaloriHesaplaniyor] = useState(false)
  const [yorumGonderildi, setYorumGonderildi] = useState(false)
  const [aktifMesaj, setAktifMesaj] = useState<PortalGonderim | null>(null)
  const [mesajYanit, setMesajYanit] = useState('')
  const [mesajYanitGonderildi, setMesajYanitGonderildi] = useState(false)

  const [waGonderimler, setWaGonderimler] = useState<WaGonderim[]>([])
  const aktifDanisanlar = danisanlar.filter(d => d.durum === 'aktif')

  useEffect(() => {
    function yerelYukle() { setGonderimler(getGonderimler()) }
    async function waYukle() {
      try {
        const res = await fetch('/api/portal/gonderimler', { cache: 'no-store' })
        if (res.ok) setWaGonderimler(await res.json())
      } catch { /* sessiz */ }
    }
    yerelYukle()
    waYukle()
    const interval = setInterval(() => { yerelYukle(); waYukle() }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Fotoğraf modalı açıldığında kalori tahmini başlat
  function fotoAc(foto: PortalGonderim) {
    setAktifFoto(foto)
    setYorum(foto.diyetisyenYorumu ?? '')
    setYorumGonderildi(false)

    if (foto.tahminiKalori) {
      setKalori(foto.tahminiKalori)
      setKaloriHesaplaniyor(false)
    } else {
      setKalori(null)
      setKaloriHesaplaniyor(true)
      setTimeout(() => {
        const tahmin = kaloriTahminEt(foto.ogun)
        setKalori(tahmin)
        setKaloriHesaplaniyor(false)
        // Tahmini kaydet
        const guncel = getGonderimler().map(g =>
          g.id === foto.id ? { ...g, tahminiKalori: tahmin } : g
        )
        localStorage.setItem('vitanorm_portal_gonderimler', JSON.stringify(guncel))
      }, 2200)
    }
  }

  function fotoKapat() {
    setAktifFoto(null)
    setYorum('')
    setKalori(null)
    setYorumGonderildi(false)
  }

  function yorumuGonder() {
    if (!aktifFoto || !yorum.trim()) return
    yorumEkle(aktifFoto.id, yorum.trim(), kalori ?? undefined)
    setGonderimler(getGonderimler())
    setYorumGonderildi(true)
    setTimeout(fotoKapat, 1500)
  }

  function mesajAc(m: PortalGonderim) {
    setAktifMesaj(m)
    setMesajYanit(m.diyetisyenYorumu ?? '')
    setMesajYanitGonderildi(false)
  }

  function mesajKapat() {
    setAktifMesaj(null)
    setMesajYanit('')
    setMesajYanitGonderildi(false)
  }

  async function mesajYanitGonder() {
    if (!aktifMesaj || !mesajYanit.trim()) return
    const waId = (aktifMesaj as PortalGonderim & { _waId?: string })._waId
    if (waId) {
      // WA kaynaklı mesaj → API ile güncelle + WA'dan gönder
      await fetch('/api/portal/gonderimler', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: waId, onaylandi: true, diyetisyenYorumu: mesajYanit.trim(), yorumZaman: new Date().toISOString() }),
      })
      // WA üzerinden yanıt gönder
      const danisan = danisanlar.find(d => d.id === aktifMesaj.danisanId)
      if (danisan?.telefon) {
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: danisan.telefon, message: mesajYanit.trim() }),
        }).catch(() => {})
      }
      setWaGonderimler(prev => prev.map(g => g.id === waId
        ? { ...g, onaylandi: true, diyetisyenYorumu: mesajYanit.trim() } : g))
    } else {
      // Portal kaynaklı mesaj → localStorage
      yorumEkle(aktifMesaj.id, mesajYanit.trim())
      setGonderimler(getGonderimler())
    }
    setMesajYanitGonderildi(true)
    setTimeout(mesajKapat, 1500)
  }

  function urlKopyala() {
    navigator.clipboard.writeText(`http://${portalUrl}`)
    setKopyalandi(true)
    setTimeout(() => setKopyalandi(false), 2000)
  }

  const bekleyenFotolar = gonderimler.filter(g => g.tur === 'fotograf' && !g.onaylandi)
  const bekleyenMesajlar = [
    ...gonderimler.filter(g => g.tur === 'mesaj' && !g.onaylandi),
    ...waGonderimler.filter(g => g.tur === 'mesaj' && !g.onaylandi).map(waToPortal),
  ]

  // WA gönderimini portal formatına çevir (sadece görüntüleme için)
  function waToPortal(g: WaGonderim): PortalGonderim & { _waId: string } {
    return {
      _waId: g.id,
      id: g.id,
      danisanId: g.danisanId,
      tur: g.tur,
      deger: g.deger,
      zaman: g.zaman,
      onaylandi: g.onaylandi,
      diyetisyenYorumu: g.diyetisyenYorumu,
      yorumZaman: g.yorumZaman,
      kaynak: 'whatsapp' as const,
    } as PortalGonderim & { _waId: string }
  }

  // Tüm aktiviteleri zaman sırasına göre birleştir (silinmiş danışanlara ait olanları gösterme)
  const tumAktiviteler = [
    ...gonderimler,
    ...waGonderimler.map(waToPortal),
  ]
    .filter(akt => danisanlar.some(d => d.id === akt.danisanId))
    .sort((a, b) => b.zaman.localeCompare(a.zaman))
    .slice(0, 15)

  function turIcon(tur: PortalGonderim['tur']) {
    if (tur === 'fotograf') return Camera
    if (tur === 'kilo') return Scale
    if (tur === 'mesaj') return MessageCircle
    return Droplets
  }
  function turRenk(tur: PortalGonderim['tur']) {
    if (tur === 'fotograf') return 'text-amber-500 bg-amber-50'
    if (tur === 'kilo') return 'text-violet-500 bg-violet-50'
    if (tur === 'mesaj') return 'text-indigo-500 bg-indigo-50'
    return 'text-cyan-500 bg-cyan-50'
  }
  function turEtiket(g: PortalGonderim) {
    if (g.tur === 'fotograf') return `${g.ogun ?? 'Öğün'} fotoğrafı gönderdi`
    if (g.tur === 'kilo') return `Kilo girişi: ${g.deger}`
    if (g.tur === 'mesaj') return `Mesaj: ${g.deger.slice(0, 40)}${g.deger.length > 40 ? '…' : ''}`
    return `Su takibi: ${g.deger}`
  }

  return (
    <>
      <Header title="Danışan Portali" description="Danışan erişim yönetimi ve aktivite takibi" />
      <div className="p-6 space-y-6">

        {/* Portal URL */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className="bg-primary rounded-xl p-3 shrink-0 self-start">
                <Smartphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold mb-0.5">Danışan Portal Linki</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Tüm danışanlarınız bu tek linkten kendi adları ve şifreleriyle giriş yapar.
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-border rounded-lg px-3 py-2 font-mono text-sm truncate">
                    {portalUrl}
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={urlKopyala}>
                    {kopyalandi
                      ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Kopyalandı</>
                      : <><Copy className="h-3.5 w-3.5" /> Kopyala</>}
                  </Button>
                  <Button variant="outline" size="sm" asChild className="shrink-0">
                    <Link href="/portal/login" target="_blank"><ExternalLink className="h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Özet */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-blue-50 rounded-lg p-2"><Users className="h-4 w-4 text-blue-600" /></div>
              <div><p className="text-xs text-muted-foreground">Aktif Danışan</p><p className="text-xl font-bold">{aktifDanisanlar.length}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-green-50 rounded-lg p-2"><Activity className="h-4 w-4 text-green-600" /></div>
              <div><p className="text-xs text-muted-foreground">Toplam Gönderim</p><p className="text-xl font-bold">{gonderimler.length}</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-amber-50 rounded-lg p-2"><Camera className="h-4 w-4 text-amber-600" /></div>
              <div><p className="text-xs text-muted-foreground">Bekleyen Fotoğraf</p><p className="text-xl font-bold">{bekleyenFotolar.length}</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-5 gap-6">

          {/* Aktiviteler */}
          <div className="col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />Son Danışan Aktiviteleri
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {tumAktiviteler.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                    Henüz gönderim yok. Danışanlarınız veri gönderdikçe burada görünecek.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {tumAktiviteler.map(akt => {
                      const danisan = danisanlar.find(d => d.id === akt.danisanId)
                      const Icon = turIcon(akt.tur)
                      return (
                        <div key={akt.id} className="flex items-center gap-3 px-5 py-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs">{danisan ? getInitials(danisan.ad, danisan.soyad) : '?'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{danisan ? `${danisan.ad} ${danisan.soyad}` : 'Bilinmeyen danışan'}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className={`rounded-md p-0.5 ${turRenk(akt.tur)}`}><Icon className="h-3 w-3" /></div>
                              <p className="text-xs text-muted-foreground">{turEtiket(akt)}</p>
                              {(akt as PortalGonderim & { _waId?: string })._waId && (
                                <Badge className="text-xs py-0 bg-green-600 text-white">WhatsApp</Badge>
                              )}
                              {akt.diyetisyenYorumu && <Badge variant="success" className="text-xs py-0">yanıtlandı</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {akt.tur === 'fotograf' && (
                              <button onClick={() => fotoAc(akt)} className="text-xs text-primary hover:underline">
                                {akt.diyetisyenYorumu ? 'Görüntüle' : 'İncele'}
                              </button>
                            )}
                            {akt.tur === 'mesaj' && (
                              <button onClick={() => mesajAc(akt)} className="text-xs text-indigo-600 hover:underline">
                                {akt.diyetisyenYorumu ? 'Görüntüle' : 'Yanıtla'}
                              </button>
                            )}
                            <span className="text-xs text-muted-foreground">{zamanFormatla(akt.zaman)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Giriş Bilgileri */}
          <div className="col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />Danışan Hesapları
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div>
                  {danisanlar.map(d => <DanisanGirisRow key={d.id} danisan={d} />)}
                </div>
                <div className="px-4 py-3 border-t border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground">
                    Her danışan için ayrı e-posta + şifre belirleyin. <span className="text-emerald-600 font-medium">Yeşil kalkan</span> = hesap aktif.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Öğün Fotoğrafları */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground" />
                Öğün Fotoğrafları
              </CardTitle>
              {bekleyenFotolar.length > 0
                ? <Badge variant="warning">{bekleyenFotolar.length} bekliyor</Badge>
                : <Badge variant="success">Tümü yanıtlandı ✓</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const gosterilecek = bekleyenFotolar.length > 0
                ? bekleyenFotolar
                : gonderimler.filter(g => g.tur === 'fotograf' && g.diyetisyenYorumu).slice(0, 6)

              if (gosterilecek.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8 text-muted-foreground/20" />
                    Henüz fotoğraf gönderilmedi.
                  </div>
                )
              }

              const bekleyen = bekleyenFotolar.length > 0

              return (
                <>
                  {!bekleyen && (
                    <p className="text-xs text-muted-foreground mb-3">Son değerlendirilen fotoğraflar:</p>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    {gosterilecek.map(foto => {
                      const danisan = danisanlar.find(d => d.id === foto.danisanId)
                      const fotografYok = !foto.fotografData
                      return (
                        <div
                          key={foto.id}
                          className={`border rounded-xl overflow-hidden transition-colors ${
                            bekleyen
                              ? 'border-border hover:border-primary/40'
                              : 'border-emerald-200 hover:border-emerald-400'
                          }`}
                        >
                          <div className="bg-muted aspect-video relative cursor-pointer" onClick={() => !fotografYok && fotoAc(foto)}>
                            {foto.fotografData
                              ? <img src={foto.fotografData} alt="Öğün" className="object-cover w-full h-full" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                              : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                  <Camera className="h-7 w-7 text-muted-foreground/30" />
                                  <p className="text-xs text-muted-foreground/50 text-center px-2">Fotoğraf yüklenemedi</p>
                                </div>
                              )}
                            {/* Sil butonu — her zaman görünür */}
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                gonderimSil(foto.id)
                                setGonderimler(getGonderimler())
                              }}
                              className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-black/70 rounded-full p-0.5 transition-colors"
                              title="Kaydı sil"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                            {!bekleyen && (
                              <div className="absolute top-1.5 left-1.5 bg-emerald-500 rounded-full p-0.5">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-xs font-medium">{danisan ? `${danisan.ad} ${danisan.soyad}` : 'Bilinmeyen danışan'}</p>
                            <p className="text-xs text-muted-foreground">{foto.ogun} · {zamanFormatla(foto.zaman)}</p>
                            {bekleyen ? (
                              fotografYok ? (
                                <button
                                  onClick={() => { gonderimSil(foto.id); setGonderimler(getGonderimler()) }}
                                  className="w-full h-7 text-xs mt-2 border border-dashed border-destructive/40 text-destructive/70 rounded-lg hover:bg-destructive/5 transition-colors"
                                >
                                  Geçersiz kaydı sil
                                </button>
                              ) : (
                                <Button size="sm" className="w-full h-7 text-xs mt-2 gap-1" onClick={() => fotoAc(foto)}>
                                  <Send className="h-3 w-3" /> İncele & Yanıtla
                                </Button>
                              )
                            ) : (
                              <button onClick={() => fotoAc(foto)} className="mt-1.5 w-full text-xs text-emerald-600 hover:text-emerald-800 font-medium text-left">
                                Yorumu gör →
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </CardContent>
        </Card>

        {/* Mesajlar */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                Danışan Mesajları
              </CardTitle>
              {bekleyenMesajlar.length > 0
                ? <Badge variant="warning">{bekleyenMesajlar.length} bekliyor</Badge>
                : <Badge variant="success">Tümü yanıtlandı ✓</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              const gosterilecek = bekleyenMesajlar.length > 0
                ? bekleyenMesajlar
                : gonderimler.filter(g => g.tur === 'mesaj' && g.diyetisyenYorumu).slice(0, 4)

              if (gosterilecek.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <MessageCircle className="h-8 w-8 text-muted-foreground/20" />
                    Henüz mesaj gönderilmedi.
                  </div>
                )
              }

              const bekleyen = bekleyenMesajlar.length > 0
              return (
                <>
                  {!bekleyen && <p className="text-xs text-muted-foreground mb-2">Son yanıtlanan mesajlar:</p>}
                  <div className="space-y-2">
                    {gosterilecek.map(m => {
                      const danisan = danisanlar.find(d => d.id === m.danisanId)
                      if (!danisan) return null
                      return (
                        <div key={m.id} className={`flex items-start gap-3 border rounded-xl p-3.5 ${
                          bekleyen ? 'border-indigo-100 bg-indigo-50/50' : 'border-emerald-100 bg-emerald-50/30'
                        }`}>
                          <div className={`rounded-full p-2 shrink-0 ${bekleyen ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                            <MessageCircle className={`h-4 w-4 ${bekleyen ? 'text-indigo-600' : 'text-emerald-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{danisan.ad} {danisan.soyad}</p>
                            <p className="text-sm text-foreground/80 mt-0.5 line-clamp-2">{m.deger}</p>
                            {!bekleyen && m.diyetisyenYorumu && (
                              <p className="text-xs text-emerald-700 mt-1 italic line-clamp-1">↳ {m.diyetisyenYorumu}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">{zamanFormatla(m.zaman)}</p>
                          </div>
                          <Button size="sm" variant="outline" className={`shrink-0 gap-1 text-xs ${
                            bekleyen
                              ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          }`} onClick={() => mesajAc(m)}>
                            <Send className="h-3 w-3" /> {bekleyen ? 'Yanıtla' : 'Görüntüle'}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </CardContent>
        </Card>

      </div>

      {/* ─── Mesaj Yanıt Modalı ─── */}
      {aktifMesaj && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={mesajKapat}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                {(() => {
                  const d = danisanlar.find(x => x.id === aktifMesaj.danisanId)
                  return <p className="font-semibold">{d?.ad} {d?.soyad}</p>
                })()}
                <p className="text-sm text-muted-foreground">{zamanFormatla(aktifMesaj.zaman)}</p>
              </div>
              <button onClick={mesajKapat} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
                <p className="text-xs text-indigo-500 font-medium mb-1 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" /> Danışan mesajı
                </p>
                <p className="text-sm text-indigo-900">{aktifMesaj.deger}</p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1.5">Yanıtınız</p>
                <textarea
                  value={mesajYanit}
                  onChange={e => setMesajYanit(e.target.value)}
                  placeholder="Danışanınıza yanıt yazın…"
                  rows={4}
                  className="w-full rounded-xl border border-input px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              {mesajYanitGonderildi ? (
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-emerald-700 font-medium text-sm flex items-center justify-center gap-1.5">
                    <Check className="h-4 w-4" /> Yanıt gönderildi!
                  </p>
                </div>
              ) : (
                <Button onClick={mesajYanitGonder} disabled={!mesajYanit.trim()} className="gap-1.5 w-full">
                  <Send className="h-4 w-4" /> Danışana Gönder
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Fotoğraf İnceleme Modalı ─── */}
      {aktifFoto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={fotoKapat}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>

            {/* Modal başlık */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                {(() => {
                  const d = danisanlar.find(x => x.id === aktifFoto.danisanId)
                  return <p className="font-semibold">{d?.ad} {d?.soyad}</p>
                })()}
                <p className="text-sm text-muted-foreground">
                  {aktifFoto.ogun} · {zamanFormatla(aktifFoto.zaman)}
                </p>
              </div>
              <button onClick={fotoKapat} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 divide-x divide-border">

              {/* Sol: Fotoğraf + kalori */}
              <div className="flex flex-col">
                {aktifFoto.fotografData ? (
                  <img
                    src={aktifFoto.fotografData}
                    alt="Öğün"
                    className="w-full aspect-square object-cover"
                    onError={e => {
                      const el = e.target as HTMLImageElement
                      el.style.display = 'none'
                      el.parentElement!.insertAdjacentHTML('afterbegin', '<div class="aspect-square bg-muted flex flex-col items-center justify-center gap-2"><svg class="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg><p class="text-sm text-gray-400">Fotoğraf görüntülenemiyor</p></div>')
                    }}
                  />
                ) : (
                  <div className="aspect-square bg-muted flex flex-col items-center justify-center gap-2">
                    <Camera className="h-16 w-16 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground/60">Fotoğraf mevcut değil</p>
                  </div>
                )}

                {/* Kalori tahmini */}
                <div className="p-4 bg-amber-50/50 border-t border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-semibold text-amber-800">AI Kalori Tahmini</p>
                  </div>
                  {kaloriHesaplaniyor ? (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                      <p className="text-xs text-amber-600">Fotoğraf analiz ediliyor…</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Flame className="h-5 w-5 text-amber-500" />
                        <span className="text-2xl font-bold text-amber-700">~{kalori}</span>
                        <span className="text-sm text-amber-600 font-medium">kcal</span>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={kalori ?? ''}
                          onChange={e => setKalori(Number(e.target.value))}
                          className="w-20 text-sm border border-amber-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-amber-400"
                          placeholder="Düzenle"
                        />
                        <p className="text-xs text-amber-500 mt-0.5">Düzenleyebilirsiniz</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sağ: Yorum editörü */}
              <div className="flex flex-col p-5 gap-4">
                <div>
                  <p className="font-semibold mb-0.5">Danışana Yorum Yaz</p>
                  <p className="text-xs text-muted-foreground">Yazdığınız yorum danışanın portalında görünecek.</p>
                </div>

                {/* Hızlı yanıtlar */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Hızlı yanıtlar:</p>
                  <div className="flex flex-col gap-1.5">
                    {HIZLI_YANITLAR.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => setYorum(h)}
                        className="text-left text-xs px-2.5 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/3 transition-colors line-clamp-1"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Yorum textarea */}
                <div className="flex-1 flex flex-col gap-2">
                  <Textarea
                    placeholder="Yorumunuzu yazın… (örn: Harika bir tercih! Porsiyonlar dengeli görünüyor. 👏)"
                    value={yorum}
                    onChange={e => setYorum(e.target.value)}
                    className="flex-1 resize-none text-sm min-h-[100px]"
                  />
                </div>

                {/* Gönder */}
                {yorumGonderildi ? (
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-emerald-700 font-medium text-sm flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4" /> Yorum gönderildi!
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={yorumuGonder}
                    disabled={!yorum.trim() || kaloriHesaplaniyor}
                    className="gap-1.5 w-full"
                  >
                    <Send className="h-4 w-4" /> Danışana Gönder
                  </Button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DanisanGirisRow({ danisan }: { danisan: Danisan }) {
  const [acik, setAcik] = useState(false)
  const [hesapVar, setHesapVar] = useState<boolean | null>(null)
  const [email, setEmail] = useState(danisan.email ?? "")
  const [sifre, setSifre] = useState("")
  const [sifreGoster, setSifreGoster] = useState(false)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [sonuc, setSonuc] = useState<{ ok: boolean; mesaj: string } | null>(null)
  const [kopyalandi, setKopyalandi] = useState(false)

  // Hesap durumunu kontrol et
  useEffect(() => {
    fetch(`/api/portal/auth/hesap-var?danisanId=${danisan.id}`)
      .then(r => r.json())
      .then((d: { var: boolean }) => setHesapVar(d.var))
      .catch(() => setHesapVar(false))
  }, [danisan.id])

  async function hesapKaydet() {
    if (!email.trim() || !sifre.trim()) return
    setKaydediliyor(true)
    setSonuc(null)
    try {
      const res = await fetch("/api/portal/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ danisanId: danisan.id, email: email.trim(), sifre }),
      })
      const data = await res.json() as { ok: boolean; hata?: string }
      setSonuc(data.ok
        ? { ok: true, mesaj: "Hesap oluşturuldu!" }
        : { ok: false, mesaj: data.hata ?? "Hata oluştu" })
      if (data.ok) {
        setHesapVar(true)
        setSifre("")
        setTimeout(() => { setSonuc(null); setAcik(false) }, 2000)
      }
    } catch {
      setSonuc({ ok: false, mesaj: "Bağlantı hatası" })
    } finally {
      setKaydediliyor(false)
    }
  }

  function bilgiKopyala() {
    navigator.clipboard.writeText(`Portal: http://localhost:3000/portal/login\nE-posta: ${email}`)
    setKopyalandi(true)
    setTimeout(() => setKopyalandi(false), 2000)
  }

  return (
    <div className="border-b border-border last:border-0">
      <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarFallback className="text-xs">{getInitials(danisan.ad, danisan.soyad)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{danisan.ad} {danisan.soyad}</p>
          <p className="text-xs text-muted-foreground truncate">{danisan.email ?? "—"}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hesapVar === true && (
            <div title="Portal hesabı aktif">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          )}
          <Badge variant={getDanisanDurumVariant(danisan.durum)} className="text-xs">
            {getDanisanDurumLabel(danisan.durum)}
          </Badge>
          {hesapVar && (
            <button onClick={bilgiKopyala} title="Link kopyala" className="text-muted-foreground hover:text-foreground p-1 rounded">
              {kopyalandi ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
          <button
            onClick={() => setAcik(!acik)}
            className="text-xs text-primary hover:underline px-1"
          >
            {hesapVar ? "Güncelle" : "Hesap Oluştur"}
          </button>
        </div>
      </div>

      {acik && (
        <div className="px-4 pb-3 bg-muted/20 space-y-2">
          <p className="text-xs text-muted-foreground pt-2">
            {hesapVar ? "Şifre veya e-posta güncelle:" : "Danışan portal hesabı oluştur:"}
          </p>
          <Input
            type="email"
            placeholder="E-posta adresi"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="relative">
            <Input
              type={sifreGoster ? "text" : "password"}
              placeholder="Şifre (en az 6 karakter)"
              value={sifre}
              onChange={e => setSifre(e.target.value)}
              className="h-8 text-xs pr-8"
            />
            <button
              type="button"
              onClick={() => setSifreGoster(!sifreGoster)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {sifreGoster ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          {sonuc && (
            <p className={`text-xs font-medium ${sonuc.ok ? "text-emerald-600" : "text-destructive"}`}>
              {sonuc.ok ? "✓" : "✗"} {sonuc.mesaj}
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs gap-1 flex-1" onClick={hesapKaydet} disabled={kaydediliyor || !email.trim() || !sifre.trim()}>
              <ShieldCheck className="h-3 w-3" />
              {kaydediliyor ? "Kaydediliyor…" : (hesapVar ? "Güncelle" : "Oluştur")}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAcik(false)}>İptal</Button>
          </div>
        </div>
      )}
    </div>
  )
}
