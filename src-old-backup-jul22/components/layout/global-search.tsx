"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Clock, FolderKanban, Building2, FileText, PenTool, Users, Calculator } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useProperties } from "@/hooks/use-properties";
import { useDocuments } from "@/hooks/use-documents";
import { useDrawings } from "@/hooks/use-drawings";
import { useContacts } from "@/hooks/use-contacts";
import { useEstimates } from "@/hooks/use-estimates";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { buildSearchIndex, searchItems } from "@/lib/search/build-search-index";
import type { SearchResultItem } from "@/lib/search/build-search-index";

const CATEGORY_ICON: Record<SearchResultItem["category"], React.ElementType> = {
  Project: FolderKanban,
  Property: Building2,
  Document: FileText,
  Drawing: PenTool,
  Contact: Users,
  Estimate: Calculator,
};

export function GlobalSearch() {
  const router = useRouter();
  const properties = useProperties();
  const documents = useDocuments();
  const drawings = useDrawings();
  const contacts = useContacts();
  const estimates = useEstimates();
  const recentlyViewed = useRecentlyViewed();

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const index = React.useMemo(
    () => buildSearchIndex(properties, documents, drawings, contacts, estimates),
    [properties, documents, drawings, contacts, estimates]
  );
  const results = searchItems(index, query);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={containerRef} className="relative ml-1 flex-1 max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search anything..."
        className="h-9 rounded-full pl-9"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
      />

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-lg">
          {query.trim() ? (
            results.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {results.map((item) => {
                  const Icon = CATEGORY_ICON[item.category];
                  return (
                    <button
                      key={`${item.category}-${item.id}`}
                      onClick={() => handleSelect(item.href)}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent"
                    >
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.category}
                          {item.subtitle ? ` · ${item.subtitle}` : ""}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="px-2.5 py-4 text-center text-sm text-muted-foreground">No matches for &quot;{query}&quot;.</p>
            )
          ) : recentlyViewed.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              <p className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3" /> Recently Viewed
              </p>
              {recentlyViewed.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-accent"
                >
                  <span className="truncate font-medium text-foreground">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{item.category}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-2.5 py-4 text-center text-sm text-muted-foreground">Start typing to search projects, properties, documents, and more.</p>
          )}
        </div>
      )}
    </div>
  );
}
