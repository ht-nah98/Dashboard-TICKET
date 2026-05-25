import { AppShell } from "@/components/AppShell";
import { SeoDashboard } from "@/components/SeoDashboard";
import type { SeoPayload } from "@/lib/derive_seo";
import seoData from "@/derived/seo.json";

const data = seoData as unknown as SeoPayload;

export default function SeoPage() {
  return (
    <AppShell asOf={data.as_of} activePage="seo" pageTitle="Việc của tôi (SEO)">
      <SeoDashboard data={data} />
    </AppShell>
  );
}
