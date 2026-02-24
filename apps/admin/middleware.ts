import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN ?? "";
  const cookieToken = request.cookies.get("admin_token")?.value ?? "";

  if (!adminToken && process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  if (!adminToken || cookieToken !== adminToken) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};

