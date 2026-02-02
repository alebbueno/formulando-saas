import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
    const url = request.nextUrl

    // Get hostname (e.g., 'platform.vercel.app' or 'custom.domain.com')
    // Check x-forwarded-host first (Vercel uses this for custom domains)
    let hostname = request.headers.get("x-forwarded-host") || request.headers.get("host")

    if (hostname) {
        // Handle potential comma-separated values (Vercel proxies)
        if (hostname.includes(',')) {
            hostname = hostname.split(',')[0]
        }
        // Remove port and normalize
        hostname = hostname.split(':')[0].trim().toLowerCase()
    } else {
        hostname = 'localhost'
    }

    // Remove .localhost:3000 for local dev if detected in a weird way, though split removes port usually
    // But let's stick to the logic of replacing the root domain suffix if needed for local testing simulation
    // If it is localhost, we might want to map it to our ROOT_DOMAIN for consistency in checking

    // DEBUG LOGGING
    console.log(">>> MIDDLEWARE DEBUG <<<")
    console.log("Full URL:", request.url)
    console.log("Detected Hostname:", hostname)
    console.log("ROOT_DOMAIN:", process.env.NEXT_PUBLIC_ROOT_DOMAIN)

    // Handle Vercel preview URLs or localhost during dev properly if needed
    if (hostname.includes("localhost")) {
        // For local dev, we might treat localhost as the root domain
        // process.env.NEXT_PUBLIC_ROOT_DOMAIN should be 'localhost:3000' or similar in dev?
        // Let's assume for now if it contains localhost it's akin to root unless we are testing subdomains locally (e.g. test.localhost)
    }

    const searchParams = request.nextUrl.searchParams.toString()
    // Get the pathname of the request (e.g. /, /about, /blog/first-post)
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`

    // Check if it's the root domain (App)
    // We strictly check if the hostname ENDS with our root domain (for subdomains like app.formulando etc if used) 
    // OR if it IS the root domain.
    // NOTE: If you use a subdomain for the app (e.g. app.formulando.com), you need to adjust this.
    // ALSO: Allow vercel preview URLs to work as main domain

    const isMainDomain =
        hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
        (process.env.NEXT_PUBLIC_ROOT_DOMAIN && hostname.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)) ||
        hostname.endsWith('.vercel.app') ||
        hostname === 'localhost'

    if (isMainDomain) {
        console.log(">>> Routing: Main Domain detected")
        return await updateSession(request)
    }

    // It's a custom domain!
    console.log(">>> Routing: Custom Domain detected")

    const response = NextResponse.next()
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as any

    const { data: lps, error } = await supabase
        .from("landing_pages")
        .select("slug, custom_domain")
        .eq("custom_domain", hostname)

    if (error) {
        console.error(">>> DB Error:", error.message)
    }

    // Handle duplicates or no results gracefully
    if (lps && lps.length > 0) {
        console.log(`>>> LP Found: ${lps.length} record(s). Using first one.`)
        const lp = lps[0]
        console.log(">>> LP Slug:", lp.slug)

        if (url.pathname === '/') {
            console.log(">>> Rewriting to:", `/lp/${lp.slug}`)
            return NextResponse.rewrite(new URL(`/lp/${lp.slug}`, request.url))
        } else {
            // Block access to other routes (like /login, /dashboard) via custom domain
            console.log(`>>> Redirecting ${url.pathname} to root for custom domain security.`)
            return NextResponse.redirect(new URL('/', request.url))
        }
    } else {
        console.log(">>> No LP found in DB for this domain.")
    }

    // If domain not found (empty list), 404
    if (!lps || lps.length === 0) {
        console.log(">>> Returning 404 for unknown domain.")
        return NextResponse.rewrite(new URL("/404", request.url))
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
    ],
}
