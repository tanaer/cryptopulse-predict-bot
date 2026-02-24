"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const adminToken = process.env.ADMIN_TOKEN ?? "";

  if (!adminToken && process.env.NODE_ENV !== "production") {
    redirect("/admin");
  }

  if (!adminToken || token !== adminToken) {
    redirect("/login?error=1");
  }

  const jar = await cookies();
  jar.set("admin_token", adminToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production"
  });

  redirect("/admin");
}

