"use client"

import { useState, useEffect, useCallback } from "react"
import { CheckSquare, Clock, AlertTriangle, ArrowUp, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Gorev {
  id: string
  danisanId?: string
  danisanAd?: string
  baslik: string
  aciklama?: string
  oncelik: "yuksek" | "orta" | "dusuk"
  durum: "bekliyor" | "tamamlandi"
  kaynak: string
  olusturulduAt: string
  tamamlandiAt?: string
}

function oncelikBadge(oncelik: string) {
  if (oncelik === "yuksek") return <Badge className="bg-red-100 text-red-700 border-red-200 gap-1"><ArrowUp className="h-3 w-3" />Yüksek</Badge>
  if (oncelik === "orta") return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><AlertTriangle className="h-3 w-3 inline mr-1" />Orta</Badge>
  return <Badge variant="outline" className="text-muted-foreground">Düşük</Badge>
}

function kaynakLabel(kaynak: string) {
  const map: Record<string, string> = {
    no_show: "No-Show",
    aktivite_dusuk: "Aktivite Düşük",
    paket_bitiyor: "Paket Bitiyor",
    yeni_kayit: "Yeni Kayıt",
    manuel: "Manuel",
  }
  return map[kaynak] ?? kaynak
}

function zamanGecti(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return "az önce"
  if (diff < 60) return `${diff} dk önce`
  const saat = Math.floor(diff / 60)
  if (saat < 24) return `${saat} sa önce`
  const gun = Math.floor(saat / 24)
  return `${gun} gün önce`
}

export default function GorevlerPage() {
  const [gorevler, setGorevler] = useState<Gorev[]>([])
  const [durum, setDurum] = useState<string>("bekliyor")
  const [yukleniyor, setYukleniyor] = useState(true)
  const [tamamlananId, setTamamlananId] = useState<string | null>(null)

  const yukle = useCallback(async () => {
    setYukleniyor(true)
    try {
      const res = await fetch(`/api/gorevler?durum=${durum}`, { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json() as { ok: boolean; gorevler: Gorev[] }
      setGorevler(data.gorevler ?? [])
    } finally {
      setYukleniyor(false)
    }
  }, [durum])

  useEffect(() => { yukle() }, [yukle])

  async function tamamla(id: string) {
    setTamamlananId(id)
    await fetch("/api/gorevler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aksiyon: "tamamla", id }),
    })
    setTamamlananId(null)
    yukle()
  }

  const bekleyenSayisi = gorevler.filter(g => g.durum === "bekliyor").length

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 rounded-xl p-2.5">
            <CheckSquare className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Görevler</h1>
            <p className="text-sm text-muted-foreground">Otomasyon tarafından oluşturulan görevler</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {durum === "bekliyor" && bekleyenSayisi > 0 && (
            <Badge className="bg-amber-500 text-white">{bekleyenSayisi} bekliyor</Badge>
          )}
          <Select value={durum} onValueChange={setDurum}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bekliyor">Bekleyenler</SelectItem>
              <SelectItem value="tamamlandi">Tamamlananlar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste */}
      {yukleniyor ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Yükleniyor…
        </div>
      ) : gorevler.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <CheckSquare className="h-10 w-10 mb-3 opacity-20" />
            <p className="font-medium">{durum === "bekliyor" ? "Bekleyen görev yok" : "Tamamlanan görev yok"}</p>
            <p className="text-xs mt-1">Otomasyon motoru danışan hareketlerini izleyerek görev oluşturur.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {gorevler.map(gorev => (
            <Card key={gorev.id} className={`transition-opacity ${tamamlananId === gorev.id ? "opacity-50" : ""}`}>
              <CardContent className="flex items-start gap-4 py-4">
                {/* Öncelik göstergesi */}
                <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                  gorev.oncelik === "yuksek" ? "bg-red-500" :
                  gorev.oncelik === "orta" ? "bg-amber-500" : "bg-slate-300"
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className={`text-sm font-medium leading-snug ${gorev.durum === "tamamlandi" ? "line-through text-muted-foreground" : ""}`}>
                      {gorev.baslik}
                    </p>
                    {oncelikBadge(gorev.oncelik)}
                  </div>
                  {gorev.aciklama && (
                    <p className="text-xs text-muted-foreground mt-1">{gorev.aciklama}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {gorev.danisanAd && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {gorev.danisanAd}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {kaynakLabel(gorev.kaynak)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {gorev.durum === "tamamlandi" && gorev.tamamlandiAt
                        ? `Tamamlandı: ${zamanGecti(gorev.tamamlandiAt)}`
                        : zamanGecti(gorev.olusturulduAt)}
                    </span>
                  </div>
                </div>

                {gorev.durum === "bekliyor" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5 text-xs"
                    disabled={tamamlananId === gorev.id}
                    onClick={() => tamamla(gorev.id)}
                  >
                    {tamamlananId === gorev.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckSquare className="h-3.5 w-3.5" />
                    )}
                    Tamamlandı
                  </Button>
                )}
                {gorev.durum === "tamamlandi" && (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 shrink-0">
                    ✓ Tamamlandı
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Açıklama */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Görevler nasıl oluşur?
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>No-Show:</strong> Danışan randevuya gelmediğinde diyetisyene görev oluşturulur</li>
            <li>• <strong>Aktivite Düşük:</strong> 5+ gün ölçüm girmeyen danışanlar için takip görevi</li>
            <li>• <strong>Paket Bitiyor:</strong> Paket bitiş tarihi yaklaşan danışanlar için yenileme görevi</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
