import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/serverAuth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Signed out successfully" });

  // Expire the HTTP-Only session cookie immediately
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set({
    name: "sb-user-role",
    value: "",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
