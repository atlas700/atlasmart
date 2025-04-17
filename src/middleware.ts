import { NextRequest, NextResponse } from "next/server";
import { Locale, i18nConfig } from "../i18n";
import { getMatchingLocale } from "./lib/i18n/getMatchingLocale";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api(.*)",
  "/courses/:courseId/lessons/:lessonId",
  "/products(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// export default function middleware(request: NextRequest) {
// const localeNotFound: boolean = i18nConfig.locales.every(
//   (locale: Locale) =>
//     !request.nextUrl.pathname.startsWith(`/${locale}/`) &&
//     request.nextUrl.pathname !== `/${locale}`
// );
// if (localeNotFound) {
//   const newLocale: Locale = getMatchingLocale(request);
//   return NextResponse.redirect(
//     new URL(`/${newLocale}/${request.nextUrl.pathname}`, request.url)
//   );
// }
// }

export default clerkMiddleware(async (auth, req) => {
  const request = req as NextRequest;
  const localeNotFound: boolean = i18nConfig.locales.every(
    (locale: Locale) =>
      !request.nextUrl.pathname.startsWith(`/${locale}/`) &&
      request.nextUrl.pathname !== `/${locale}`
  );
  if (localeNotFound) {
    const newLocale: Locale = getMatchingLocale(request);
    return NextResponse.redirect(
      new URL(`/${newLocale}/${request.nextUrl.pathname}`, request.url)
    );
  }
  if (isAdminRoute(req)) {
    const user = await auth.protect();
    if (user.sessionClaims.role !== "admin") {
      return new NextResponse(null, { status: 404 });
    }
  }
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
