"use client";

import React from "react";
import RoleGuard from "@/components/auth/RoleGuard";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={["delivery", "admin"]} requiredRoleName="delivery">
      {children}
    </RoleGuard>
  );
}
