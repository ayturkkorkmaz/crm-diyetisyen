"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message === "Invalid login credentials"
        ? "E-posta veya şifre hatalı."
        : "Giriş yapılırken bir hata oluştu."
      )
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Sol panel — marka */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-primary-foreground/20 rounded-xl p-3">
              <Activity className="h-8 w-8" />
            </div>
            <span className="text-3xl font-bold tracking-tight">VitaNorm</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            İşinizi büyütmek için<br />ihtiyacınız olan her şey
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Müşterilerinizi takip edin, fırsatlarınızı yönetin ve
            satış süreçlerinizi tek bir yerden kontrol edin.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">12+</div>
              <div className="text-sm text-primary-foreground/70 mt-1">Aktif Özellik</div>
            </div>
            <div>
              <div className="text-3xl font-bold">%99</div>
              <div className="text-sm text-primary-foreground/70 mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold">7/24</div>
              <div className="text-sm text-primary-foreground/70 mt-1">Destek</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-primary rounded-lg p-1.5">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">VitaNorm CRM</span>
          </div>

          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <CardTitle className="text-2xl">Hoş geldiniz</CardTitle>
              <CardDescription>Hesabınıza giriş yapın</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@sirket.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Şifre</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Şifremi unuttum
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                Hesabınız yok mu?{" "}
                <a href="/signup" className="text-primary font-medium hover:underline">
                  Kayıt olun
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
