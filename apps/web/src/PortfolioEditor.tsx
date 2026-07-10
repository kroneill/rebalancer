import type { Scenario, TaxPreference, TaxType } from "@rebalancer/solver";
import { useState } from "react";
import { MoneyInput } from "./inputs.tsx";
import {
  addAccount,
  addAssetClass,
  addFund,
  moveFundPreference,
  removeAccount,
  removeAssetClass,
  removeFund,
  setFundAvailability,
  updateAccount,
  updateAssetClass,
  updateFund,
  withHolding,
} from "./scenario-edit.ts";

/**
 * Builds the Portfolio half of the Scenario: asset classes, funds, and
 * accounts (tax type, buyable-fund menu with preference order, current
 * holdings). Pure structure editing — all placement decisions stay in the
 * solver.
 */

const TAX_TYPE_OPTIONS: { value: TaxType; label: string }[] = [
  { value: "taxable", label: "Taxable" },
  { value: "tax_deferred", label: "Tax-deferred" },
  { value: "tax_free", label: "Tax-free" },
];

const TAX_PREFERENCE_OPTIONS: { value: TaxPreference; label: string }[] = [
  { value: "neutral", label: "Neutral" },
  { value: "prefer_taxable", label: "Prefer taxable" },
  { value: "prefer_tax_advantaged", label: "Prefer tax-advantaged" },
];

interface EditorProps {
  scenario: Scenario;
  onChange: (scenario: Scenario) => void;
}

/** Text field + Add button (button click only — no form submit). */
function AddRow({
  placeholder,
  buttonLabel,
  onAdd,
  disabledReason,
  children,
}: {
  placeholder: string;
  buttonLabel: string;
  onAdd: (name: string) => void;
  disabledReason?: string;
  children?: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const add = () => {
    if (name.trim() === "") return;
    onAdd(name.trim());
    setName("");
  };
  return (
    <div className="add-row">
      <input
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        value={name}
        disabled={disabledReason !== undefined}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") add();
        }}
      />
      {children}
      <button type="button" onClick={add} disabled={disabledReason !== undefined || name.trim() === ""}>
        {buttonLabel}
      </button>
      {disabledReason && <span className="editor-hint">{disabledReason}</span>}
    </div>
  );
}

