import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Flame, Clock } from "lucide-react"
import { demoDiyetPlanlari } from "@/lib/demo-data"
import { formatTarih } from "@/lib/utils-crm"

interface Props { params: Promise<{ id: string }> }

export default async function DiyetPlaniDetayPage({ params }: Props) {
  const { id } = await params
  const plan = demoDiyetPlanlari.find(p => p.id === id)
  if (!plan) notFound()

  return (
    <>
      <Header title={plan.baslik} description={plan.danisan ? `${plan.danisan.ad} ${plan.danisan.soyad}` : ''} />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/diyet-planlari"><ArrowLeft className="h-3.5 w-3.5" />Planlara Dön</Link>
          </Button>
          <Button size="sm">Düzenle</Button>
        </div>

        {/* Plan Özeti */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1"><Flame className="h-4 w-4 text-amber-500" /></div>
            <p className="text-xl font-bold">{plan.gunluk_kalori_hedefi}</p>
            <p className="text-xs text-muted-foreground">kcal/gün hedef</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xl font-bold mt-1">{plan.haftalik_plan.length}</p>
            <p className="text-xs text-muted-foreground">Gün planı</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground mt-1">Başlangıç</p>
            <p className="text-sm font-semibold">{formatTarih(plan.baslangic_tarihi)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground mt-1">Durum</p>
            {plan.aktif ? <Badge variant="success" className="mt-1">Aktif</Badge> : <Badge variant="secondary" className="mt-1">Pasif</Badge>}
          </CardContent></Card>
        </div>

        {plan.notlar && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground italic">{plan.notlar}</CardContent>
          </Card>
        )}

        {/* Haftalık Plan */}
        <div className="space-y-4">
          {plan.haftalik_plan.map((gun) => (
            <Card key={gun.gun}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{gun.gun}</CardTitle>
                  {gun.toplam_kalori && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Flame className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold">{gun.toplam_kalori} kcal</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {gun.ogunler.map((ogun) => (
                  <div key={ogun.ad} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{ogun.ad}</span>
                        {ogun.saat && (
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />{ogun.saat}
                          </span>
                        )}
                      </div>
                      {ogun.toplam_kalori && (
                        <span className="text-xs text-muted-foreground font-medium">{ogun.toplam_kalori} kcal</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {ogun.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{item.ad}</span>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span>{item.miktar}</span>
                            {item.kalori && <span className="text-xs">{item.kalori} kcal</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
