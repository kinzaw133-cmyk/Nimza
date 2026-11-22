import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  verifyAdminCredentials,
  verifyChefCredentials,
  signSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/serverAuth";
import {
  PERMANENT_ADMIN_EMAILS,
  PERMANENT_CHEF_EMAILS,
} from "@/lib/authConfig";

/**
 * Unified Login API Route — Handles ALL roles:
 * 1. Admin: Verified against env-only credentials
 * 2. Chef: Verified against env-only credentials
 * 3. Customer/Delivery: Verified via Supabase Auth
 *
 * On success, sets:
 * - `nimza_session` HttpOnly signed JWT cookie (tamper-proof server session)
 * - `sb-user-role` public cookie (client-side routing sync)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, action } = body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    // ── 1. Administrator Verification ──
    if (PERMANENT_ADMIN_EMAILS.includes(cleanEmail)) {
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
          user_metadata: { full_name: "Executive Administrator" },
        },
      });

      setCookies(response, SESSION_COOKIE_NAME, token, "admin");
      return response;
    }

    // ── 2. Executive Chef Verification ──
    if (PERMANENT_CHEF_EMAILS.includes(cleanEmail)) {
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
          user_metadata: { full_name: "Executive Chef Elias Varga" },
        },
      });

      setCookies(response, SESSION_COOKIE_NAME, token, "chef");
      return response;
    }

    // ── 3. Customer / Delivery Authentication via Supabase Auth ──
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes("placeholder")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication service not configured. Contact admin.",
        },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === "signup") {
      // ── 3a. New Customer Registration ──
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name:
                body.name || cleanEmail.split("@")[0] || "VIP Member",
            },
          },
        });

      if (signUpError) {
        let msg = signUpError.message;
        if (msg.toLowerCase().includes("rate limit")) {
          msg = "Supabase Email Rate Limit exceeded (free tier allows 3 emails/hr). Please disable 'Confirm email' in Supabase Dashboard > Authentication > Providers > Email, or try signing in.";
        }
        return NextResponse.json(
          { success: false, error: msg },
          { status: 400 }
        );
      }

      if (!signUpData.user) {
        return NextResponse.json(
          { success: false, error: "Registration failed. Please try again." },
          { status: 500 }
        );
      }

      const userName =
        body.name ||
        signUpData.user.user_metadata?.full_name ||
        cleanEmail.split("@")[0];
      const userRole = "customer";

      const token = await signSessionToken({
        id: signUpData.user.id,
        email: cleanEmail,
        role: userRole,
        name: userName,
      });

      const response = NextResponse.json({
        success: true,
        role: userRole,
        redirect: "/",
        user: {
          id: signUpData.user.id,
          email: cleanEmail,
          role: userRole,
          name: userName,
          user_metadata: { full_name: userName },
        },
      });

      setCookies(response, SESSION_COOKIE_NAME, token, userRole);
      return response;
    }

    // ── 3b. Existing Customer / Delivery Sign In ──
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: authError?.message || "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Fetch user role from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", authData.user.id)
      .single();

    const userRole = (profile?.role as string) || "customer";
    const userName =
      profile?.full_name ||
      authData.user.user_metadata?.full_name ||
      cleanEmail.split("@")[0];

    const token = await signSessionToken({
      id: authData.user.id,
      email: cleanEmail,
      role: userRole as "admin" | "chef" | "customer" | "delivery",
      name: userName,
    });

    const redirect =
      userRole === "delivery"
        ? "/driver"
        : userRole === "admin"
        ? "/admin"
        : userRole === "chef"
        ? "/chef"
        : "/";

    const response = NextResponse.json({
      success: true,
      role: userRole,
      redirect,
      user: {
        id: authData.user.id,
        email: cleanEmail,
        role: userRole,
        name: userName,
        user_metadata: { full_name: userName },
      },
    });

    setCookies(response, SESSION_COOKIE_NAME, token, userRole);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Helper: Set both HttpOnly session cookie and public role cookie
 */
function setCookies(
  response: NextResponse,
  cookieName: string,
  token: string,
  role: string
) {
  response.cookies.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  response.cookies.set({
    name: "sb-user-role",
    value: role,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}
