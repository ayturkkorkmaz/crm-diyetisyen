"use client"

import { use, useState } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft, Phone, Mail, Ruler, Target, AlertTriangle,
  Calendar, TrendingDown, TrendingUp, Salad, CreditCard, Plus,
  Activity, Brain, BarChart2, Scale, CheckCircle2, Clock, Trash2, MoreHorizontal,
  Upload, FileSpreadsheet,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DanisanDuzenleDialog } from "@/components/danisan-duzenle-dialog"
import { useDanisanlar, useOlcumler, useRandevular, useDiyetPlanlari, useOdemeler, crmStore } from "@/lib/crm-store"
import {
  getInitials, getDanisanDurumLabel, getDanisanDurumVariant, getHedefLabel,
  hesaplaYas, hesaplaBMI, bmiyeGoreEtiket, formatPara, formatTarih,
  getRandevuDurumLabel, getRandevuDurumVariant, getOdemeDurumLabel, getOdemeDurumVariant,
} from "@/lib/utils-crm"
import type { Olcum, Odeme, OdemeDurumu } from "@/lib/types"
import { tanitaCsvParse } from "@/lib/tanita-csv"

interface Props { params: Promise<{ id: string }> }

// ── SVG Çizgi Grafiği Bileşeni ────────────────────────────────────────────────
function CizgiGrafik({
  degerler, renkler = "hsl(var(--primary))", etiket, birim,
}: {
  degerler: { tarih: string; deger: number }[]
  renkler?: string
  etiket: string
  birim: string
}) {
  if (degerler.length < 2) return (
    <div className="flex flex-col items-center justify-center h-24 text-xs text-muted-foreground">
      <Scale className="h-6 w-6 mb-1 opacity-30" />
      En az 2 ölçüm gerekli
    </div>
  )

  const W = 320, H = 90, PAD = 20
  const vals = degerler.map(d => d.deger)
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const range = maxV - minV || 1

  const points = degerler.map((d, i) => ({
    x: PAD + (i / (degerler.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (d.deger - minV) / range) * (H - PAD * 2),
    deger: d.deger,
    tarih: d.tarih,
  }))
  const polyline = points.map(p => `${p.x},${p.y}`).join(" ")
  const area = `M${points[0].x},${H - PAD} ${points.map(p => `L${p.x},${p.y}`).join(" ")} L${points[points.length - 1].x},${H - PAD} Z`

  const son = degerler[degerler.length - 1].deger
  const onceki = degerler[degerler.length - 2].deger
  const delta = Math.round((son - onceki) * 10) / 10

  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold">{son}</span>
        <span className="text-xs text-muted-foreground">{birim}</span>
        {delta !== 0 && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${delta < 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {delta < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {delta > 0 ? `+${delta}` : delta}
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{etiket}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id={`grad-${etiket}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={renkler} stopOpacity="0.15" />
            <stop offset="100%" stopColor={renkler} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${etiket})`} />
        <polyline points={polyline} fill="none" stroke={renkler} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={renkler} />
            <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="8" fill="hsl(var(--foreground))" fontWeight="600">{p.deger}</text>
          </g>
        ))}
        {points.map((p, i) => (
          <text key={`t${i}`} x={p.x} y={H - 2} textAnchor="middle" fontSize="7.5" fill="hsl(var(--muted-foreground))">
            {p.tarih.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ── Bölgesel Değişim Görsel Bileşen ──────────────────────────────────────────
function BolgeselAnaliz({ olcumler }: { olcumler: Olcum[] }) {
  if (olcumler.length < 2) return null
  const ilk = [...olcumler].sort((a, b) => a.tarih.localeCompare(b.tarih))[0]
  const son = olcumler[0]

  const bolge = (label: string, ilkVal?: number, sonVal?: number, birim = "cm") => {
    if (!ilkVal || !sonVal) return null
    const delta = Math.round((sonVal - ilkVal) * 10) / 10
    const azaldi = delta < 0
    return (
      <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
        <span className="text-sm font-medium w-20 shrink-0">{label}</span>
        <div className="flex items-center gap-2 flex-1">
          <Progress
            value={100 - Math.min(100, Math.max(0, Math.abs(delta / (ilkVal || 1)) * 100 * 5))}
            className="h-2 flex-1"
          />
          <span className="text-xs text-muted-foreground w-12 text-right">{sonVal} {birim}</span>
        </div>
        <span className={`text-xs font-semibold w-16 text-right ${azaldi ? "text-emerald-600" : "text-rose-500"}`}>
          {delta > 0 ? `+${delta}` : delta} {birim}
        </span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-violet-500" />
          Bölgesel Değişim ({formatTarih(ilk.tarih)} → {formatTarih(son.tarih)})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {bolge("Bel", ilk.bel_cm, son.bel_cm)}
        {bolge("Kalça", ilk.kalca_cm, son.kalca_cm)}
        {bolge("Göğüs", ilk.gogus_cm, son.gogus_cm)}
        {bolge("Kol", ilk.kol_cm, son.kol_cm)}
        {bolge("Bacak", ilk.bacak_cm, son.bacak_cm)}
        {!ilk.bel_cm && !ilk.kalca_cm && !ilk.kol_cm && (
          <p className="text-xs text-muted-foreground text-center py-2">Bölgesel ölçüm girilmemiş</p>
        )}
      </CardContent>
    </Card>
  )
}

// ── AI Analiz Raporu ─────────────────────────────────────────────────────────
function AIAnaliz({ olcumler, ad }: { olcumler: Olcum[]; ad: string }) {
  if (olcumler.length < 2) return null

  const sorted = [...olcumler].sort((a, b) => a.tarih.localeCompare(b.tarih))
  const son = sorted[sorted.length - 1]
  const onceki = sorted[sorted.length - 2]

  const kiloFark = Math.round((son.kilo_kg - onceki.kilo_kg) * 10) / 10
  const yagFark = son.yag_orani && onceki.yag_orani
    ? Math.round((son.yag_orani - onceki.yag_orani) * 10) / 10
    : null
  const kasFark = son.kas_orani && onceki.kas_orani
    ? Math.round((son.kas_orani - onceki.kas_orani) * 10) / 10
    : null

  const mesajlar: string[] = []

  if (kiloFark < -1) mesajlar.push(`${ad} son ölçümde ${Math.abs(kiloFark)} kg vermiş — harika bir ilerleme.`)
  else if (kiloFark < 0) mesajlar.push(`${ad} ${Math.abs(kiloFark)} kg vermiş. Düzenli ilerleme devam ediyor.`)
  else if (kiloFark === 0) mesajlar.push(`${ad}'ın kilosu sabit kalmış. Plato dönemine girmiş olabilir.`)
  else mesajlar.push(`${ad} ${kiloFark} kg almış. Beslenme planını gözden geçirmek gerekebilir.`)

  if (yagFark !== null) {
    if (yagFark < 0) mesajlar.push(`Yağ oranı ${Math.abs(yagFark)}% azalmış — vücut kompozisyonu olumlu yönde değişiyor.`)
    else if (yagFark > 0) mesajlar.push(`Yağ oranı ${yagFark}% artmış. Makro dağılımını kontrol edin.`)
  }

  if (kasFark !== null) {
    if (kasFark > 0) mesajlar.push(`Kas oranı ${kasFark}% artmış — diyet proteinden zengin görünüyor, çok iyi.`)
    else if (kasFark < 0) mesajlar.push(`Kas oranı ${Math.abs(kasFark)}% azalmış. Protein alımını artırmayı düşünün.`)
  }

  if (son.bel_cm && onceki.bel_cm && son.bel_cm < onceki.bel_cm) {
    mesajlar.push(`Bel çevresi ${Math.round((onceki.bel_cm - son.bel_cm) * 10) / 10} cm azalmış — karın bölgesinde belirgin ilerleme.`)
  }

  return (
    <Card className="border-violet-200 bg-violet-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-violet-600" />
          Akıllı Analiz
          <Badge variant="secondary" className="text-xs">Son ölçüm karşılaştırması</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {mesajlar.map((m, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
            <p className="text-sm text-violet-900 leading-5">{m}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ── Yarı Daire Gösterge ───────────────────────────────────────────────────────
function GaugeDiyagram({
  deger, max, baslik, birim, renk = "#3b82f6",
}: {
  deger: number; max: number; baslik: string; birim: string; renk?: string
}) {
  // Arch gauge: goes from left → top → right (counterclockwise, sweep=0)
  // CX=56, CY=52, R=42 → left:(14,52) top:(56,10) right:(98,52)
  const R = 42, CX = 56, CY = 52, STROKE = 9
  const yuzde = Math.min(1, Math.max(0, deger / max))

  // Background arc: full semicircle going UP (sweep=0)
  const bgPath = `M ${CX - R} ${CY} A ${R} ${R} 0 0 0 ${CX + R} ${CY}`

  // Foreground arc: fraction of semicircle from left, going counterclockwise
  let fgPath = ""
  if (yuzde > 0) {
    // Math angle: π*(1-p) puts 0% at left, 50% at top, 100% at right
    const angle = Math.PI * (1 - yuzde)
    const ex = (CX + R * Math.cos(angle)).toFixed(2)
    const ey = (CY - R * Math.sin(angle)).toFixed(2)   // minus = go UP in SVG
    const largeArc = yuzde > 0.5 ? 1 : 0
    fgPath = `M ${CX - R} ${CY} A ${R} ${R} 0 ${largeArc} 0 ${ex} ${ey}`
  }

  // viewBox: 112×78 — arch top at y≈7.5, value text at y≈65, unit at y≈76
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg viewBox="0 0 112 78" className="w-28">
        {/* track */}
        <path d={bgPath} fill="none" stroke="#e2e8f0" strokeWidth={STROKE} strokeLinecap="round" />
        {/* fill */}
        {fgPath && (
          <path d={fgPath} fill="none" stroke={renk} strokeWidth={STROKE} strokeLinecap="round" />
        )}
        {/* value — sits inside the bowl, well below the arch */}
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize="22" fontWeight="800"
          fill="currentColor" fontFamily="inherit">{deger}</text>
        <text x={CX} y={CY + 26} textAnchor="middle" fontSize="9.5" fill="#94a3b8"
          fontFamily="inherit">{birim}</text>
      </svg>
      <p className="text-[11px] font-semibold text-center text-muted-foreground leading-tight -mt-1">{baslik}</p>
    </div>
  )
}

// ── Segmental Vücut Analizi ───────────────────────────────────────────────────
function SegmentalVucutAnalizi({ olcum, onceki }: { olcum: Olcum; onceki?: Olcum }) {
  const hasSegmental = !!(olcum.sol_kol_kas_kg || olcum.sag_kol_kas_kg || olcum.govde_kas_kg)

  // Toplam yağ oranından bölge rengi — segmental veri yoksa genel tablo kullanılır
  function toplamRenk(yagOrani?: number): string {
    if (yagOrani == null) return "#94a3b8"
    if (yagOrani < 20) return "#22c55e"
    if (yagOrani < 30) return "#f59e0b"
    return "#ef4444"
  }

  function segmentRenk(kas?: number, yag?: number, fallback?: number): string {
    if (kas != null && yag != null) {
      const oran = yag / (kas + yag)
      if (oran < 0.22) return "#22c55e"
      if (oran < 0.32) return "#f59e0b"
      return "#ef4444"
    }
    return toplamRenk(fallback)
  }

  function calcDelta(current?: number, prev?: number): number | null {
    if (current == null || prev == null) return null
    const d = Math.round((current - prev) * 100) / 100
    return d === 0 ? null : d
  }

  function DeltaBadge({ d }: { d: number | null }) {
    if (d === null) return null
    return (
      <span className={`text-[9px] font-bold ${d > 0 ? "text-rose-500" : "text-emerald-600"}`}>
        {d > 0 ? `+${d}` : d}
      </span>
    )
  }

  function SegmentData({ label, kas, yag, prevKas, prevYag, align = "left" }: {
    label: string; kas?: number; yag?: number
    prevKas?: number; prevYag?: number; align?: "left" | "right"
  }) {
    const hasData = kas != null || yag != null
    return (
      <div className={`space-y-0.5 leading-tight ${align === "right" ? "text-right" : ""}`}>
        <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
        {hasData ? (
          <>
            {kas != null && (
              <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
                <div className="h-2 w-2 rounded-sm bg-emerald-500 shrink-0" />
                <span className="text-xs font-medium">{kas}</span>
                <span className="text-[10px] text-muted-foreground">kg kas</span>
                <DeltaBadge d={calcDelta(kas, prevKas)} />
              </div>
            )}
            {yag != null && (
              <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
                <div className="h-2 w-2 rounded-sm bg-amber-400 shrink-0" />
                <span className="text-xs font-medium">{yag}</span>
                <span className="text-[10px] text-muted-foreground">kg yağ</span>
                <DeltaBadge d={calcDelta(yag, prevYag)} />
              </div>
            )}
          </>
        ) : (
          <p className="text-[10px] text-muted-foreground/60 italic">Tanita verisi yok</p>
        )}
      </div>
    )
  }

  const fallback = olcum.yag_orani
  const solKolR = segmentRenk(olcum.sol_kol_kas_kg, olcum.sol_kol_yag_kg, fallback)
  const sagKolR = segmentRenk(olcum.sag_kol_kas_kg, olcum.sag_kol_yag_kg, fallback)
  const govdeR  = segmentRenk(olcum.govde_kas_kg,   olcum.govde_yag_kg,   fallback)
  const solBacR = segmentRenk(olcum.sol_bacak_kas_kg, olcum.sol_bacak_yag_kg, fallback)
  const sagBacR = segmentRenk(olcum.sag_bacak_kas_kg, olcum.sag_bacak_yag_kg, fallback)

  const hasGauges = olcum.yag_orani != null || olcum.sivi_orani != null || olcum.kas_orani != null || olcum.ic_yaglanma != null

  return (
    <Card className="border-blue-100 bg-gradient-to-b from-blue-50/30 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" />
          Vücut Kompozisyon Haritası
          {onceki && <Badge variant="secondary" className="text-xs">Önceki ölçümle karşılaştırma</Badge>}
          {!hasSegmental && (
            <Badge variant="outline" className="text-[10px] text-muted-foreground ml-auto">
              Segmental veri için Tanita cihazı gerekli
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3-col layout: sol panel | SVG | sağ panel */}
        <div className="flex items-center justify-center gap-3 md:gap-8">
          {/* Sol panel */}
          <div className="w-28 space-y-10">
            <SegmentData
              label="Sol Kol" align="right"
              kas={olcum.sol_kol_kas_kg} yag={olcum.sol_kol_yag_kg}
              prevKas={onceki?.sol_kol_kas_kg} prevYag={onceki?.sol_kol_yag_kg}
            />
            <SegmentData
              label="Sol Bacak" align="right"
              kas={olcum.sol_bacak_kas_kg} yag={olcum.sol_bacak_yag_kg}
              prevKas={onceki?.sol_bacak_kas_kg} prevYag={onceki?.sol_bacak_yag_kg}
            />
          </div>

          {/* SVG vücut — her zaman görünür */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <svg viewBox="0 0 160 310" className="w-32 md:w-36 drop-shadow-sm" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.08))" }}>
              <defs>
                <linearGradient id="headGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>

              {/* ── KAFA ── */}
              <ellipse cx="80" cy="24" rx="19" ry="22"
                fill="url(#headGrad)" stroke="#94a3b8" strokeWidth="1.5" />
              {/* Saç */}
              <path d="M 61 18 Q 61 2 80 2 Q 99 2 99 18"
                fill="#94a3b8" fillOpacity="0.3" stroke="none" />
              {/* Gözler */}
              <ellipse cx="73" cy="22" rx="2.5" ry="3" fill="#64748b" opacity="0.5" />
              <ellipse cx="87" cy="22" rx="2.5" ry="3" fill="#64748b" opacity="0.5" />
              {/* Ağız */}
              <path d="M 73 32 Q 80 37 87 32" fill="none" stroke="#94a3b8" strokeWidth="1.3" opacity="0.5" />

              {/* ── BOYUN ── */}
              <path d="M 73 44 Q 72 44 72 48 L 72 58 Q 72 60 74 60 L 86 60 Q 88 60 88 58 L 88 48 Q 88 44 87 44 Z"
                fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

              {/* ── OMUZLAR (trapez) ── */}
              <path d="M 72 44 Q 60 44 46 50 Q 30 56 26 62 L 30 68 Q 42 62 56 60 Q 68 58 74 60 L 86 60 Q 92 58 104 60 Q 118 62 130 68 L 134 62 Q 130 56 114 50 Q 100 44 88 44 Z"
                fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />

              {/* ── GÖVDE ── */}
              <path d="M 46 60 Q 38 62 36 72 Q 34 100 36 130 Q 38 150 44 158 Q 50 164 58 166 L 102 166 Q 110 164 116 158 Q 122 150 124 130 Q 126 100 124 72 Q 122 62 114 60 Q 100 57 80 57 Q 60 57 46 60 Z"
                fill={govdeR} fillOpacity="0.2" stroke={govdeR} strokeWidth="2.5" />

              {/* ── SOL KOL ── */}
              <path d="M 24 62 Q 14 66 12 78 L 10 150 Q 10 158 16 160 L 34 160 Q 38 158 40 152 L 44 78 Q 44 66 36 62 Q 32 60 28 61 Z"
                fill={solKolR} fillOpacity="0.2" stroke={solKolR} strokeWidth="2" />

              {/* ── SAĞ KOL ── */}
              <path d="M 136 62 Q 146 66 148 78 L 150 150 Q 150 158 144 160 L 126 160 Q 122 158 120 152 L 116 78 Q 116 66 124 62 Q 128 60 132 61 Z"
                fill={sagKolR} fillOpacity="0.2" stroke={sagKolR} strokeWidth="2" />

              {/* ── SOL BACAK ── */}
              <path d="M 42 168 Q 36 170 34 180 L 34 290 Q 34 298 42 300 L 74 300 Q 82 298 82 290 L 80 180 Q 80 170 74 168 Z"
                fill={solBacR} fillOpacity="0.2" stroke={solBacR} strokeWidth="2" />

              {/* ── SAĞ BACAK ── */}
              <path d="M 86 168 Q 80 170 78 180 L 80 290 Q 80 298 88 300 L 118 300 Q 126 298 126 290 L 126 180 Q 124 170 118 168 Z"
                fill={sagBacR} fillOpacity="0.2" stroke={sagBacR} strokeWidth="2" />

              {/* Connector dashes → sol panel */}
              <line x1="10" y1="105" x2="1" y2="105" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2,2" />
              <line x1="10" y1="228" x2="1" y2="228" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2,2" />
              {/* Connector dashes → sağ panel */}
              <line x1="150" y1="105" x2="159" y2="105" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2,2" />
              <line x1="150" y1="228" x2="159" y2="228" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2,2" />
            </svg>

            {/* Gövde datası */}
            <div className="bg-muted/60 rounded-xl px-4 py-2 text-center min-w-[130px] border border-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Gövde</p>
              {olcum.govde_kas_kg != null || olcum.govde_yag_kg != null ? (
                <div className="space-y-0.5">
                  {olcum.govde_kas_kg != null && (
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-2 w-2 rounded-sm bg-emerald-500" />
                      <span className="text-xs font-medium">{olcum.govde_kas_kg}</span>
                      <span className="text-[10px] text-muted-foreground">kg kas</span>
                      <DeltaBadge d={calcDelta(olcum.govde_kas_kg, onceki?.govde_kas_kg)} />
                    </div>
                  )}
                  {olcum.govde_yag_kg != null && (
                    <div className="flex items-center justify-center gap-1">
                      <div className="h-2 w-2 rounded-sm bg-amber-400" />
                      <span className="text-xs font-medium">{olcum.govde_yag_kg}</span>
                      <span className="text-[10px] text-muted-foreground">kg yağ</span>
                      <DeltaBadge d={calcDelta(olcum.govde_yag_kg, onceki?.govde_yag_kg)} />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground/60 italic">Tanita verisi yok</p>
              )}
            </div>
          </div>

          {/* Sağ panel */}
          <div className="w-28 space-y-10">
            <SegmentData
              label="Sağ Kol"
              kas={olcum.sag_kol_kas_kg} yag={olcum.sag_kol_yag_kg}
              prevKas={onceki?.sag_kol_kas_kg} prevYag={onceki?.sag_kol_yag_kg}
            />
            <SegmentData
              label="Sağ Bacak"
              kas={olcum.sag_bacak_kas_kg} yag={olcum.sag_bacak_yag_kg}
              prevKas={onceki?.sag_bacak_kas_kg} prevYag={onceki?.sag_bacak_yag_kg}
            />
          </div>
        </div>

        {/* Gauge charts — yağ %, sıvı %, kas %, iç yağlanma */}
        {hasGauges && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t">
            {olcum.yag_orani != null && (() => {
              const renk = olcum.yag_orani > 30 ? "#ef4444" : olcum.yag_orani > 22 ? "#f59e0b" : "#22c55e"
              const label = olcum.yag_orani > 30 ? "Yüksek" : olcum.yag_orani > 22 ? "Orta" : "İyi"
              return (
                <div className="rounded-xl border bg-card p-3 flex flex-col items-center shadow-sm">
                  <GaugeDiyagram deger={olcum.yag_orani} max={50} baslik="Yağ Oranı" birim="%" renk={renk} />
                  <span className="text-[10px] font-semibold mt-0.5" style={{ color: renk }}>{label}</span>
                </div>
              )
            })()}
            {olcum.sivi_orani != null && (
              <div className="rounded-xl border bg-card p-3 flex flex-col items-center shadow-sm">
                <GaugeDiyagram deger={olcum.sivi_orani} max={80} baslik="Sıvı Oranı" birim="%" renk="#3b82f6" />
                <span className="text-[10px] font-semibold mt-0.5 text-blue-500">
                  {olcum.sivi_orani >= 55 ? "İyi" : olcum.sivi_orani >= 45 ? "Orta" : "Düşük"}
                </span>
              </div>
            )}
            {olcum.kas_orani != null && (
              <div className="rounded-xl border bg-card p-3 flex flex-col items-center shadow-sm">
                <GaugeDiyagram deger={olcum.kas_orani} max={60} baslik="Kas Oranı" birim="%" renk="#22c55e" />
                <span className="text-[10px] font-semibold mt-0.5 text-emerald-600">
                  {olcum.kas_orani >= 40 ? "İyi" : olcum.kas_orani >= 30 ? "Orta" : "Düşük"}
                </span>
              </div>
            )}
            {olcum.ic_yaglanma != null && (() => {
              const renk = olcum.ic_yaglanma > 12 ? "#ef4444" : olcum.ic_yaglanma > 8 ? "#f59e0b" : "#22c55e"
              const label = olcum.ic_yaglanma > 12 ? "Yüksek" : olcum.ic_yaglanma > 8 ? "Orta" : "Normal"
              return (
                <div className="rounded-xl border bg-card p-3 flex flex-col items-center shadow-sm">
                  <GaugeDiyagram deger={olcum.ic_yaglanma} max={20} baslik="İç Yağlanma" birim="seviye" renk={renk} />
                  <span className="text-[10px] font-semibold mt-0.5" style={{ color: renk }}>{label}</span>
                </div>
              )
            })()}
          </div>
        )}

        {/* Renk açıklaması */}
        <div className="flex items-center justify-center gap-5 pt-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />İyi</div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-amber-400" />Orta</div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-red-500" />Yüksek / Düşük</div>
          <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-slate-300" />Veri yok</div>
        </div>
      </CardContent>
    </Card>
  )
}

function bosOlcumForm() {
  return {
    tarih: new Date().toISOString().slice(0, 10),
    kilo: "", yag: "", kas: "", sivi: "", icYag: "",
    bel: "", kalca: "", gogus: "", kol: "", bacak: "", notlar: "",
    // segmental
    solKolKas: "", solKolYag: "",
    sagKolKas: "", sagKolYag: "",
    govdeKas: "", govdeYag: "",
    solBacKas: "", solBacYag: "",
    sagBacKas: "", sagBacYag: "",
    showSegmental: "",
  }
}

function bosOdemeForm() {
  return {
    tarih: new Date().toISOString().slice(0, 10),
    tutar: "",
    aciklama: "",
    durum: "odendi" as OdemeDurumu,
    yontem: "" as Odeme["odeme_yontemi"] | "",
  }
}

export default function DanisanDetayPage({ params }: Props) {
  const { id } = use(params)

  const danisanlar = useDanisanlar()
  const tumOlcumler = useOlcumler()
  const tumRandevular = useRandevular()
  const tumPlanlar = useDiyetPlanlari()
  const tumOdemeler = useOdemeler()

  const [olcumDialog, setOlcumDialog] = useState(false)
  const [form, setForm] = useState(bosOlcumForm())
  const [hata, setHata] = useState("")
  const [csvHata, setCsvHata] = useState("")

  const [odemeDialog, setOdemeDialog] = useState(false)
  const [odemeForm, setOdemeForm] = useState(bosOdemeForm())
  const [odemeHata, setOdemeHata] = useState("")
  const [silOdemeId, setSilOdemeId] = useState<string | null>(null)

  const danisan = danisanlar.find(d => d.id === id)
  if (!danisan) return notFound()

  const olcumler = tumOlcumler.filter(o => o.danisan_id === id).sort((a, b) => b.tarih.localeCompare(a.tarih))
  const randevular = tumRandevular.filter(r => r.danisan_id === id).sort((a, b) => b.tarih.localeCompare(a.tarih))
  const planlar = tumPlanlar.filter(p => p.danisan_id === id)
  const odemeler = tumOdemeler.filter(o => o.danisan_id === id)

  const sonOlcum = olcumler[0]
  const mevcutKilo = sonOlcum?.kilo_kg ?? danisan.baslangic_kilo
  const bmi = danisan.boy_cm && mevcutKilo ? hesaplaBMI(mevcutKilo, danisan.boy_cm) : null
  const bmiInfo = bmi ? bmiyeGoreEtiket(bmi) : null
  const yas = danisan.dogum_tarihi ? hesaplaYas(danisan.dogum_tarihi) : null

  const gidilen = danisan.baslangic_kilo && mevcutKilo ? Math.abs(danisan.baslangic_kilo - mevcutKilo) : 0
  const toplam = danisan.baslangic_kilo && danisan.hedef_kilo ? Math.abs(danisan.baslangic_kilo - danisan.hedef_kilo) : 0
  const ilerlemeYuzde = toplam > 0 ? Math.min(100, Math.round((gidilen / toplam) * 100)) : 0
  const kKaybi = danisan.baslangic_kilo && mevcutKilo ? Math.round((danisan.baslangic_kilo - mevcutKilo) * 10) / 10 : 0

  // Grafik verileri
  const kiloVerileri = [...olcumler].sort((a, b) => a.tarih.localeCompare(b.tarih)).map(o => ({ tarih: o.tarih, deger: o.kilo_kg }))
  const yagVerileri = [...olcumler].filter(o => o.yag_orani).sort((a, b) => a.tarih.localeCompare(b.tarih)).map(o => ({ tarih: o.tarih, deger: o.yag_orani! }))
  const kasVerileri = [...olcumler].filter(o => o.kas_orani).sort((a, b) => a.tarih.localeCompare(b.tarih)).map(o => ({ tarih: o.tarih, deger: o.kas_orani! }))

  // Toplam ödeme özeti
  const odendi = odemeler.filter(o => o.durum === "odendi").reduce((s, o) => s + o.tutar, 0)
  const bekliyor = odemeler.filter(o => o.durum === "bekliyor" || o.durum === "gecikti").reduce((s, o) => s + o.tutar, 0)

  function f(key: keyof ReturnType<typeof bosOlcumForm>, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  function odemeKaydet() {
    if (!odemeForm.tutar || isNaN(Number(odemeForm.tutar)) || Number(odemeForm.tutar) <= 0) {
      setOdemeHata("Geçerli bir tutar girin."); return
    }
    if (!odemeForm.aciklama.trim()) { setOdemeHata("Açıklama zorunludur."); return }
    setOdemeHata("")
    crmStore.addOdeme({
      id: crypto.randomUUID(),
      danisan_id: id,
      tarih: odemeForm.tarih,
      tutar: Number(odemeForm.tutar),
      aciklama: odemeForm.aciklama.trim(),
      durum: odemeForm.durum,
      odeme_yontemi: (odemeForm.yontem || undefined) as Odeme["odeme_yontemi"],
    })
    setOdemeForm(bosOdemeForm())
    setOdemeDialog(false)
  }

  function kaydet() {
    if (!danisan) return
    if (!form.tarih || form.tarih > new Date().toISOString().slice(0, 10)) { setHata("İleri tarihli ölçüm girilemez."); return }
    if (!form.kilo || isNaN(Number(form.kilo))) { setHata("Geçerli bir kilo girin."); return }
    setHata("")
    const num = (v: string) => (v && !isNaN(Number(v)) ? Number(v) : undefined)
    const kilo_kg = Number(form.kilo)
    const bmiHesap = danisan.boy_cm ? hesaplaBMI(kilo_kg, danisan.boy_cm) : undefined
    const yeni: Olcum = {
      id: crypto.randomUUID(),
      danisan_id: id,
      tarih: form.tarih,
      kilo_kg,
      bmi: bmiHesap,
      yag_orani: num(form.yag),
      kas_orani: num(form.kas),
      sivi_orani: num(form.sivi),
      ic_yaglanma: num(form.icYag),
      bel_cm: num(form.bel),
      kalca_cm: num(form.kalca),
      gogus_cm: num(form.gogus),
      kol_cm: num(form.kol),
      bacak_cm: num(form.bacak),
      sol_kol_kas_kg: num(form.solKolKas),
      sol_kol_yag_kg: num(form.solKolYag),
      sag_kol_kas_kg: num(form.sagKolKas),
      sag_kol_yag_kg: num(form.sagKolYag),
      govde_kas_kg: num(form.govdeKas),
      govde_yag_kg: num(form.govdeYag),
      sol_bacak_kas_kg: num(form.solBacKas),
      sol_bacak_yag_kg: num(form.solBacYag),
      sag_bacak_kas_kg: num(form.sagBacKas),
      sag_bacak_yag_kg: num(form.sagBacYag),
      notlar: form.notlar || undefined,
    }
    crmStore.addOlcum(yeni)
    setForm(bosOlcumForm())
    setOlcumDialog(false)
  }

  return (
    <>
      <Header
        title={`${danisan.ad} ${danisan.soyad}`}
        description={danisan.hedef_turu ? getHedefLabel(danisan.hedef_turu) : "Danışan Profili"}
      />
      <div className="p-6 space-y-5">
        {/* Üst Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/danisanlar"><ArrowLeft className="h-3.5 w-3.5" />Danışanlara Dön</Link>
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOlcumDialog(true)}>
              <Plus className="h-3.5 w-3.5" />Ölçüm Ekle
            </Button>
            <DanisanDuzenleDialog danisan={danisan} />
          </div>
        </div>

        {/* Profil Özet Kartı — Tam genişlik */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-5 flex-wrap">
              {/* Avatar & Temel Bilgi */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {getInitials(danisan.ad, danisan.soyad)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold">{danisan.ad} {danisan.soyad}</h2>
                    <Badge variant={getDanisanDurumVariant(danisan.durum)}>{getDanisanDurumLabel(danisan.durum)}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                    {yas && <span>{yas} yaş</span>}
                    {danisan.cinsiyet && <span>{danisan.cinsiyet === "kadin" ? "Kadın" : "Erkek"}</span>}
                    {danisan.boy_cm && <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{danisan.boy_cm} cm</span>}
                    {danisan.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{danisan.email}</span>}
                    {danisan.telefon && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{danisan.telefon}</span>}
                  </div>
                </div>
              </div>

              <Separator orientation="vertical" className="h-16 hidden md:block" />

              {/* Kilo İlerleme */}
              <div className="flex-1 min-w-[200px]">
                <p className="text-xs font-medium text-muted-foreground mb-2">Kilo Hedefi İlerlemesi</p>
                <div className="flex items-end gap-3 mb-2">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Başlangıç</p>
                    <p className="font-bold">{danisan.baslangic_kilo ?? "—"} kg</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span className={kKaybi !== 0 ? (kKaybi > 0 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold") : ""}>
                        {kKaybi > 0 ? `−${kKaybi} kg` : kKaybi < 0 ? `+${Math.abs(kKaybi)} kg` : "Değişim yok"}
                      </span>
                      <span className="font-medium text-primary">{ilerlemeYuzde}%</span>
                    </div>
                    <Progress value={ilerlemeYuzde} className="h-2.5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Hedef</p>
                    <p className="font-bold">{danisan.hedef_kilo ?? "—"} kg</p>
                  </div>
                </div>
                {danisan.hedef_turu && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="h-3 w-3" />{getHedefLabel(danisan.hedef_turu)}
                  </div>
                )}
              </div>

              <Separator orientation="vertical" className="h-16 hidden md:block" />

              {/* Özet Sayılar */}
              <div className="grid grid-cols-3 gap-3 text-center min-w-fit">
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-lg font-bold">{mevcutKilo ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Güncel kg</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-lg font-bold">{bmi ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">BMI</p>
                  {bmiInfo && <Badge variant={bmiInfo.variant} className="text-xs mt-0.5">{bmiInfo.etiket}</Badge>}
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-lg font-bold">{sonOlcum?.yag_orani ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Yağ %</p>
                </div>
              </div>
            </div>

            {/* Alerji & Hastalık */}
            {(danisan.alerjiler?.length || danisan.hastaliklar?.length) ? (
              <>
                <Separator className="my-4" />
                <div className="flex gap-4 flex-wrap">
                  {danisan.alerjiler && danisan.alerjiler.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 mb-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" />Alerjiler
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {danisan.alerjiler.map(a => <Badge key={a} variant="warning" className="text-xs">{a}</Badge>)}
                      </div>
                    </div>
                  )}
                  {danisan.hastaliklar && danisan.hastaliklar.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">Hastalıklar / Özel Durumlar</p>
                      <div className="flex flex-wrap gap-1">
                        {danisan.hastaliklar.map(h => <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Sekmeler */}
        <Tabs defaultValue="vucutAnalizi">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="vucutAnalizi" className="gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" />Vücut Analizi ({olcumler.length})
            </TabsTrigger>
            <TabsTrigger value="diyetPlani" className="gap-1.5">
              <Salad className="h-3.5 w-3.5" />Diyet Planı ({planlar.length})
            </TabsTrigger>
            <TabsTrigger value="odemeler" className="gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />Ödemeler ({odemeler.length})
            </TabsTrigger>
            <TabsTrigger value="randevular" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" />Randevular ({randevular.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Vücut Analizi ─────────────────────────────────────────────── */}
          <TabsContent value="vucutAnalizi" className="mt-4 space-y-4">
            {olcumler.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Scale className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Henüz ölçüm girilmemiş</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => setOlcumDialog(true)}>
                    <Plus className="h-3.5 w-3.5" />İlk Ölçümü Ekle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Segmental Vücut Analizi */}
                <SegmentalVucutAnalizi
                  olcum={olcumler[0]}
                  onceki={olcumler.length > 1 ? olcumler[1] : undefined}
                />

                {/* AI Analiz */}
                <AIAnaliz olcumler={olcumler} ad={danisan.ad} />

                {/* Grafikler */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kiloVerileri.length >= 2 && (
                    <Card>
                      <CardContent className="p-4">
                        <CizgiGrafik degerler={kiloVerileri} etiket="Kilo" birim="kg" renkler="hsl(var(--primary))" />
                      </CardContent>
                    </Card>
                  )}
                  {yagVerileri.length >= 2 && (
                    <Card>
                      <CardContent className="p-4">
                        <CizgiGrafik degerler={yagVerileri} etiket="Yağ Oranı" birim="%" renkler="hsl(25 95% 53%)" />
                      </CardContent>
                    </Card>
                  )}
                  {kasVerileri.length >= 2 && (
                    <Card>
                      <CardContent className="p-4">
                        <CizgiGrafik degerler={kasVerileri} etiket="Kas Oranı" birim="%" renkler="hsl(142 71% 45%)" />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Bölgesel Değişim */}
                <BolgeselAnaliz olcumler={olcumler} />

                {/* Ölçüm Geçmişi */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Ölçüm Geçmişi</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      <div className="grid grid-cols-7 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40">
                        <span>Tarih</span><span>Kilo</span><span>BMI</span><span>Yağ%</span><span>Kas%</span><span>Bel</span><span>Kalça</span>
                      </div>
                      {olcumler.map(o => (
                        <div key={o.id} className="grid grid-cols-7 px-4 py-3 text-sm items-center">
                          <span className="font-medium">{formatTarih(o.tarih)}</span>
                          <span className="font-bold">{o.kilo_kg} kg</span>
                          <span>{o.bmi ? <Badge variant={bmiyeGoreEtiket(o.bmi).variant} className="text-xs">{o.bmi}</Badge> : "—"}</span>
                          <span>{o.yag_orani ? `${o.yag_orani}%` : "—"}</span>
                          <span>{o.kas_orani ? `${o.kas_orani}%` : "—"}</span>
                          <span>{o.bel_cm ? `${o.bel_cm} cm` : "—"}</span>
                          <span>{o.kalca_cm ? `${o.kalca_cm} cm` : "—"}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ── Diyet Planı ───────────────────────────────────────────────── */}
          <TabsContent value="diyetPlani" className="mt-4 space-y-3">
            {planlar.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Salad className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Henüz diyet planı oluşturulmamış</p>
                  <Button size="sm" variant="outline" className="mt-3" asChild>
                    <Link href="/diyet-planlari">Yeni Plan Oluştur</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : planlar.map(p => (
              <Card key={p.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{p.baslik}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTarih(p.baslangic_tarihi)}
                        {p.bitis_tarihi && ` — ${formatTarih(p.bitis_tarihi)}`}
                      </p>
                      {p.gunluk_kalori_hedefi && (
                        <p className="text-xs text-muted-foreground">Günlük hedef: {p.gunluk_kalori_hedefi} kcal</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.aktif && <Badge variant="success">Aktif</Badge>}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/diyet-planlari/${p.id}`}>Görüntüle</Link>
                      </Button>
                    </div>
                  </div>

                  {p.haftalik_plan && p.haftalik_plan.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Haftalık Plan</p>
                      {p.haftalik_plan.map((gun, gi) => (
                        <div key={gi} className="bg-muted/40 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold">{gun.gun}</p>
                            {gun.toplam_kalori && (
                              <span className="text-xs text-muted-foreground">{gun.toplam_kalori} kcal</span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {gun.ogunler.map((ogun, oi) => (
                              <div key={oi}>
                                <p className="text-xs font-medium text-muted-foreground">{ogun.ad} {ogun.saat && `(${ogun.saat})`}</p>
                                <p className="text-xs">
                                  {ogun.items.map(item => `${item.ad} — ${item.miktar}`).join(", ")}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {p.notlar && (
                    <div className="border-t pt-2">
                      <p className="text-xs text-muted-foreground">{p.notlar}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── Ödemeler ─────────────────────────────────────────────────── */}
          <TabsContent value="odemeler" className="mt-4 space-y-3">
            {/* Özet + Ekle Butonu */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center min-w-[100px]">
                  <p className="text-lg font-bold text-emerald-600">{formatPara(odendi)}</p>
                  <p className="text-xs text-muted-foreground">Ödendi</p>
                </div>
                <div className={`border rounded-xl px-4 py-2 text-center min-w-[100px] ${bekliyor > 0 ? "bg-amber-50 border-amber-200" : "bg-muted border-border"}`}>
                  <p className={`text-lg font-bold ${bekliyor > 0 ? "text-amber-600" : "text-muted-foreground"}`}>{formatPara(bekliyor)}</p>
                  <p className="text-xs text-muted-foreground">Bekleyen</p>
                </div>
                <div className="bg-muted border border-border rounded-xl px-4 py-2 text-center min-w-[100px]">
                  <p className="text-lg font-bold">{formatPara(odendi + bekliyor)}</p>
                  <p className="text-xs text-muted-foreground">Toplam</p>
                </div>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => { setOdemeForm(bosOdemeForm()); setOdemeHata(""); setOdemeDialog(true) }}>
                <Plus className="h-3.5 w-3.5" />Ödeme Ekle
              </Button>
            </div>

            {odemeler.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Henüz ödeme kaydı yok</p>
                  <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={() => { setOdemeForm(bosOdemeForm()); setOdemeDialog(true) }}>
                    <Plus className="h-3.5 w-3.5" />İlk Ödemeyi Ekle
                  </Button>
                </CardContent>
              </Card>
            ) : [...odemeler].sort((a, b) => b.tarih.localeCompare(a.tarih)).map(o => (
              <Card key={o.id} className={o.durum === "gecikti" ? "border-red-200" : o.durum === "bekliyor" ? "border-amber-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {/* Durum ikonu */}
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      o.durum === "odendi" ? "bg-emerald-100 text-emerald-600" :
                      o.durum === "gecikti" ? "bg-red-100 text-red-600" :
                      "bg-amber-100 text-amber-600"
                    }`}>
                      {o.durum === "odendi"
                        ? <CheckCircle2 className="h-4 w-4" />
                        : <Clock className="h-4 w-4" />}
                    </div>

                    {/* Bilgiler */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{o.aciklama}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{formatTarih(o.tarih)}</span>
                        {o.odeme_yontemi && (
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {o.odeme_yontemi === "nakit" ? "Nakit" : o.odeme_yontemi === "kart" ? "Kart" : "Havale"}
                          </span>
                        )}
                        <Badge variant={getOdemeDurumVariant(o.durum)} className="text-xs">
                          {getOdemeDurumLabel(o.durum)}
                        </Badge>
                      </div>
                    </div>

                    {/* Tutar */}
                    <p className="text-base font-bold shrink-0">{formatPara(o.tutar)}</p>

                    {/* Aksiyonlar */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {o.durum !== "odendi" && (
                          <DropdownMenuItem onClick={() => crmStore.updateOdemeDurum(o.id, "odendi")} className="text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />Ödendi İşaretle
                          </DropdownMenuItem>
                        )}
                        {o.durum !== "bekliyor" && (
                          <DropdownMenuItem onClick={() => crmStore.updateOdemeDurum(o.id, "bekliyor")}>
                            <Clock className="h-3.5 w-3.5 mr-2" />Bekliyor İşaretle
                          </DropdownMenuItem>
                        )}
                        {o.durum !== "gecikti" && (
                          <DropdownMenuItem onClick={() => crmStore.updateOdemeDurum(o.id, "gecikti")} className="text-red-600">
                            <Clock className="h-3.5 w-3.5 mr-2" />Gecikti İşaretle
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setSilOdemeId(o.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2" />Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── Randevular ─────────────────────────────────────────────────── */}
          <TabsContent value="randevular" className="mt-4 space-y-3">
            {randevular.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Henüz randevu yok</p>
                  <Button size="sm" variant="outline" className="mt-3" asChild>
                    <Link href="/randevular">Takvime Git</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : randevular.map(r => (
              <Card key={r.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-center w-14 shrink-0 bg-muted rounded-lg p-2">
                    <p className="text-sm font-bold">{r.saat}</p>
                    <p className="text-xs text-muted-foreground">{r.sure_dk} dk</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.tur}</p>
                    <p className="text-xs text-muted-foreground">{formatTarih(r.tarih)}</p>
                  </div>
                  <Badge variant={getRandevuDurumVariant(r.durum)}>{getRandevuDurumLabel(r.durum)}</Badge>
                  {r.ucret && <p className="text-sm font-medium shrink-0">{formatPara(r.ucret)}</p>}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Ölçüm Ekleme Dialogu ─────────────────────────────────────────── */}
      <Dialog open={olcumDialog} onOpenChange={open => { setOlcumDialog(open); if (!open) { setForm(bosOlcumForm()); setHata("") } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ölçüm Ekle — {danisan.ad} {danisan.soyad}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* ── Tanita CSV Yükleme ── */}
            <div className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors p-4 text-center space-y-2 bg-muted/30">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                Tanita Health Planet CSV
              </div>
              <p className="text-xs text-muted-foreground">
                Health Planet uygulamasından dışa aktardığın CSV dosyasını yükle — tüm alanlar otomatik dolar
              </p>
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs bg-background border border-border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors font-medium">
                <Upload className="h-3.5 w-3.5" />
                CSV Dosyası Seç
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setCsvHata("")
                    try {
                      const text = await file.text()
                      const sonuc = tanitaCsvParse(text)
                      if (!sonuc) { setCsvHata("CSV okunamadı — sütun adları tanınmadı."); return }
                      const bugun = new Date().toISOString().slice(0, 10)
                      setForm(prev => ({
                        ...prev,
                        tarih:     sonuc.tarih && sonuc.tarih <= bugun ? sonuc.tarih : bugun,
                        kilo:      sonuc.kilo_kg   != null ? String(sonuc.kilo_kg)   : prev.kilo,
                        yag:       sonuc.yag_orani != null ? String(sonuc.yag_orani) : prev.yag,
                        kas:       sonuc.kas_orani != null ? String(sonuc.kas_orani) : prev.kas,
                        sivi:      sonuc.sivi_orani != null ? String(sonuc.sivi_orani) : prev.sivi,
                        icYag:     sonuc.ic_yaglanma != null ? String(sonuc.ic_yaglanma) : prev.icYag,
                        solKolKas: sonuc.sol_kol_kas_kg != null ? String(sonuc.sol_kol_kas_kg) : prev.solKolKas,
                        solKolYag: sonuc.sol_kol_yag_kg != null ? String(sonuc.sol_kol_yag_kg) : prev.solKolYag,
                        sagKolKas: sonuc.sag_kol_kas_kg != null ? String(sonuc.sag_kol_kas_kg) : prev.sagKolKas,
                        sagKolYag: sonuc.sag_kol_yag_kg != null ? String(sonuc.sag_kol_yag_kg) : prev.sagKolYag,
                        govdeKas:  sonuc.govde_kas_kg   != null ? String(sonuc.govde_kas_kg)   : prev.govdeKas,
                        govdeYag:  sonuc.govde_yag_kg   != null ? String(sonuc.govde_yag_kg)   : prev.govdeYag,
                        solBacKas: sonuc.sol_bacak_kas_kg != null ? String(sonuc.sol_bacak_kas_kg) : prev.solBacKas,
                        solBacYag: sonuc.sol_bacak_yag_kg != null ? String(sonuc.sol_bacak_yag_kg) : prev.solBacYag,
                        sagBacKas: sonuc.sag_bacak_kas_kg != null ? String(sonuc.sag_bacak_kas_kg) : prev.sagBacKas,
                        sagBacYag: sonuc.sag_bacak_yag_kg != null ? String(sonuc.sag_bacak_yag_kg) : prev.sagBacYag,
                        // Segmental veri geldiyse bölümü aç
                        showSegmental: sonuc.sol_kol_kas_kg != null || sonuc.govde_kas_kg != null ? "1" : prev.showSegmental,
                      }))
                    } catch {
                      setCsvHata("Dosya okunamadı.")
                    }
                    e.target.value = ""
                  }}
                />
              </label>
              {csvHata && <p className="text-xs text-destructive">{csvHata}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tarih</Label>
                <Input type="date" value={form.tarih} max={new Date().toISOString().slice(0, 10)} onChange={e => f("tarih", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Kilo (kg) <span className="text-destructive">*</span></Label>
                <Input type="number" step="0.1" placeholder="75.0" value={form.kilo} onChange={e => f("kilo", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Yağ Oranı (%)</Label><Input type="number" step="0.1" placeholder="25.0" value={form.yag} onChange={e => f("yag", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Kas Oranı (%)</Label><Input type="number" step="0.1" placeholder="35.0" value={form.kas} onChange={e => f("kas", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Sıvı Oranı (%)</Label><Input type="number" step="0.1" placeholder="53.0" value={form.sivi} onChange={e => f("sivi", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>İç Yağlanma (seviye)</Label><Input type="number" step="1" placeholder="8" value={form.icYag} onChange={e => f("icYag", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5"><Label>Bel (cm)</Label><Input type="number" placeholder="80" value={form.bel} onChange={e => f("bel", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Kalça (cm)</Label><Input type="number" placeholder="95" value={form.kalca} onChange={e => f("kalca", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Göğüs (cm)</Label><Input type="number" placeholder="90" value={form.gogus} onChange={e => f("gogus", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Kol (cm)</Label><Input type="number" placeholder="30" value={form.kol} onChange={e => f("kol", e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Bacak (cm)</Label><Input type="number" placeholder="55" value={form.bacak} onChange={e => f("bacak", e.target.value)} /></div>
            </div>
            {/* Segmental analiz — isteğe bağlı */}
            <div className="border rounded-lg overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold bg-muted/50 hover:bg-muted transition-colors"
                onClick={() => f("showSegmental", form.showSegmental ? "" : "1")}
              >
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-blue-500" />
                  Segmental Analiz (Tanita / Akıllı Terazi)
                  <span className="font-normal text-muted-foreground">— isteğe bağlı</span>
                </span>
                <span className="text-muted-foreground">{form.showSegmental ? "▲" : "▼"}</span>
              </button>
              {form.showSegmental && (
                <div className="p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sol Kol — Kas (kg)</Label>
                      <Input type="number" step="0.01" placeholder="3.45" value={form.solKolKas} onChange={e => f("solKolKas", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sol Kol — Yağ (kg)</Label>
                      <Input type="number" step="0.01" placeholder="1.26" value={form.solKolYag} onChange={e => f("solKolYag", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sağ Kol — Kas (kg)</Label>
                      <Input type="number" step="0.01" placeholder="3.60" value={form.sagKolKas} onChange={e => f("sagKolKas", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sağ Kol — Yağ (kg)</Label>
                      <Input type="number" step="0.01" placeholder="1.23" value={form.sagKolYag} onChange={e => f("sagKolYag", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Gövde — Kas (kg)</Label>
                      <Input type="number" step="0.01" placeholder="30.85" value={form.govdeKas} onChange={e => f("govdeKas", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Gövde — Yağ (kg)</Label>
                      <Input type="number" step="0.01" placeholder="16.59" value={form.govdeYag} onChange={e => f("govdeYag", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sol Bacak — Kas (kg)</Label>
                      <Input type="number" step="0.01" placeholder="10.10" value={form.solBacKas} onChange={e => f("solBacKas", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sol Bacak — Yağ (kg)</Label>
                      <Input type="number" step="0.01" placeholder="4.10" value={form.solBacYag} onChange={e => f("solBacYag", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sağ Bacak — Kas (kg)</Label>
                      <Input type="number" step="0.01" placeholder="10.20" value={form.sagBacKas} onChange={e => f("sagBacKas", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sağ Bacak — Yağ (kg)</Label>
                      <Input type="number" step="0.01" placeholder="3.99" value={form.sagBacYag} onChange={e => f("sagBacYag", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1.5"><Label>Notlar</Label><Textarea rows={2} placeholder="Ölçüm notları..." value={form.notlar} onChange={e => f("notlar", e.target.value)} /></div>
            {hata && <p className="text-xs text-destructive">{hata}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOlcumDialog(false)}>İptal</Button>
            <Button onClick={kaydet}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Ödeme Ekleme Dialogu ─────────────────────────────────────────── */}
      <Dialog open={odemeDialog} onOpenChange={open => { setOdemeDialog(open); if (!open) { setOdemeForm(bosOdemeForm()); setOdemeHata("") } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Ödeme Ekle — {danisan.ad} {danisan.soyad}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tutar (₺) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  placeholder="350"
                  value={odemeForm.tutar}
                  onChange={e => setOdemeForm(p => ({ ...p, tutar: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tarih</Label>
                <Input
                  type="date"
                  value={odemeForm.tarih}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={e => setOdemeForm(p => ({ ...p, tarih: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Açıklama <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Takip seansı, İlk görüşme..."
                value={odemeForm.aciklama}
                onChange={e => setOdemeForm(p => ({ ...p, aciklama: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Durum</Label>
                <Select value={odemeForm.durum} onValueChange={v => setOdemeForm(p => ({ ...p, durum: v as OdemeDurumu }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="odendi">Ödendi</SelectItem>
                    <SelectItem value="bekliyor">Bekliyor</SelectItem>
                    <SelectItem value="gecikti">Gecikti</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Ödeme Yöntemi</Label>
                <Select value={odemeForm.yontem} onValueChange={v => setOdemeForm(p => ({ ...p, yontem: v as Odeme["odeme_yontemi"] }))}>
                  <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nakit">Nakit</SelectItem>
                    <SelectItem value="kart">Kart</SelectItem>
                    <SelectItem value="havale">Havale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {odemeHata && <p className="text-xs text-destructive">{odemeHata}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOdemeDialog(false)}>İptal</Button>
            <Button onClick={odemeKaydet}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Ödeme Sil Onayı ──────────────────────────────────────────────── */}
      <Dialog open={!!silOdemeId} onOpenChange={open => { if (!open) setSilOdemeId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />Ödeme Kaydını Sil
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {(() => {
              const o = odemeler.find(x => x.id === silOdemeId)
              return o ? `"${o.aciklama}" — ${formatPara(o.tutar)} kaydını silmek istiyor musunuz?` : ""
            })()}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSilOdemeId(null)}>İptal</Button>
            <Button variant="destructive" onClick={() => { if (silOdemeId) crmStore.deleteOdeme(silOdemeId); setSilOdemeId(null) }}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
