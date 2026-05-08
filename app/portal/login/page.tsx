"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Activity, Lock, Mail, Eye, EyeOff } from "lucide-react"

export default function PortalLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [sifre, setSifre] = useState("")
  const [sifreGoster, setSifreGoster] = useState(false)
  const [hata, setHata] = useState("")
  const [yukleniyor, setYukleniyor] = useState(false)

  async function handleGiris() {
    if (!email.trim() || !sifre.trim()) {
      setHata("Lütfen e-posta ve şifrenizi girin.")
      return
    }
    setYukleniyor(true)
    setHata("")

    try {
      const res = await fetch("/api/portal/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), sifre }),
      })
      const data = await res.json() as { ok: boolean; hata?: string }

      if (data.ok) {
        // danisanId için me endpoint'ini çağır ve localStorage'a yaz (mevcut portal kodlarıyla uyum)
        const meRes = await fetch("/api/portal/auth/me")
        const me = await meRes.json() as { ok: boolean; danisanId?: string; email?: string }
        if (me.ok && me.danisanId) {
          localStorage.setItem("portalAuth", JSON.stringify({
            danisanId: me.danisanId,
            email: me.email,
          }))
        }
        router.push("/portal/dashboard")
      } else {
        setHata(data.hata ?? "Giriş başarısız.")
        setYukleniyor(false)
      }
    } catch {
      setHata("Bağlantı hatası. Lütfen tekrar deneyin.")
      setYukleniyor(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary rounded-2xl p-3.5 mb-3 shadow-lg shadow-primary/20">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">VitaNorm</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Danışan Portalı</p>
        </div>

        {/* Kart */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-center">Giriş Yap</h2>
            <p className="text-xs text-muted-foreground text-center mt-0.5">
              Diyetisyeninizin oluşturduğu hesap bilgilerinizle giriş yapın
            </p>
          </div>

          {/* E-posta */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">E-posta</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setHata("") }}
                onKeyDown={e => e.key === "Enter" && handleGiris()}
                autoComplete="email"
                className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Şifre */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={sifreGoster ? "text" : "password"}
                placeholder="••••••••"
                value={sifre}
                onChange={e => { setSifre(e.target.value); setHata("") }}
                onKeyDown={e => e.key === "Enter" && handleGiris()}
                autoComplete="current-password"
                className="w-full rounded-xl border border-input bg-background pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setSifreGoster(!sifreGoster)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {sifreGoster ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Hata */}
          {hata && (
            <div className="bg-destructive/10 rounded-xl px-3 py-2 text-sm text-destructive text-center">
              {hata}
            </div>
          )}

          {/* Giriş Butonu */}
          <button
            onClick={handleGiris}
            disabled={yukleniyor}
            className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {yukleniyor ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Giriş bilgilerinizi diyetisyeninizden alabilirsiniz.
        </p>
      </div>
    </div>
  )
}
