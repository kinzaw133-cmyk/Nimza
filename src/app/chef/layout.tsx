"use client";

import React from "react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["chef", "admin"]} requiredRoleName="chef">
      {children}
    </RoleGuard>
  );
}
