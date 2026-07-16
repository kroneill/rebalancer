import { expect, test } from "vitest";
import { demoScenario } from "./demo-scenario.ts";
import { clearStoredScenario, loadStoredScenario, saveStoredScenario, STORAGE_KEY } from "./scenario-storage.ts";

test("a saved scenario loads back unchanged", () => {
  saveStoredScenario(demoScenario);
  expect(loadStoredScenario()).toEqual(demoScenario);
});

test("the stored document is the canonical file format, version stamp included", () => {
  saveStoredScenario(demoScenario);
  expect(localStorage.getItem(STORAGE_KEY)).toContain('"_format": "rebalancetool-scenario-v1"');
});

test("an empty store loads as null", () => {
  expect(loadStoredScenario()).toBeNull();
});

test("corrupt or invalid stored data loads as null instead of throwing, and is left in place", () => {
  localStorage.setItem(STORAGE_KEY, "not json {");
  expect(loadStoredScenario()).toBeNull();

  localStorage.setItem(STORAGE_KEY, '{"nonsense": true}');
  expect(loadStoredScenario()).toBeNull();
  // Left for a future version to recover, never deleted on a failed read.
  expect(localStorage.getItem(STORAGE_KEY)).toBe('{"nonsense": true}');
});

test("clear removes the stored scenario", () => {
  saveStoredScenario(demoScenario);
  clearStoredScenario();
  expect(loadStoredScenario()).toBeNull();
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});
