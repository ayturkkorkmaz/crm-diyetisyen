import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "VitaNorm — Danışan Portalı",
  description: "Beslenme takip portalınız",
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {children}
    </div>
  )
}
