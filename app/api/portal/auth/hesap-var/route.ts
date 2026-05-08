import { NextResponse } from "next/server"
import { portalHesapVarMi } from "@/lib/portal-auth-server"

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const danisanId = searchParams.get("danisanId")
  if (!danisanId) return NextResponse.json({ var: false })
  return NextResponse.json({ var: portalHesapVarMi(danisanId) })
}
