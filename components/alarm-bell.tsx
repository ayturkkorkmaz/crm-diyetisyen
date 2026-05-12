"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, CheckCheck, AlertCircle, Zap, CheckSquare, Calendar, Clock, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRandevular, useDanisanlar } from "@/lib/crm-store"

interface Alarm {
  id: string
  tip: string
  baslik: string
  mesaj: string
  danisanAd?: string
  okundu: boolean
  olusturulduAt: string
}

function tipIcon(tip: string) {
  if (tip === "gorev") return CheckSquare
  if (tip === "sequence") return Zap
  return AlertCircle
}

function tipRenk(tip: string): string {
  if (tip === "gorev") return "text-amber-500 bg-amber-50"
  if (tip === "sequence") return "text-blue-500 bg-blue-50"
  return "text-violet-500 bg-violet-50"
}

function zamanGecti(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return "az önce"
  if (diff < 60) return `${diff} dk önce`
  const saat = Math.floor(diff / 60)
  if (saat < 24) return `${saat} sa önce`
  return `${Math.floor(saat / 24)} gün önce`
}

function tarihFormat(tarih: string): string {
  const bugun = new Date().toISOString().slice(0, 10)
  const yarin = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  if (tarih === bugun) return "Bugün"
  if (tarih === yarin) return "Yarın"
  const d = new Date(tarih)
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
}

function durumRenk(durum: string): string {
  if (durum === "tamamlandi") return "bg-emerald-100 text-emerald-700"
  if (durum === "iptal") return "bg-red-100 text-red-600"
  return "bg-blue-100 text-blue-700"
}

function durumLabel(durum: string): string {
  if (durum === "tamamlandi") return "Tamamlandı"
  if (durum === "iptal") return "İptal"
  return "Planlandı"
}

export function AlarmBell() {
  const [alarmlar, setAlarmlar] = useState<Alarm[]>([])
  const [bekleyen, setBekleyen] = useState(0)
  const [acik, setAcik] = useState(false)
  const randevular = useRandevular()
  const danisanlar = useDanisanlar()

  // Bugün ve sonraki 7 günlük randevuları getir
  const bugun = new Date().toISOString().slice(0, 10)
  const yediGunSonra = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  const yaklasanRandevular = randevular
    .filter(r => r.durum !== "iptal" && r.tarih >= bugun && r.tarih <= yediGunSonra)
    .sort((a, b) => a.tarih === b.tarih ? a.saat.localeCompare(b.saat) : a.tarih.localeCompare(b.tarih))
    .slice(0, 5)

  const danisanMap = new Map(danisanlar.map(d => [d.id, d]))

  const yukle = useCallback(async () => {
    try {
      const res = await fetch("/api/alarmlar", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json() as { alarmlar: Alarm[]; bekleyen: number }
      setAlarmlar(data.alarmlar)
      setBekleyen(data.bekleyen)
    } catch { /* sessiz */ }
  }, [])

  useEffect(() => {
    yukle()
    const iv = setInterval(yukle, 30000)
    return () => clearInterval(iv)
  }, [yukle])

  async function tumunuOku() {
    await fetch("/api/alarmlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tumunu: true }),
    })
    setAlarmlar(prev => prev.map(a => ({ ...a, okundu: true })))
    setBekleyen(0)
  }

  async function alarmOku(id: string) {
    await fetch("/api/alarmlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    })
    setAlarmlar(prev => prev.map(a => a.id === id ? { ...a, okundu: true } : a))
    setBekleyen(prev => Math.max(0, prev - 1))
  }

  const toplamBildirim = bekleyen + yaklasanRandevular.filter(r => r.tarih === bugun).length

  return (
    <DropdownMenu open={acik} onOpenChange={v => { setAcik(v); if (v) yukle() }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {toplamBildirim > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
              {toplamBildirim > 9 ? "9+" : toplamBildirim}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] max-h-[560px] overflow-y-auto p-0">
        {/* ── Başlık ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Bildirimler</span>
            {toplamBildirim > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1.5 h-5">{toplamBildirim}</Badge>
            )}
          </div>
          {bekleyen > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={tumunuOku}>
              <CheckCheck className="h-3 w-3" />Tümünü oku
            </Button>
          )}
        </div>

        {/* ── Yaklaşan Randevular ── */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              Yaklaşan Randevular
            </span>
            <a href="/randevular" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Tümü <ChevronRight className="h-3 w-3" />
            </a>
          </div>

          {yaklasanRandevular.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">Önümüzdeki 7 günde randevu yok</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {yaklasanRandevular.map(r => {
                const d = danisanMap.get(r.danisan_id)
                const isToday = r.tarih === bugun
                return (
                  <a
                    key={r.id}
                    href={`/danisanlar/${r.danisan_id}`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60 ${
                      isToday ? "bg-blue-50/60 border border-blue-100" : "bg-muted/30"
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isToday ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {d ? `${d.ad[0]}${d.soyad[0]}` : <User className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {d ? `${d.ad} ${d.soyad}` : "Danışan"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-semibold ${isToday ? "text-blue-600" : "text-muted-foreground"}`}>
                          {tarihFormat(r.tarih)}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />{r.saat}
                        </span>
                        {r.tur && (
                          <span className="text-[10px] text-muted-foreground">{r.tur}</span>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${durumRenk(r.durum)}`}>
                      {durumLabel(r.durum)}
                    </span>
                  </a>
                )
              })}
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="my-2" />

        {/* ── Alarmlar ── */}
        <div className="px-4 pb-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-2">
            <AlertCircle className="h-3.5 w-3.5 text-violet-500" />
            Akıllı Alarmlar
            {bekleyen > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 h-4">{bekleyen} yeni</Badge>
            )}
          </span>

          {alarmlar.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-4 text-center mb-2">
              <Bell className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">Henüz alarm yok</p>
            </div>
          ) : (
            <div className="space-y-1 mb-2">
              {alarmlar.slice(0, 8).map(alarm => {
                const Icon = tipIcon(alarm.tip)
                return (
                  <div
                    key={alarm.id}
                    onClick={() => { if (!alarm.okundu) alarmOku(alarm.id) }}
                    className={`flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/60 ${
                      alarm.okundu ? "opacity-50" : "bg-violet-50/40"
                    }`}
                  >
                    <div className={`rounded-lg p-1.5 shrink-0 mt-0.5 ${tipRenk(alarm.tip)}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-snug">{alarm.baslik}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alarm.mesaj}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{zamanGecti(alarm.olusturulduAt)}</p>
                    </div>
                    {!alarm.okundu && (
                      <div className="h-2 w-2 rounded-full bg-violet-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t px-4 py-2 bg-muted/20 flex items-center justify-between">
          <a href="/gorevler" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />Görev listesi
          </a>
          <a href="/randevular" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <Calendar className="h-3 w-3" />Tüm randevular
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
