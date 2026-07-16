import type { Role } from "@/types/roles";

/**
 * TEMPORARY current-user stub.
 *
 * Phase 9 (Authentication & RBAC) replaces this with a real session
 * (NextAuth/Auth.js session or custom JWT) plus a React context provider.
 * Every place that imports this should import from "@/hooks/use-current-user"
 * so swapping the implementation later requires no call-site changes.
 */
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  assignedProjectIds: string[];
}

export const MOCK_CURRENT_USER: CurrentUser = {
  id: "EMP-000001",
  name: "Alex Rivera",
  email: "alex.rivera@niceandweird.com",
  role: "operations_manager",
  assignedProjectIds: ["PRJ-000001", "PRJ-000002", "PRJ-000003"],
};
