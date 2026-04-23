import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/overview",
  "/invoices",
  "/services",
  "/service-request",
  "/banking",
  "/receiviable",
  "/payable",
  "/report",
  "/settings",
  // Inner routes
  "/add-report",
  "/client-payment",
  "/create-invoice",
  "/payment-approval",
  "/record-vendors-payment",
  "/set-rate",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/invoices/:path*",
    "/services/:path*",
    "/service-request/:path*",
    "/banking/:path*",
    "/receiviable/:path*",
    "/payable/:path*",
    "/report/:path*",
    "/settings/:path*",
    "/add-report/:path*",
    "/client-payment/:path*",
    "/create-invoice/:path*",
    "/payment-approval/:path*",
    "/record-vendors-payment/:path*",
    "/set-rate/:path*",
    "/sign-in",
    "/sign-up",
  ],
};