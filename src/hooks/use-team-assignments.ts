"use client";
import { useSyncExternalStore } from "react";
import { subscribeTeamAssignments, getTeamAssignmentsSnapshot } from "@/lib/projects/team-assignment-store";
import { MOCK_TEAM_ASSIGNMENTS } from "@/lib/data/mock/team-assignments";

export function useTeamAssignments() {
  return useSyncExternalStore(subscribeTeamAssignments, getTeamAssignmentsSnapshot, () => MOCK_TEAM_ASSIGNMENTS);
}
