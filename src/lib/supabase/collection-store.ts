"use client";

import { createClient } from "@/lib/supabase/client";

type Listener = () => void;

export interface CollectionStoreConfig<T extends { id: string }> {
  /** Real Postgres table name (snake_case). */
  table: string;
  /** Used only until the first real fetch completes, and as an offline/error fallback. */
  seedData: T[];
  /** Converts a Postgres row (snake_case) into the app's camelCase type. */
  fromRow: (row: Record<string, any>) => T;
  /** Converts an app-shape partial input (camelCase) into a Postgres row (snake_case) for insert/update. */
  toRow: (input: Record<string, any>) => Record<string, any>;
  /** Column to order by when fetching (default: "created_at"). */
  orderBy?: string;
}

export interface CollectionStore<T extends { id: string }> {
  subscribe(listener: Listener): () => void;
  getSnapshot(): T[];
  /** The specific error message from the most recent failed create/update, if any — for surfacing real diagnostics in the UI instead of a generic message. */
  getLastError(): string | null;
  /** Creates a row. `input` should already include an `id` matching this app's ID scheme (e.g. "PROP-000001"). */
  create(input: Record<string, any> & { id: string }): Promise<string | null>;
  update(id: string, input: Record<string, any>): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  /** Force a re-fetch from the database — rarely needed since realtime keeps things in sync automatically. */
  refetch(): Promise<void>;
}

/**
 * Turns a Postgres table into a live, realtime-synced store with the
 * exact subscribe/getSnapshot shape every hook in this app already
 * expects via useSyncExternalStore — so converting a module to real
 * shared data means rewriting the store file only, never the hook or
 * any screen that uses it.
 *
 * Uses optimistic local updates (so the UI feels instant) plus a
 * Supabase Realtime subscription (so changes made by other people, in
 * other browser tabs, show up here automatically without a refresh).
 */
export function createCollectionStore<T extends { id: string }>(
  config: CollectionStoreConfig<T>
): CollectionStore<T> {
  let items: T[] = config.seedData;
  const listeners = new Set<Listener>();
  let initialized = false;
  let lastError: string | null = null;

  function emit() {
    listeners.forEach((l) => l());
  }

  async function refetch() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(config.table)
      .select("*")
      .order(config.orderBy ?? "created_at", { ascending: true });
    if (error) {
      console.error(`[${config.table}] fetch failed:`, error.message);
      return;
    }
    if (data) {
      items = data.map(config.fromRow);
      emit();
    }
  }

  function ensureInitialized() {
    if (initialized || typeof window === "undefined") return;
    initialized = true;
    refetch();

    const supabase = createClient();
    supabase
      .channel(`${config.table}-changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: config.table },
        () => {
          // Simplest correct approach for this data size: re-fetch on any
          // change (insert/update/delete, from us or anyone else) rather
          // than hand-merge the payload — small dataset, cheap query.
          refetch();
        }
      )
      .subscribe();
  }

  return {
    subscribe(listener: Listener) {
      ensureInitialized();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return items;
    },
    getLastError() {
      return lastError;
    },
    refetch,
    async create(input) {
      // Optimistic: show it immediately, reconcile with the real row once the insert confirms.
      const optimistic = config.fromRow(config.toRow(input));
      items = [...items, optimistic];
      emit();

      const supabase = createClient();
      const { data, error } = await supabase
        .from(config.table)
        .insert(config.toRow(input))
        .select("*")
        .single();

      if (error) {
        console.error(`[${config.table}] create failed:`, error.message);
        lastError = error.message;
        items = items.filter((i) => i.id !== input.id);
        emit();
        return null;
      }
      lastError = null;
      await refetch();
      return data.id as string;
    },
    async update(id, input) {
      const previous = items;
      items = items.map((i) => (i.id === id ? { ...i, ...config.fromRow({ ...config.toRow(i), ...config.toRow(input) }) } : i));
      emit();

      const supabase = createClient();
      const { error } = await supabase.from(config.table).update(config.toRow(input)).eq("id", id);

      if (error) {
        console.error(`[${config.table}] update failed:`, error.message);
        lastError = error.message;
        items = previous;
        emit();
        return false;
      }
      lastError = null;
      await refetch();
      return true;
    },
    async remove(id) {
      const previous = items;
      items = items.filter((i) => i.id !== id);
      emit();

      const supabase = createClient();
      const { error } = await supabase.from(config.table).delete().eq("id", id);

      if (error) {
        console.error(`[${config.table}] delete failed:`, error.message);
        items = previous;
        emit();
        return false;
      }
      return true;
    },
  };
}
