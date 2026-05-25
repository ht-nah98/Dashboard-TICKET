import fs from "node:fs";
import path from "node:path";
import { AppShell } from "@/components/AppShell";
import { OperationsDashboard } from "@/components/OperationsDashboard";
import type { OperationsPayload } from "@/lib/types";

function loadOps(): OperationsPayload {
  const p = path.resolve(process.cwd(), "derived", "operations.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function loadDetails(): Record<string, any> {
  const p = path.resolve(process.cwd(), "derived", "ticket_details.json");
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return {};
  }
}

export default function OperationsPage() {
  const data = loadOps();
  const detailMap = loadDetails();
  return (
    <AppShell asOf={data.as_of} activePage="operations" pageTitle="Kiểm soát Vận hành">
      <OperationsDashboard data={data} detailMap={detailMap} />
    </AppShell>
  );
}
