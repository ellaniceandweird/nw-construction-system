import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ToastContainer } from "@/components/shared/toast-container";

/**
 * Persistent application shell.
 * Source: SDS Volume 7 §5 — Header + Sidebar + Main Workspace + Status Bar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-svh w-full overflow-hidden bg-background print:h-auto print:overflow-visible">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col print:block">
        <Topbar />
        <main className="flex-1 overflow-y-auto print:overflow-visible print:h-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
