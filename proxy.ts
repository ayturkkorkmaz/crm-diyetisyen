import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/signup', '/auth']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Danışan portal koruması ──────────────────────────────────────────────────
  if (pathname.startsWith('/portal/dashboard')) {
    const portalSession = request.cookies.get('portal_session')?.value
    if (!portalSession) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
    return NextResponse.next({ request })
  }

  // ── Diyetisyen dashboard koruması ────────────────────────────────────────────
  // Portal, API, static ve auth rotalarını atla
  if (
    pathname.startsWith('/portal') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    isPublicPath(pathname)
  ) {
    return NextResponse.next({ request })
  }

  // Supabase yapılandırılmamışsa veya geliştirme modunda tüm isteklere izin ver
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey || process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  } catch {
    // Supabase hatası durumunda engelleme — geliştirme ortamında çalışmaya devam et
    return NextResponse.next({ request })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
