import React from "react";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin Executive Suite — Nimza Gastronomy",
  description: "Executive restaurant management dashboard for Nimza Gastronomy & Lounge.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
