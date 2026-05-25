import fs from "node:fs";
import path from "node:path";
import { AppShell } from "@/components/AppShell";
import { ExecutiveDashboard } from "@/components/ExecutiveDashboard";
import type { DerivedPayload } from "@/lib/types";

function loadDerived(): DerivedPayload {
  const p = path.resolve(process.cwd(), "derived", "executive.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export default function Page() {
  const data = loadDerived();
  return (
    <AppShell asOf={data.as_of} activePage="executive" pageTitle="Tổng quan Điều hành">
      <ExecutiveDashboard data={data} />
    </AppShell>
  );
}
