/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // Expose afterEach globally so @testing-library/react's auto-cleanup
    // unmounts between tests (tests still import expect/test explicitly).
    globals: true,
    // Restrict discovery to src/ so a local build's output can never be
    // picked up as tests (same reasoning as the solver's vitest.config.ts).
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/test-setup.ts"],
  },
});
