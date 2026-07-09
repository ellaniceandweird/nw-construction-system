"use client";

import Link from "next/link";
import { Bell, Search, Sparkles, Settings, LogOut, User } from "lucide-react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { ROLE_LABELS } from "@/types/roles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/layout/mobile-nav";

// Temporary placeholder for the project selector — replaced by live Excel
// / API-backed project list in Phase 4 (Mock Data) and Phase 8 (Excel I/O).
const QUICK_PROJECTS = [
  { id: "PRJ-000001", name: "Hudson Hotel — Exterior Renovation" },
  { id: "PRJ-000002", name: "Maple Street Office — Roofing" },
  { id: "PRJ-000003", name: "Bayview Clinic — Tenant Fit-Out" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Topbar() {
  const user = useCurrentUser();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <MobileNav />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex max-w-[260px] justify-between font-normal"
          >
            <span className="truncate">{QUICK_PROJECTS[0].name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Switch project</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {QUICK_PROJECTS.map((p) => (
            <DropdownMenuItem key={p.id}>{p.name}</DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/projects">View all projects</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative ml-auto flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects, activities, vendors…"
          className="pl-8"
        />
      </div>

      <Button variant="ghost" size="icon" className="shrink-0" asChild>
        <Link href="/ai" aria-label="AI Assistant">
          <Sparkles className="size-5 text-primary" />
        </Link>
      </Button>

      <Button variant="ghost" size="icon" className="relative shrink-0">
        <Bell className="size-5" />
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
        <span className="sr-only">Notifications</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg px-1 py-1 outline-none hover:bg-accent">
            <Avatar>
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
            <span className="text-sm font-medium text-foreground">
              {user.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {user.email}
            </span>
            <Badge variant="default" className="mt-1 w-fit">
              {ROLE_LABELS[user.role]}
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Settings /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
