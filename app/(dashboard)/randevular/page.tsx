"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus, ChevronLeft, ChevronRight, Clock, MoreHorizontal,
  CalendarDays, LayoutGrid, AlignJustify,
} from "lucide-react"
import { useRandevular, useDanisanlar, crmStore } from "@/lib/crm-store"
import { getInitials, getRandevuDurumLabel, getRandevuDurumVariant, formatPara } from "@/lib/utils-crm"
import type { RandevuDurumu } from "@/lib/types"

type Gorünüm = "gun" | "hafta" | "ay"

const SAAT_BASLANGIC = 8
const SAAT_BITIS = 20
const PX_PER_HOUR = 64

const TURKCE_GUNLER = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"]
const TURKCE_AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
const KISA_GUNLER = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]

function tarihStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function haftaBaslangic(d: Date): Date {
  const day = d.getDay()
  // Pazartesi başlangıç
  const diff = (day === 0 ? -6 : 1 - day)
  const m = new Date(d)
  m.setDate(m.getDate() + diff)
  return m
}

function ayGunleri(yil: number, ay: number): (Date | null)[] {
  const ilk = new Date(yil, ay, 1)
  const son = new Date(yil, ay + 1, 0)
  // Haftayı Pazartesi'den başlat (0=Pzt)
  const baslangicGun = (ilk.getDay() + 6) % 7
  const gunler: (Date | null)[] = Array(baslangicGun).fill(null)
  for (let g = 1; g <= son.getDate(); g++) {
    gunler.push(new Date(yil, ay, g))
  }
  while (gunler.length % 7 !== 0) gunler.push(null)
  return gunler
}

function saatToMinutes(saat: string): number {
  const [h, m] = saat.split(":").map(Number)
  return h * 60 + m
}

const RDV_RENKLERI: Record<string, string> = {
  planlandi: "bg-blue-100 text-blue-800 border-blue-200",
  tamamlandi: "bg-emerald-100 text-emerald-800 border-emerald-200",
  iptal: "bg-red-100 text-red-800 border-red-200",
  gelmedi: "bg-orange-100 text-orange-800 border-orange-200",
}

