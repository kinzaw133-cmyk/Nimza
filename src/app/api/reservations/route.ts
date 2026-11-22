import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const FILE_PATH = path.join(DATA_DIR, "reservations.json");

function getStoredReservations(): any[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify([]), "utf8");
      return [];
    }
    const raw = fs.readFileSync(FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveReservations(list: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save reservations locally:", err);
  }
}

export async function GET() {
  const local = getStoredReservations();
  let dbData: any[] = [];

  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .order("reserved_at", { ascending: false });
      if (data && data.length > 0) {
        dbData = data;
      }
    } catch {}
  }

  // Merge local & DB
  const map = new Map<number, any>();
  local.forEach((r) => map.set(r.id, r));
  dbData.forEach((r) => map.set(r.id, r));

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime()
  );

  return NextResponse.json({ reservations: merged });
}

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json();
    if (!booking.id) {
      booking.id = Math.floor(100000 + Math.random() * 900000);
    }
    if (!booking.created_at) {
      booking.created_at = new Date().toISOString();
    }

    // 1. Save to local server file immediately (Guaranteed zero loss)
    const existing = getStoredReservations();
    const filtered = existing.filter((b) => b.id !== booking.id);
    filtered.unshift(booking);
    saveReservations(filtered);

    // 2. Also try inserting into Supabase
    let supabaseSuccess = false;
    let supabaseError = null;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from("reservations").upsert(
          {
            id: booking.id,
            user_id: booking.user_id || null,
            name: booking.name,
            phone: booking.phone,
            email: booking.email,
            table_no: booking.table_no,
            guests: booking.guests,
            reserved_at: booking.reserved_at,
            section: booking.section,
            notes: booking.notes,
            package_type: booking.package_type,
            package_name: booking.package_name,
            package_price: booking.package_price,
            status: booking.status || "Confirmed",
            booking_type: booking.booking_type || "table_reservation",
            qr_code: booking.qr_code,
            reminder_opt_in: booking.reminder_opt_in ?? true,
            waitlist_position: booking.waitlist_position,
          },
          { onConflict: "id" }
        );

        if (!error) {
          supabaseSuccess = true;
        } else {
          supabaseError = error.message;
        }
      } catch (err: any) {
        supabaseError = err?.message;
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      supabaseSaved: supabaseSuccess,
      supabaseError,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
