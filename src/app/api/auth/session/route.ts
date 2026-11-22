import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/serverAuth";

export async function GET() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return NextResponse.json({
      authenticated: false,
      role: null,
      user: null,
    });
  }

  const payload = await verifySessionToken(sessionToken);
  if (!payload) {
    return NextResponse.json({
      authenticated: false,
      role: null,
      user: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    role: payload.role,
    user: {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      user_metadata: { full_name: payload.name },
    },
  });
}
