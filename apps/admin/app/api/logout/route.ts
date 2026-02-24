import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(new URL("/login", process.env.WEB_BASE_URL || "http://localhost:3000"));
  response.cookies.delete("admin_token");
  return response;
}
