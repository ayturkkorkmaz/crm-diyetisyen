"use client"

import { useEffect } from "react"

function playTink() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = "sine"
    osc.frequency.setValueAtTime(1047, ctx.currentTime)        // C6
    osc.frequency.exponentialRampToValueAtTime(1319, ctx.currentTime + 0.06) // E6
    gain.gain.setValueAtTime(0.35, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.55)
  } catch {
    // AudioContext desteklenmiyorsa sessizce geç
  }
}

export function WhatsappNotificationPoller() {
  useEffect(() => {
    async function kontrol() {
      try {
        const res = await fetch("/api/whatsapp/incoming", { cache: "no-store" })
        if (!res.ok) return
        const { count } = await res.json() as { count: number }
        if (count > 0) playTink()
      } catch {
        // Bağlantı yoksa sessizce geç
      }
    }

    const interval = setInterval(kontrol, 5000)
    return () => clearInterval(interval)
  }, [])

  return null
}
