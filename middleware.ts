import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n, type Locale } from "@/lib/i18n/config";

function getLocaleFromPathname(pathname: string): Locale | undefined {
  const segments = pathname.split("/");
  const firstSegment = segments[1];
  return i18n.locales.find((locale) => locale === firstSegment);
}

function getPreferredLocale(request: NextRequest): Locale {
  // 1. Check cookie first
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value as Locale;
  if (cookieLocale && i18n.locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    // Parse accept-language header (e.g., "en-US,en;q=0.9,ko;q=0.8")
    const languages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [locale, priority] = lang.trim().split(";");
        return {
          locale: locale.split("-")[0], // Get language code only (en from en-US)
          priority: priority ? Number.parseFloat(priority.split("=")[1]) : 1.0,
        };
      })
      .sort((a, b) => b.priority - a.priority);

    // Find first matching locale
    for (const { locale } of languages) {
      const matchedLocale = i18n.locales.find((l) => l === locale);
      if (matchedLocale) {
        return matchedLocale;
      }
    }
  }

  // 3. Default to Korean
  return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for:
  // - Static files (_next/static, images, etc.)
  // - API routes
  // - Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Files with extensions
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const localeInPath = getLocaleFromPathname(pathname);

  if (localeInPath) {
    // Pathname has locale, continue
    const response = NextResponse.next();
    // Set cookie to remember user's locale preference
    response.cookies.set("NEXT_LOCALE", localeInPath, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
    return response;
  }

  // Pathname doesn't have locale, detect and redirect
  const locale = getPreferredLocale(request);

  // For default locale, we can optionally not add prefix
  // But for consistency, let's always add locale prefix
  const newUrl = new URL(`/${locale}${pathname}`, request.url);

  // Preserve query string
  newUrl.search = request.nextUrl.search;

  const response = NextResponse.redirect(newUrl);
  response.cookies.set("NEXT_LOCALE", locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - API routes
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico, sitemap.xml, robots.txt (public files)
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*|manifest.json).*)",
  ],
};
