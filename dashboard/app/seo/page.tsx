import fs from "node:fs";
import path from "node:path";
import { AppShell } from "@/components/AppShell";
import { SeoDashboard } from "@/components/SeoDashboard";
import type { SeoPayload } from "@/lib/derive_seo";
import seoData from "@/derived/seo.json";

const data = seoData as unknown as SeoPayload;

function loadDetails(): Record<string, any> {
  const p = path.resolve(process.cwd(), "derived", "ticket_details.json");
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return {};
  }
}

export default function SeoPage() {
  const detailMap = loadDetails();
  return (
    <AppShell asOf={data.as_of} activePage="seo" pageTitle="Việc của tôi (SEO)">
      <SeoDashboard data={data} detailMap={detailMap} />
    </AppShell>
  );
}
