"use client";

import {usePathname} from "next/navigation";
import type {ReactNode} from "react";
import AdminLoginPage from "./AdminLoginPage";
import AdminShell from "./AdminShell";
import {AdminSessionProvider, useAdminSession} from "./AdminSessionProvider";

function AdminGate({children}: {children: ReactNode}) {
  const pathname = usePathname() ?? "/admin";
  const {ready, token} = useAdminSession();

  if (!ready) return null;

  if (!token) {
    return <AdminLoginPage returnTo={pathname} />;
  }

  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayoutClient({children}: {children: ReactNode}) {
  return (
    <AdminSessionProvider>
      <AdminGate>{children}</AdminGate>
    </AdminSessionProvider>
  );
}
