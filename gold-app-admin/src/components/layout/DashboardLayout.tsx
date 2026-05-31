"use client";

import { PropsWithChildren } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="admin-shell flex min-h-screen">
      <div className="hidden shrink-0 md:block">
        <Sidebar />
      </div>
      <div className="admin-main flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <main className="admin-content flex-1">{children}</main>
      </div>
    </div>
  );
}
