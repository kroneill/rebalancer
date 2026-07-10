import { rebalance } from "@rebalancer/solver";
import type { RebalanceResult, Scenario } from "@rebalancer/solver";
import { useMemo, useState } from "react";
import { demoScenario } from "./demo-scenario.ts";
import { PortfolioEditor } from "./PortfolioEditor.tsx";
import { ResultView } from "./ResultView.tsx";
import { emptyScenario } from "./scenario-edit.ts";
import { ContributionsEditor, OptionsEditor, TargetsEditor } from "./ScenarioEditor.tsx";

type Outcome = { result: RebalanceResult; error?: undefined } | { result?: undefined; error: string };

/** The one place the solver runs. Invalid input renders as a message, not a crash. */
function solve(scenario: Scenario): Outcome {
  try {
    return {
      result: rebalance(scenario.portfolio, scenario.targets, {
        ...scenario.options,
        contributions: scenario.contributions,
      }),
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export function App() {
  const [scenario, setScenario] = useState<Scenario>(demoScenario);
  const outcome = useMemo(() => solve(scenario), [scenario]);

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>Rebalancer</h1>
          <p className="tagline">
            Multi-account portfolio rebalancing. Everything runs in this page —
            nothing is uploaded, and reloading clears it.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" onClick={() => setScenario(demoScenario)}>
            Load example
          </button>
          <button type="button" onClick={() => setScenario(emptyScenario())}>
            Start empty
          </button>
        </div>
      </header>

      <PortfolioEditor scenario={scenario} onChange={setScenario} />

      <section aria-labelledby="scenario-heading">
        <h2 id="scenario-heading">Plan</h2>
        <div className="editor-grid">
          <TargetsEditor scenario={scenario} onChange={setScenario} />
          <ContributionsEditor scenario={scenario} onChange={setScenario} />
          <OptionsEditor scenario={scenario} onChange={setScenario} />
        </div>
      </section>

      {outcome.result ? (
        <ResultView scenario={scenario} result={outcome.result} />
      ) : (
        <div className="card solve-error" role="alert">
          <h3>Can’t rebalance yet</h3>
          <p>{outcome.error}</p>
        </div>
      )}
    </main>
  );
}
