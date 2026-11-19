import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin Executive Suite — Nimza Restaurant & Lounge",
  description: "Centralized Restaurant Management Portal for Kitchen Orders, Menu Studio, Table Floor Plan, and User Access.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
