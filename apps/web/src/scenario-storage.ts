import type { Scenario } from "@rebalancer/solver";
import { scenarioFromJson, scenarioToJson } from "./scenario-file.ts";

/**
 * Autosave: the scenario is mirrored into this browser's localStorage on
 * every edit, so reloading (or closing and reopening the tab) comes back
 * exactly where the user left off. The stored document is the canonical
 * Scenario JSON — byte-for-byte what "Save file" downloads — and is
 * validated on the way back in like any untrusted file, so a corrupt or
 * incompatible entry just falls back to a first visit. Data still never
 * leaves the device: localStorage is local-only, never transmitted.
 *
 * Every function is best-effort — localStorage can be absent or throwing
 * (private browsing, storage disabled, quota) and the app must then simply
 * behave as it did before autosave existed.
 */

export const STORAGE_KEY = "rebalancetool.scenario";

export function loadStoredScenario(): Scenario | null {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (text === null) return null;
    return scenarioFromJson(text);
  } catch {
    // Unreadable or invalid. The entry is deliberately left in place: a
    // future version that understands it could still recover it.
    return null;
  }
}

export function saveStoredScenario(scenario: Scenario): void {
  try {
    localStorage.setItem(STORAGE_KEY, scenarioToJson(scenario));
  } catch {
    // Best effort only.
  }
}

export function clearStoredScenario(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Best effort only.
  }
}