function AssetClassesCard({ scenario, onChange }: EditorProps) {
  return (
    <div className="card editor-card">
      <h3>Asset classes</h3>
      <p className="editor-hint">The categories you allocate across. Each fund belongs to one.</p>
      {scenario.portfolio.assetClasses.map((assetClass) => (
        <div className="field-row" key={assetClass.id}>
          <input
            type="text"
            aria-label={`Asset class name (${assetClass.id})`}
            value={assetClass.name}
            onChange={(event) => onChange(updateAssetClass(scenario, assetClass.id, { name: event.target.value }))}
          />
          <select
            aria-label={`Tax preference for ${assetClass.name}`}
            value={assetClass.taxPreference ?? "neutral"}
            onChange={(event) =>
              onChange(
                updateAssetClass(scenario, assetClass.id, { taxPreference: event.target.value as TaxPreference }),
              )
            }
          >
            {TAX_PREFERENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="remove-button"
            aria-label={`Remove asset class ${assetClass.name}`}
            title="Removes this class, its funds, and their holdings"
            onClick={() => onChange(removeAssetClass(scenario, assetClass.id))}
          >
            ✕
          </button>
        </div>
      ))}
      <AddRow
        placeholder="New asset class name"
        buttonLabel="Add class"
        onAdd={(name) => onChange(addAssetClass(scenario, name))}
      />
    </div>
  );
}

function FundsCard({ scenario, onChange }: EditorProps) {
  const { assetClasses, funds } = scenario.portfolio;
  const [newFundClassId, setNewFundClassId] = useState("");
  const effectiveNewClassId = assetClasses.some((c) => c.id === newFundClassId)
    ? newFundClassId
    : (assetClasses[0]?.id ?? "");
  return (
    <div className="card editor-card">
      <h3>Funds</h3>
      <p className="editor-hint">Everything you hold or could buy, tagged with its asset class.</p>
      {funds.map((fund) => (
        <div className="field-row" key={fund.id}>
          <input
            type="text"
            className="ticker-input"
            aria-label={`Ticker for fund ${fund.id}`}
            placeholder="Ticker"
            value={fund.ticker ?? ""}
            onChange={(event) => onChange(updateFund(scenario, fund.id, { ticker: event.target.value }))}
          />
          <input
            type="text"
            aria-label={`Name for fund ${fund.id}`}
            placeholder="Full name (optional)"
            value={fund.name}
            onChange={(event) => onChange(updateFund(scenario, fund.id, { name: event.target.value }))}
          />
          <select
            aria-label={`Asset class for fund ${fund.ticker || fund.id}`}
            value={fund.assetClassId}
            onChange={(event) => onChange(updateFund(scenario, fund.id, { assetClassId: event.target.value }))}
          >
            {assetClasses.map((assetClass) => (
              <option key={assetClass.id} value={assetClass.id}>
                {assetClass.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="remove-button"
            aria-label={`Remove fund ${fund.ticker || fund.id}`}
            title="Removes this fund and its holdings"
            onClick={() => onChange(removeFund(scenario, fund.id))}
          >
            ✕
          </button>
        </div>
      ))}
      <AddRow
        placeholder="New fund ticker"
        buttonLabel="Add fund"
        disabledReason={assetClasses.length === 0 ? "Add an asset class first." : undefined}
        onAdd={(ticker) => onChange(addFund(scenario, ticker.toUpperCase(), effectiveNewClassId))}
      >
        <select
          aria-label="Asset class for new fund"
          value={effectiveNewClassId}
          disabled={assetClasses.length === 0}
          onChange={(event) => setNewFundClassId(event.target.value)}
        >
          {assetClasses.map((assetClass) => (
            <option key={assetClass.id} value={assetClass.id}>
              {assetClass.name}
            </option>
          ))}
        </select>
      </AddRow>
    </div>
  );
}

function AccountCard({ scenario, onChange, accountId }: EditorProps & { accountId: string }) {
  const account = scenario.portfolio.accounts.find((a) => a.id === accountId);
  if (!account) return null;
  const { funds, holdings } = scenario.portfolio;
  const holdingByFundId = new Map(
    holdings.filter((h) => h.accountId === accountId).map((h) => [h.fundId, h.value]),
  );
  return (
    <div className="card editor-card account-card">
      <div className="account-card-header">
        <input
          type="text"
          aria-label={`Account name (${account.id})`}
          value={account.name}
          onChange={(event) => onChange(updateAccount(scenario, account.id, { name: event.target.value }))}
        />
        <select
          aria-label={`Tax type for ${account.name}`}
          value={account.taxType}
          onChange={(event) => onChange(updateAccount(scenario, account.id, { taxType: event.target.value as TaxType }))}
        >
          {TAX_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="remove-button"
          aria-label={`Remove account ${account.name}`}
          title="Removes this account, its holdings, and its contribution"
          onClick={() => onChange(removeAccount(scenario, account.id))}
        >
          ✕
        </button>
      </div>
      {funds.length === 0 ? (
        <p className="editor-hint">Add funds to give this account something to hold or buy.</p>
      ) : (
        <div className="table-scroll">
          <table className="account-fund-table">
            <thead>
              <tr>
                <th scope="col">Fund</th>
                <th scope="col">Buyable</th>
                <th scope="col">Preference</th>
                <th scope="col" className="num-col">Current value</th>
              </tr>
            </thead>
            <tbody>
              {funds.map((fund) => {
                const label = fund.ticker || fund.name || fund.id;
                const rank = account.availableFundIds.indexOf(fund.id);
                const held = holdingByFundId.get(fund.id) ?? 0;
                return (
                  <tr key={fund.id}>
                    <th scope="row">{label}</th>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`${label} buyable in ${account.name}`}
                        checked={rank !== -1}
                        onChange={(event) =>
                          onChange(setFundAvailability(scenario, account.id, fund.id, event.target.checked))
                        }
                      />
                    </td>
                    <td className="preference-cell">
                      {rank !== -1 && (
                        <>
                          <span className="num">#{rank + 1}</span>
                          <button
                            type="button"
                            aria-label={`Prefer ${label} more in ${account.name}`}
                            disabled={rank === 0}
                            onClick={() => onChange(moveFundPreference(scenario, account.id, fund.id, -1))}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label={`Prefer ${label} less in ${account.name}`}
                            disabled={rank === account.availableFundIds.length - 1}
                            onClick={() => onChange(moveFundPreference(scenario, account.id, fund.id, 1))}
                          >
                            ↓
                          </button>
                        </>
                      )}
                    </td>
                    <td className="num-col">
                      <MoneyInput
                        cents={held}
                        onCents={(value) => onChange(withHolding(scenario, account.id, fund.id, value))}
                        label={`Current value of ${label} in ${account.name}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function PortfolioEditor({ scenario, onChange }: EditorProps) {
  const [newAccountTaxType, setNewAccountTaxType] = useState<TaxType>("taxable");
  return (
    <section aria-labelledby="portfolio-heading">
      <h2 id="portfolio-heading">Portfolio</h2>
      <div className="editor-grid">
        <AssetClassesCard scenario={scenario} onChange={onChange} />
        <FundsCard scenario={scenario} onChange={onChange} />
      </div>
      <h2>Accounts &amp; holdings</h2>
      {scenario.portfolio.accounts.map((account) => (
        <AccountCard key={account.id} scenario={scenario} onChange={onChange} accountId={account.id} />
      ))}
      <div className="card editor-card">
        <AddRow
          placeholder="New account name"
          buttonLabel="Add account"
          onAdd={(name) => onChange(addAccount(scenario, name, newAccountTaxType))}
        >
          <select
            aria-label="Tax type for new account"
            value={newAccountTaxType}
            onChange={(event) => setNewAccountTaxType(event.target.value as TaxType)}
          >
            {TAX_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </AddRow>
      </div>
    </section>
  );
}
