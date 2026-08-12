"use client";
import * as React from "react";
import { recordRecentlyViewed } from "@/lib/search/recently-viewed-store";

/** Tiny client component that records a project page visit on mount — the page itself is a server component. */
export function RecordProjectView({ projectId, title }: { projectId: string; title: string }) {
  React.useEffect(() => {
    recordRecentlyViewed({ title, href: `/projects/${projectId}`, category: "Project" });
  }, [projectId, title]);
  return null;
}
