import { NextResponse } from "next/server"

export function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set("portal_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
  return response
}