export default function RandevularPage() {
  const randevular = useRandevular()
  const danisanlar = useDanisanlar()
  const [gorunum, setGorunum] = useState<Gorünüm>("hafta")
  const [bugun] = useState(() => new Date())
  const [secili, setSecili] = useState(() => new Date())
  const [addOpen, setAddOpen] = useState(false)

  // Randevu ekleme formu
  const [form, setForm] = useState({
    danisan_id: "", tarih: tarihStr(bugun),
    saat: "09:00", sure_dk: "60",
    tur: "Takip", ucret: "", notlar: "",
  })

  function git(yon: -1 | 1) {
    const yeni = new Date(secili)
    if (gorunum === "gun") yeni.setDate(yeni.getDate() + yon)
    else if (gorunum === "hafta") yeni.setDate(yeni.getDate() + yon * 7)
    else yeni.setMonth(yeni.getMonth() + yon)
    setSecili(yeni)
  }

  function baslik(): string {
    if (gorunum === "gun") return `${secili.getDate()} ${TURKCE_AYLAR[secili.getMonth()]} ${secili.getFullYear()} — ${TURKCE_GUNLER[secili.getDay()]}`
    if (gorunum === "hafta") {
      const bas = haftaBaslangic(secili)
      const son = new Date(bas); son.setDate(bas.getDate() + 6)
      return `${bas.getDate()} ${TURKCE_AYLAR[bas.getMonth()]} – ${son.getDate()} ${TURKCE_AYLAR[son.getMonth()]} ${son.getFullYear()}`
    }
    return `${TURKCE_AYLAR[secili.getMonth()]} ${secili.getFullYear()}`
  }

  function randevuEkle() {
    if (!form.danisan_id || !form.tarih || !form.saat) return
    const danisan = danisanlar.find(d => d.id === form.danisan_id)
    crmStore.addRandevu({
      id: `r-${Date.now()}`,
      danisan_id: form.danisan_id,
      danisan,
      tarih: form.tarih,
      saat: form.saat,
      sure_dk: Number(form.sure_dk) || 60,
      tur: form.tur || "Takip",
      durum: "planlandi",
      ucret: form.ucret ? Number(form.ucret) : undefined,
      notlar: form.notlar || undefined,
    })
    setAddOpen(false)
    setForm({ danisan_id: "", tarih: tarihStr(bugun), saat: "09:00", sure_dk: "60", tur: "Takip", ucret: "", notlar: "" })
  }

  // ── Günlük Görünüm ───────────────────────────────────────────────────────
  const GunGorunum = () => {
    const gunRdv = randevular
      .filter(r => r.tarih === tarihStr(secili))
      .sort((a, b) => a.saat.localeCompare(b.saat))

    return (
      <div className="flex gap-0">
        {/* Saat sütunu */}
        <div className="w-14 shrink-0 border-r border-border">
          {Array.from({ length: SAAT_BITIS - SAAT_BASLANGIC }).map((_, i) => (
            <div key={i} style={{ height: PX_PER_HOUR }} className="border-b border-border/50 flex items-start pt-1">
              <span className="text-xs text-muted-foreground pl-2">{String(SAAT_BASLANGIC + i).padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>
        {/* Randevular */}
        <div className="flex-1 relative" style={{ height: (SAAT_BITIS - SAAT_BASLANGIC) * PX_PER_HOUR }}>
          {Array.from({ length: SAAT_BITIS - SAAT_BASLANGIC }).map((_, i) => (
            <div key={i} style={{ top: i * PX_PER_HOUR, height: PX_PER_HOUR }} className="absolute inset-x-0 border-b border-border/30" />
          ))}
          {gunRdv.map(r => {
            const mins = saatToMinutes(r.saat) - SAAT_BASLANGIC * 60
            const top = (mins / 60) * PX_PER_HOUR
            const height = Math.max(30, (r.sure_dk / 60) * PX_PER_HOUR - 2)
            return (
              <div
                key={r.id}
                className={`absolute left-2 right-2 rounded-lg border px-2 py-1 text-xs cursor-pointer hover:shadow-md transition-shadow ${RDV_RENKLERI[r.durum]}`}
                style={{ top, height }}
              >
                <p className="font-semibold truncate">{r.danisan?.ad} {r.danisan?.soyad}</p>
                <p className="opacity-70">{r.saat} · {r.tur}</p>
              </div>
            )
          })}
          {gunRdv.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Bu gün için randevu yok
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Haftalık Görünüm ─────────────────────────────────────────────────────
  const HaftaGorunum = () => {
    const pzt = haftaBaslangic(secili)
    const gunler = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(pzt); d.setDate(pzt.getDate() + i); return d
    })

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Başlık */}
          <div className="flex border-b border-border">
            <div className="w-14 shrink-0" />
            {gunler.map(g => {
              const bugunMu = tarihStr(g) === tarihStr(bugun)
              return (
                <div
                  key={g.toISOString()}
                  className="flex-1 text-center py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => { setSecili(g); setGorunum("gun") }}
                >
                  <p className="text-xs text-muted-foreground">{KISA_GUNLER[(g.getDay())]}</p>
                  <p className={`text-sm font-semibold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto ${bugunMu ? "bg-primary text-primary-foreground" : ""}`}>
                    {g.getDate()}
                  </p>
                </div>
              )
            })}
          </div>
          {/* Saat ızgarası */}
          <div className="flex">
            <div className="w-14 shrink-0 border-r border-border">
              {Array.from({ length: SAAT_BITIS - SAAT_BASLANGIC }).map((_, i) => (
                <div key={i} style={{ height: PX_PER_HOUR }} className="border-b border-border/30 flex items-start pt-1">
                  <span className="text-xs text-muted-foreground pl-1">{String(SAAT_BASLANGIC + i).padStart(2, "0")}:00</span>
                </div>
              ))}
            </div>
            {gunler.map(g => {
              const str = tarihStr(g)
              const gunRdv = randevular.filter(r => r.tarih === str)
              return (
                <div
                  key={str}
                  className="flex-1 relative border-r border-border/30"
                  style={{ height: (SAAT_BITIS - SAAT_BASLANGIC) * PX_PER_HOUR }}
                >
                  {Array.from({ length: SAAT_BITIS - SAAT_BASLANGIC }).map((_, i) => (
                    <div key={i} style={{ top: i * PX_PER_HOUR, height: PX_PER_HOUR }} className="absolute inset-x-0 border-b border-border/20" />
                  ))}
                  {gunRdv.map(r => {
                    const mins = saatToMinutes(r.saat) - SAAT_BASLANGIC * 60
                    const top = (mins / 60) * PX_PER_HOUR
                    const height = Math.max(24, (r.sure_dk / 60) * PX_PER_HOUR - 2)
                    return (
                      <div
                        key={r.id}
                        className={`absolute left-0.5 right-0.5 rounded border px-1 py-0.5 text-xs cursor-pointer hover:shadow-md transition-shadow ${RDV_RENKLERI[r.durum]}`}
                        style={{ top, height }}
                      >
                        <p className="font-semibold truncate leading-tight">{r.danisan?.ad} {r.danisan?.soyad?.charAt(0)}.</p>
                        <p className="opacity-70 leading-tight truncate">{r.saat}</p>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── Aylık Görünüm ────────────────────────────────────────────────────────
  const AyGorunum = () => {
    const gunler = ayGunleri(secili.getFullYear(), secili.getMonth())
    const haftaSayisi = gunler.length / 7

    return (
      <div>
        {/* Haftanın günleri başlığı */}
        <div className="grid grid-cols-7 border-b border-border">
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(g => (
            <div key={g} className="text-center text-xs font-medium text-muted-foreground py-2">{g}</div>
          ))}
        </div>
        {/* Günler */}
        <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${haftaSayisi}, minmax(80px, 1fr))` }}>
          {gunler.map((gun, idx) => {
            if (!gun) return <div key={idx} className="border-b border-r border-border/30 bg-muted/20" />
            const str = tarihStr(gun)
            const gunRdv = randevular.filter(r => r.tarih === str)
            const bugunMu = str === tarihStr(bugun)
            const ayCdisi = gun.getMonth() !== secili.getMonth()

            return (
              <div
                key={str}
                className={`border-b border-r border-border/30 p-1 cursor-pointer hover:bg-muted/30 transition-colors min-h-[80px] ${ayCdisi ? "bg-muted/20" : ""}`}
                onClick={() => { setSecili(gun); setGorunum("gun") }}
              >
                <p className={`text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center mb-1 ${bugunMu ? "bg-primary text-primary-foreground" : ayCdisi ? "text-muted-foreground/50" : "text-foreground"}`}>
                  {gun.getDate()}
                </p>
                <div className="space-y-0.5">
                  {gunRdv.slice(0, 3).map(r => (
                    <div
                      key={r.id}
                      className={`text-xs rounded px-1 truncate ${RDV_RENKLERI[r.durum]}`}
                    >
                      {r.saat} {r.danisan?.ad}
                    </div>
                  ))}
                  {gunRdv.length > 3 && (
                    <p className="text-xs text-muted-foreground pl-1">+{gunRdv.length - 3} daha</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const toplamRdv = randevular.length
  const planlanmis = randevular.filter(r => r.durum === "planlandi").length
  const bugunRdv = randevular.filter(r => r.tarih === tarihStr(bugun)).length

  return (
    <>
      <Header
        title="Takvim"
        description="Randevu takvimini yönetin"
        action={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" />Randevu Ekle</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Yeni Randevu</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Danışan <span className="text-destructive">*</span></Label>
                  <Select value={form.danisan_id} onValueChange={v => setForm(p => ({ ...p, danisan_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Danışan seçin" /></SelectTrigger>
                    <SelectContent>
                      {danisanlar.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.ad} {d.soyad}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tarih</Label>
                    <Input type="date" value={form.tarih} onChange={e => setForm(p => ({ ...p, tarih: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Saat</Label>
                    <Input type="time" value={form.saat} onChange={e => setForm(p => ({ ...p, saat: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Seans Türü</Label>
                    <Select value={form.tur} onValueChange={v => setForm(p => ({ ...p, tur: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="İlk Görüşme">İlk Görüşme</SelectItem>
                        <SelectItem value="Takip">Takip</SelectItem>
                        <SelectItem value="Ölçüm">Ölçüm</SelectItem>
                        <SelectItem value="Kontrol">Kontrol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Süre (dk)</Label>
                    <Input type="number" value={form.sure_dk} onChange={e => setForm(p => ({ ...p, sure_dk: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Ücret (₺)</Label>
                  <Input type="number" placeholder="350" value={form.ucret} onChange={e => setForm(p => ({ ...p, ucret: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Notlar</Label>
                  <Textarea rows={2} value={form.notlar} onChange={e => setForm(p => ({ ...p, notlar: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>İptal</Button>
                <Button onClick={randevuEkle} disabled={!form.danisan_id || !form.tarih || !form.saat}>Kaydet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-6 space-y-4">
        {/* Özet */}
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="p-3 flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary shrink-0" />
            <div><p className="text-xs text-muted-foreground">Bugün</p><p className="text-xl font-bold">{bugunRdv}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-3 flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-500 shrink-0" />
            <div><p className="text-xs text-muted-foreground">Planlanmış</p><p className="text-xl font-bold">{planlanmis}</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-3 flex items-center gap-3">
            <AlignJustify className="h-5 w-5 text-muted-foreground shrink-0" />
            <div><p className="text-xs text-muted-foreground">Toplam</p><p className="text-xl font-bold">{toplamRdv}</p></div>
          </CardContent></Card>
        </div>

        {/* Takvim */}
        <Card className="overflow-hidden">
          {/* Kontrol Çubuğu */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => git(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSecili(new Date(bugun))}>
                Bugün
              </Button>
              <Button variant="outline" size="sm" onClick={() => git(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-sm ml-2">{baslik()}</span>
            </div>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              {([["gun", "Günlük", <AlignJustify key="g" className="h-3.5 w-3.5" />], ["hafta", "Haftalık", <LayoutGrid key="h" className="h-3.5 w-3.5" />], ["ay", "Aylık", <CalendarDays key="a" className="h-3.5 w-3.5" />]] as const).map(([v, l, icon]) => (
                <button
                  key={v}
                  onClick={() => setGorunum(v as Gorünüm)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${gorunum === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {icon}{l}
                </button>
              ))}
            </div>
          </div>

          {/* Görünüm İçeriği */}
          <div className={gorunum !== "ay" ? "overflow-y-auto max-h-[580px]" : ""}>
            {gorunum === "gun" && <GunGorunum />}
            {gorunum === "hafta" && <HaftaGorunum />}
            {gorunum === "ay" && <AyGorunum />}
          </div>
        </Card>

        {/* Yaklaşan Randevular Listesi */}
        {gorunum !== "gun" && (
          <div>
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Yaklaşan Randevular</h2>
            <div className="space-y-2">
              {randevular
                .filter(r => r.tarih >= tarihStr(bugun) && r.durum === "planlandi")
                .sort((a, b) => `${a.tarih}${a.saat}`.localeCompare(`${b.tarih}${b.saat}`))
                .slice(0, 8)
                .map(r => (
                  <Card key={r.id} className="hover:border-primary/20 transition-colors">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="text-center w-16 shrink-0 bg-muted rounded-lg p-2">
                        <p className="text-sm font-bold text-primary">{r.saat}</p>
                        <p className="text-xs text-muted-foreground">{r.sure_dk} dk</p>
                      </div>
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback>{r.danisan ? getInitials(r.danisan.ad, r.danisan.soyad) : "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <Link href={`/danisanlar/${r.danisan_id}`} className="font-medium text-sm hover:text-primary">
                          {r.danisan?.ad} {r.danisan?.soyad}
                        </Link>
                        <p className="text-xs text-muted-foreground">{r.tur} · {r.tarih}</p>
                      </div>
                      <Badge variant={getRandevuDurumVariant(r.durum)}>{getRandevuDurumLabel(r.durum)}</Badge>
                      {r.ucret && <p className="text-sm font-semibold shrink-0">{formatPara(r.ucret)}</p>}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => crmStore.updateRandevuDurum(r.id, "tamamlandi")}>
                            Tamamlandı İşaretle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => crmStore.updateRandevuDurum(r.id, "iptal")}>
                            İptal Et
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => crmStore.updateRandevuDurum(r.id, "gelmedi")}>
                            Gelmedi İşaretle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
