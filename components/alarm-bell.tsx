"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, CheckCheck, AlertCircle, Zap, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

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

function tipRenk(tip: string) {
  if (tip === "gorev") return "text-amber-500 bg-amber-50"
  if (tip === "sequence") return "text-blue-500 bg-blue-50"
  return "text-violet-500 bg-violet-50"
}

function zamanGecti(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return "az önce"
  if (diff < 60) return `${diff} dk`
  const saat = Math.floor(diff / 60)
  if (saat < 24) return `${saat} sa`
  return `${Math.floor(saat / 24)} gün`
}

export function AlarmBell() {
  const [alarmlar, setAlarmlar] = useState<Alarm[]>([])
  const [bekleyen, setBekleyen] = useState(0)
  const [acik, setAcik] = useState(false)

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

  return (
    <DropdownMenu open={acik} onOpenChange={v => { setAcik(v); if (v) yukle() }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {bekleyen > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
              {bekleyen > 9 ? "9+" : bekleyen}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-h-[480px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Akıllı Alarmlar
            {bekleyen > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1.5">{bekleyen}</Badge>
            )}
          </span>
          {bekleyen > 0 && (
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={tumunuOku}>
              <CheckCheck className="h-3 w-3" />Tümünü oku
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {alarmlar.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
            Alarm yok
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alarmlar.slice(0, 15).map(alarm => {
              const Icon = tipIcon(alarm.tip)
              return (
                <div
                  key={alarm.id}
                  onClick={() => { if (!alarm.okundu) alarmOku(alarm.id) }}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/40 ${
                    alarm.okundu ? "opacity-60" : "bg-amber-50/40"
                  }`}
                >
                  <div className={`rounded-lg p-1.5 shrink-0 mt-0.5 ${tipRenk(alarm.tip)}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{alarm.baslik}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{alarm.mesaj}</p>
                    <p className="text-xs text-muted-foreground mt-1">{zamanGecti(alarm.olusturulduAt)}</p>
                  </div>
                  {!alarm.okundu && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        <DropdownMenuSeparator />
        <div className="px-4 py-2">
          <a href="/gorevler" className="text-xs text-primary font-medium hover:underline">
            Görev listesini görüntüle →
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
