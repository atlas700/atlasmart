import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { Locale, i18nConfig } from "../i18n";
import { getMatchingLocale } from "./lib/i18n/getMatchingLocale";

// Routes that are public (no auth required)
const isPublicRoute = createRouteMatcher([
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
  "/api(.*)", // Public APIs like webhooks
  "/:locale",
]);

// Routes that require admin role
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const request = req as NextRequest;
  const { pathname } = request.nextUrl;

  // ✅ Skip static files, _next, clerk, and api from locale/auth logic
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/clerk/") ||
    pathname.match(/\.(.*)$/) // skip static assets like .jpg, .css, etc.
  ) {
    return NextResponse.next();
  }

  // ✅ Locale redirect if the path does not include a valid locale prefix
  const localeNotFound = i18nConfig.locales.every(
    (locale: Locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (localeNotFound) {
    const newLocale: Locale = getMatchingLocale(request);
    const pathnameWithoutLeadingSlash = pathname.startsWith("/")
      ? pathname.slice(1)
      : pathname;
    return NextResponse.redirect(
      new URL(`/${newLocale}/${pathnameWithoutLeadingSlash}`, request.url)
    );
  }

  // ✅ Protect all non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // ✅ Protect admin routes and check role
  if (isAdminRoute(request)) {
    const { sessionClaims } = await auth.protect();
    if (sessionClaims.role !== "ADMIN") {
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Run on everything except static assets and internals
    "/((?!_next|clerk|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
