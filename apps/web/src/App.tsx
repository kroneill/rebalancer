import { rebalance } from "@rebalancer/solver";
import { useMemo } from "react";
import { demoScenario } from "./demo-scenario.ts";
import { ResultView } from "./ResultView.tsx";

export function App() {
  // Temporary demo wiring: render the built-in example scenario's result.
  // The scenario builder (next step) replaces this with user-edited state.
  const result = useMemo(
    () =>
      rebalance(demoScenario.portfolio, demoScenario.targets, {
        ...demoScenario.options,
        contributions: demoScenario.contributions,
      }),
    [],
  );

  return (
    <main className="app">
      <header className="app-header">
        <h1>Rebalancer</h1>
        <p className="tagline">
          Multi-account portfolio rebalancing. Everything runs in this page —
          nothing is uploaded, and reloading clears it.
        </p>
      </header>
      <ResultView scenario={demoScenario} result={result} />
    </main>
  );
}
