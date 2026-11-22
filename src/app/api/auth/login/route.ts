import { NextResponse } from "next/server";
import {
  verifyAdminCredentials,
  verifyChefCredentials,
  signSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/serverAuth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const adminEmails = [
      (process.env.ADMIN_EMAIL || "admin@nimza.com").trim().toLowerCase(),
      "admin@nimza.com",
      "admin@nimaz.com",
    ];
    const chefEmails = [
      (process.env.CHEF_EMAIL || "chef@nimza.com").trim().toLowerCase(),
      "chef@nimza.com",
      "chef@nimaz.com",
    ];

    // 1. Strict Administrator Verification (supports both admin@nimza.com and admin@nimaz.com)
    if (adminEmails.includes(cleanEmail)) {
      const isValid = verifyAdminCredentials(cleanEmail, cleanPassword);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid Credentials. Access Denied." },
          { status: 401 }
        );
      }

      const token = await signSessionToken({
        id: "admin-master",
        email: cleanEmail,
        role: "admin",
        name: "Executive Administrator",
      });

      const response = NextResponse.json({
        success: true,
        role: "admin",
        redirect: "/admin",
        user: {
          id: "admin-master",
          email: cleanEmail,
          role: "admin",
          name: "Executive Administrator",
        },
      });

      // Secure HTTP-Only session cookie
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      // Public role cookie for client router sync
      response.cookies.set({
        name: "sb-user-role",
        value: "admin",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // 2. Strict Executive Chef Verification (supports both chef@nimza.com and chef@nimaz.com)
    if (chefEmails.includes(cleanEmail)) {
      const isValid = verifyChefCredentials(cleanEmail, cleanPassword);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid Credentials. Access Denied." },
          { status: 401 }
        );
      }

      const token = await signSessionToken({
        id: "chef-master",
        email: cleanEmail,
        role: "chef",
        name: "Executive Chef Elias Varga",
      });

      const response = NextResponse.json({
        success: true,
        role: "chef",
        redirect: "/chef",
        user: {
          id: "chef-master",
          email: cleanEmail,
          role: "chef",
          name: "Executive Chef Elias Varga",
        },
      });

      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      response.cookies.set({
        name: "sb-user-role",
        value: "chef",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    // 3. ANY OTHER EMAIL (Customer, random, invalid) IS STRICTLY REJECTED
    return NextResponse.json(
      { success: false, error: "Invalid Credentials. Access Denied." },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
