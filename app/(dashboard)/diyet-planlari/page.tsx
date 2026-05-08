"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Flame, Plus, Calendar } from "lucide-react"
import { useDiyetPlanlari, useDanisanlar } from "@/lib/crm-store"
import { getInitials, formatTarih } from "@/lib/utils-crm"

export default function DiyetPlanlariPage() {
  const router = useRouter()
  const planlar = useDiyetPlanlari()
  const danisanlar = useDanisanlar()

  const danisanMap = Object.fromEntries(danisanlar.map(d => [d.id, d]))

  return (
    <>
      <Header
        title="Diyet Planları"
        description={`${planlar.length} plan oluşturulmuş`}
        action={
          <Button size="sm" className="gap-1.5" onClick={() => router.push('/diyet-planlari/yeni')}>
            <Plus className="h-3.5 w-3.5" /> Yeni Plan
          </Button>
        }
      />
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planlar.map(plan => {
            const danisan = danisanMap[plan.danisan_id]
            return (
              <Card key={plan.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {danisan && (
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-xs">
                            {getInitials(danisan.ad, danisan.soyad)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{plan.baslik}</p>
                        {danisan && (
                          <Link href={`/danisanlar/${plan.danisan_id}`} className="text-xs text-primary hover:underline">
                            {danisan.ad} {danisan.soyad}
                          </Link>
                        )}
                      </div>
                    </div>
                    {plan.aktif
                      ? <Badge variant="success">Aktif</Badge>
                      : <Badge variant="secondary">Pasif</Badge>
                    }
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-muted rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Flame className="h-3.5 w-3.5 text-amber-500" />
                        <p className="text-sm font-bold">{plan.gunluk_kalori_hedefi ?? '—'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">kcal/gün</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2 text-center">
                      <p className="text-sm font-bold">{plan.haftalik_plan.length || '—'}</p>
                      <p className="text-xs text-muted-foreground">Gün planı</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2 text-center">
                      <p className="text-sm font-bold">{plan.haftalik_plan[0]?.ogunler.length ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">Öğün/gün</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatTarih(plan.baslangic_tarihi)}
                      {plan.bitis_tarihi && ` — ${formatTarih(plan.bitis_tarihi)}`}
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/diyet-planlari/${plan.id}`}>Planı Görüntüle</Link>
                    </Button>
                  </div>

                  {plan.notlar && (
                    <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">{plan.notlar}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </>
  )
}
