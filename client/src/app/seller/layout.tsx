"use client";
import SellerHeader from "@/components/layouts/SellerHeader";
import { usePathname } from "next/navigation";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader =
    pathname === "/seller/auth/login" ||
    pathname === "/seller/auth/register/step1" ||
    pathname === "/seller/auth/register/step2" ||
    pathname === "/seller/auth/register/step3" ||
    pathname === "/seller/auth/register/step4" ||
    pathname === "/seller" ||
    pathname === "/seller/auth/login/wait";
  return (
    <>
      {!hideHeader && <SellerHeader />}
      {children}
    </>
  );
}
