import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { portalTokenDogrula } from "@/lib/portal-auth-server"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("portal_session")?.value
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const payload = portalTokenDogrula(token)
  if (!payload) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  return NextResponse.json({ ok: true, danisanId: payload.danisanId, email: payload.email })
}
