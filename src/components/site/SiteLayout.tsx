import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { usePublicCmsRealtime } from "@/lib/cms";

export function SiteLayout({ children }: { children: ReactNode }) {
  usePublicCmsRealtime();

  return (
    <div id="top" className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
