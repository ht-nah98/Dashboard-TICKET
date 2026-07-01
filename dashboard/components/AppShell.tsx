"use client";

import clsx from "clsx";
import Link from "next/link";
import { FilterBar } from "./FilterBar";

type ActivePage = "executive" | "operations" | "seo" | "root" | "priority";

export function AppShell({
  asOf,
  children,
  activePage = "executive",
  pageTitle = "Tổng quan Điều hành",
}: {
  asOf: string;
  children: React.ReactNode;
  activePage?: ActivePage;
  pageTitle?: string;
}) {
  const updated = new Date(asOf);
  return (
    <div className="min-h-screen flex">
      {/* Side rail — Cài đặt removed (was a dead href="#") */}
      <aside className="w-[72px] bg-white border-r border-gborder flex flex-col items-center py-3 gap-2 shrink-0">
        <RailIcon icon="flag" label="Ưu tiên triển khai" href="/priority" active={activePage === "priority"} />
        <RailIcon icon="dashboard" label="Tổng quan" href="/" active={activePage === "executive"} />
        <RailIcon icon="manage_search" label="Vận hành" href="/operations" active={activePage === "operations"} />
        <RailIcon icon="task_alt" label="Việc của tôi" href="/seo" active={activePage === "seo"} />
        <RailIcon icon="insights" label="Nguyên nhân gốc" href="/root" active={activePage === "root"} />
        <div className="flex-1" />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gborder px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gblue" style={{ fontSize: 24 }}>insights</span>
            <div className="font-medium text-[18px]">QLK Ticket Dashboard</div>
            <span className="chip chip-neutral">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[12px] text-gmuted flex items-center gap-1" title="Dữ liệu là snapshot, không tự động làm mới">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
              Snapshot · {updated.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}
            </div>
            <RoleSwitcher activePage={activePage} />
          </div>
        </header>

        {/* Interactive filter bar */}
        <FilterBar activePage={activePage} />

        {/* Body */}
        <main className="flex-1 px-6 py-5 bg-gbg min-w-0">{children}</main>
      </div>
    </div>
  );
}

function RailIcon({ icon, label, active, href = "#" }: { icon: string; label: string; active?: boolean; href?: string }) {
  return (
    <Link
      href={href}
      title={label}
      className={clsx(
        "w-12 h-12 rounded-xl flex items-center justify-center transition",
        active ? "bg-[#E8F0FE] text-gblue" : "text-gmuted hover:bg-gbg"
      )}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{icon}</span>
    </Link>
  );
}

function RoleSwitcher({ activePage }: { activePage: ActivePage }) {
  // Honest label: this navigates between role-flavored pages,
  // it does NOT change a user identity or scope data by ownership.
  const PAGE_ROLES: Record<ActivePage, string> = {
    executive: "C-Level",
    operations: "Manager",
    seo: "SEO",
    root: "Manager",
    priority: "Manager",
  };
  const active = PAGE_ROLES[activePage];
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-gmuted">Góc nhìn:</span>
      <div className="flex items-center bg-gbg rounded-full p-0.5 text-[12px] font-medium">
        {(["C-Level", "Manager", "SEO"] as const).map((role) => (
          <Link
            key={role}
            href={role === "C-Level" ? "/" : role === "Manager" ? "/operations" : "/seo"}
            className={clsx(
              "px-3 py-1 rounded-full transition",
              active === role ? "bg-white text-gink shadow-md" : "text-gmuted hover:text-gink"
            )}
          >
            {role}
          </Link>
        ))}
      </div>
    </div>
  );
}
