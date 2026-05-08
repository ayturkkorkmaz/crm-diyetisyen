"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirm) {
      setError("Şifreler eşleşmiyor.")
      return
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    })

    if (error) {
      setError(
        error.message === "User already registered"
          ? "Bu e-posta adresi zaten kayıtlı."
          : "Kayıt sırasında bir hata oluştu."
      )
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-10 space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-emerald-100 rounded-full p-4">
                <Activity className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">Kayıt başarılı!</h2>
            <p className="text-sm text-muted-foreground">
              E-posta adresinize bir doğrulama bağlantısı gönderdik.
              Lütfen e-postanızı kontrol edin ve hesabınızı doğrulayın.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Giriş Sayfasına Git</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sol panel */}
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
            Hemen başlayın,<br />ücretsiz deneyin
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Dakikalar içinde hesabınızı oluşturun ve
            müşterilerinizi yönetmeye başlayın.
          </p>
        </div>
      </div>

      {/* Sağ panel */}
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
              <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
              <CardDescription>Bilgilerinizi girerek kayıt olun</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      placeholder="Ahmet"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      placeholder="Yılmaz"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ahmet@sirket.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Şifre Tekrar</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="••••••••"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Giriş yapın
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
