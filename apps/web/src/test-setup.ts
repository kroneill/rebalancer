import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";

// The app autosaves the scenario to localStorage on every edit; without
// this, one test's edits would leak into the next test's "first visit".
afterEach(() => {
  localStorage.clear();
});
