"use client";

import AdminHeader from "@/components/layouts/AdminHeader";
import { usePathname } from "next/navigation";
import React from "react";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show header on /admin/login
  const hideHeader = pathname === "/admin/login";

  return (
    <>
      {!hideHeader && <AdminHeader />}
      {children}
    </>
  );
}
