"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity, LayoutDashboard, Users, CalendarDays,
  Salad, Ruler, CreditCard, Settings, LogOut,
  MessageCircle, Smartphone, CheckSquare, Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Genel Bakış" },
  { href: "/danisanlar", icon: Users, label: "Danışanlar" },
  { href: "/randevular", icon: CalendarDays, label: "Takvim" },
  { href: "/diyet-planlari", icon: Salad, label: "Diyet Planları" },
  { href: "/olcumler", icon: Ruler, label: "Ölçümler" },
  { href: "/odemeler", icon: CreditCard, label: "Ödemeler" },
  { href: "/whatsapp", icon: MessageCircle, label: "WhatsApp Bot" },
  { href: "/portal", icon: Smartphone, label: "Danışan Portali" },
  { href: "/gorevler", icon: CheckSquare, label: "Görevler" },
  { href: "/loyalty",  icon: Trophy,      label: "Sadakat"  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <aside className="flex flex-col w-56 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
        <div className="bg-primary rounded-lg p-1.5 shrink-0">
          <Activity className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-sidebar-foreground block leading-none">VitaNorm</span>
          <span className="text-xs text-muted-foreground">Diyetisyen CRM</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
              {label}
            </Link>
          )
        })}

        <div className="pt-3 mt-3 border-t border-sidebar-border">
          <Link
            href="/ayarlar"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/ayarlar")
                ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Ayarlar
          </Link>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
