import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  // Server-side check on the action: Only admins can perform role changes
  const cookieStore = cookies();
  const callerRole = cookieStore.get("sb-user-role")?.value;

  if (callerRole !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized: Admin privileges required." },
      { status: 403 }
    );
  }

  try {
    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "Missing userId or newRole." },
        { status: 400 }
      );
    }

    const ALLOWED_ROLES = ["customer", "chef", "admin", "delivery"];
    if (!ALLOWED_ROLES.includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role. Must be 'customer', 'chef', 'admin', or 'delivery'." },
        { status: 400 }
      );
    }

    // Execute role update on profiles table in Supabase
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Role updated to ${newRole}`,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update role." },
      { status: 500 }
    );
  }
}
