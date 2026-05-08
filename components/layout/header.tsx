"use client"

import { Bell, Camera, MessageCircle, Scale, Droplets } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getGonderimler, zamanFormatla } from "@/lib/portal-storage"

interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

interface BildirimItem {
  id: string
  danisanAd: string
  metin: string
  zaman: string
  tur: "fotograf" | "kilo" | "su" | "mesaj" | "wa"
}

function turIcon(tur: BildirimItem["tur"]) {
  if (tur === "fotograf") return Camera
  if (tur === "mesaj" || tur === "wa") return MessageCircle
  if (tur === "kilo") return Scale
  return Droplets
}

export function Header({ title, description, action }: HeaderProps) {
  const [bildirimler, setBildirimler] = useState<BildirimItem[]>([])

  useEffect(() => {
    function topla() {
      // Yerel portal gönderimlerinden okunmamışları al
      const yerel = getGonderimler()
        .filter(g => !g.onaylandi && g.tur !== "su")
        .slice(0, 10)
        .map(g => ({
          id: g.id,
          danisanAd: g.danisanId,  // ID — aşağıda isimle değiştirilecek
          metin: g.tur === "fotograf"
            ? `${g.ogun ?? "Öğün"} fotoğrafı gönderdi`
            : g.tur === "mesaj"
            ? `Mesaj: ${g.deger.slice(0, 50)}`
            : `Kilo girişi: ${g.deger}`,
          zaman: g.zaman,
          tur: g.tur,
        } as BildirimItem))

      setBildirimler(yerel)
    }

    topla()
    const iv = setInterval(topla, 5000)
    return () => clearInterval(iv)
  }, [])

  const sayi = bildirimler.length

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6 gap-4">
      <div>
        <h1 className="text-base font-semibold leading-none">{title}</h1>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {action && <div>{action}</div>}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {sayi > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                  {sayi > 9 ? "9+" : sayi}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Bildirimler</span>
              {sayi > 0 && (
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {sayi} yeni
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {bildirimler.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Tüm bildirimler okundu ✓
              </div>
            ) : (
              bildirimler.slice(0, 6).map(b => {
                const Icon = turIcon(b.tur)
                return (
                  <DropdownMenuItem key={b.id} asChild>
                    <Link href="/portal" className="flex items-start gap-3 cursor-pointer py-2.5">
                      <div className={`rounded-lg p-1.5 shrink-0 mt-0.5 ${
                        b.tur === "fotograf" ? "bg-amber-100 text-amber-600" :
                        b.tur === "mesaj" || b.tur === "wa" ? "bg-indigo-100 text-indigo-600" :
                        "bg-violet-100 text-violet-600"
                      }`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none mb-0.5">Danışan aktivitesi</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{b.metin}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{zamanFormatla(b.zaman)}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )
              })
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/portal" className="text-xs text-primary font-medium justify-center">
                Tümünü gör →
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/ayarlar">
          <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">Dyt</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium leading-none">Diyetisyen</p>
              <p className="text-xs text-muted-foreground mt-0.5">VitaNorm</p>
            </div>
          </button>
        </Link>
      </div>
    </header>
  )
}
