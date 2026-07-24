"use client";
import { useSyncExternalStore } from "react";
import { subscribeProjects, getProjectsSnapshot } from "@/lib/projects/project-store";
import { MOCK_PROJECTS } from "@/lib/data/mock/projects";

export function useProjects() {
  return useSyncExternalStore(subscribeProjects, getProjectsSnapshot, () => MOCK_PROJECTS);
}
