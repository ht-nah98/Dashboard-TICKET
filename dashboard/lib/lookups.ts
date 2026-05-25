// Shared ID→entity lookups + timeline indexer used across derive scripts.

import type { Channel, User, Project, Network, TimelineEvent } from "./types";

export function indexById<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((r) => [r.id, r]));
}

export function channelById(channels: Channel[]): Map<string, Channel> {
  return indexById(channels);
}

export function userById(users: User[]): Map<string, User> {
  return indexById(users);
}

export function projectById(projects: Project[]): Map<string, Project> {
  return indexById(projects);
}

export function networkById(networks: Network[]): Map<string, Network> {
  return indexById(networks);
}

// Index timeline events by ticket_id with chronological ordering.
export function timelineByTicket(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const map = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    const arr = map.get(e.ticket_id) ?? [];
    arr.push(e);
    map.set(e.ticket_id, arr);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp));
  }
  return map;
}

// Generic "group rows by foreign key" — used for SLA steps, etc.
export function groupBy<T, K>(rows: T[], keyFn: (row: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const r of rows) {
    const k = keyFn(r);
    const arr = map.get(k) ?? [];
    arr.push(r);
    map.set(k, arr);
  }
  return map;
}
