"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, ChipLink } from "@/components/ui/button";
import { ErrorState, Field, Note, inputClass } from "@/components/ui/primitives";
import { RefreshIcon } from "@/components/ui/icons";
import { ZAKAT_DISCLAIMER, calculateZakat, type NisabStandard } from "@/lib/zakat/service";
import { cn } from "@/lib/utils/cn";

type Prices = {
  goldPerGram: number | null;
  silverPerGram: number | null;
  currency: string;
  retrievedAt: string;
  source: string;
  available: boolean;
};

const CURRENCY = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function money(value: number) {
  return Number.isFinite(value) ? CURRENCY.format(value) : "—";
}

type FieldKey =
  | "cash"
  | "goldGrams"
  | "silverGrams"
  | "investments"
  | "businessAssets"
  | "receivables"
  | "liabilities";

export function ZakatCalculator() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    cash: "",
    goldGrams: "",
    silverGrams: "",
    investments: "",
    businessAssets: "",
    receivables: "",
    liabilities: "",
  });
  const [standard, setStandard] = useState<NisabStandard>("silver");
  const [prices, setPrices] = useState<Prices | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [manualGold, setManualGold] = useState("");
  const [manualSilver, setManualSilver] = useState("");

  const loadPrices = () => {
    setStatus("loading");
    fetch("/api/zakat/nisab")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("failed"))))
      .then((payload: Prices) => {
        setPrices(payload);
        setStatus(payload.available ? "ready" : "error");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(loadPrices, []);

  const goldPerGram = manualGold
    ? Number(manualGold)
    : (prices?.goldPerGram ?? null);
  const silverPerGram = manualSilver
    ? Number(manualSilver)
    : (prices?.silverPerGram ?? null);

  const numberValue = (key: FieldKey) => {
    const raw = values[key].replace(/,/g, "").trim();
    const parsed = Number(raw);
    return raw === "" || Number.isNaN(parsed) ? 0 : parsed;
  };

  const result = useMemo(
    () =>
      calculateZakat({
        cash: numberValue("cash"),
        goldGrams: numberValue("goldGrams"),
        goldValuePerGram: goldPerGram,
        silverGrams: numberValue("silverGrams"),
        silverValuePerGram: silverPerGram,
        investments: numberValue("investments"),
        businessAssets: numberValue("businessAssets"),
        receivables: numberValue("receivables"),
        liabilities: numberValue("liabilities"),
        standard,
        goldPricePerGram: goldPerGram,
        silverPricePerGram: silverPerGram,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, goldPerGram, silverPerGram, standard],
  );

  const set = (key: FieldKey) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const filled = Object.values(values).some((value) => value.trim() !== "");

  return (
    <div className="space-y-8">
      {status === "loading" ? (
        <div className="surface rounded-[14px] p-5" aria-busy="true">
          <p className="text-[0.875rem] text-mute">Loading current gold and silver prices…</p>
          <div className="skeleton mt-3 h-4 w-64" />
        </div>
      ) : status === "error" ? (
        <ErrorState
          title="We couldn't load metal prices"
          description="Live prices are unavailable, so no nisab value can be shown. You can enter the gold and silver values you use below, or retry."
          onRetry={loadPrices}
        />
      ) : (
        <div className="surface flex flex-wrap items-center justify-between gap-4 rounded-[14px] p-5">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold">
              Nisab reference prices
            </p>
            <p className="mt-2 text-[0.9375rem]">
              Gold {goldPerGram !== null ? `${money(goldPerGram)} / g` : "—"} · Silver{" "}
              {silverPerGram !== null ? `${money(silverPerGram)} / g` : "—"}
            </p>
            <p className="mt-1 text-[0.75rem] text-mute">
              Spot prices from {prices?.source ?? "the configured source"}, retrieved{" "}
              {(prices?.retrievedAt ?? new Date().toISOString()).slice(0, 10)}. Convert to your own
              currency before you decide.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadPrices}>
            <RefreshIcon width={16} height={16} />
            Refresh
          </Button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface rounded-[14px] p-5 sm:p-6">
          <h2 className="font-display text-lg">Assets</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Cash in hand and bank" htmlFor="cash" hint="All accessible money">
              <input
                id="cash"
                inputMode="decimal"
                value={values.cash}
                onChange={set("cash")}
                className={inputClass}
                placeholder="0"
              />
            </Field>
            <Field label="Gold" htmlFor="goldGrams" hint="Weight in grams">
              <input
                id="goldGrams"
                inputMode="decimal"
                value={values.goldGrams}
                onChange={set("goldGrams")}
                className={inputClass}
                placeholder="0"
              />
            </Field>
            <Field label="Silver" htmlFor="silverGrams" hint="Weight in grams">
              <input
                id="silverGrams"
                inputMode="decimal"
                value={values.silverGrams}
                onChange={set("silverGrams")}
                className={inputClass}
                placeholder="0"
              />
            </Field>
            <Field label="Investments" htmlFor="investments" hint="Shares, funds, pensions due">
              <input
                id="investments"
                inputMode="decimal"
                value={values.investments}
                onChange={set("investments")}
                className={inputClass}
                placeholder="0"
              />
            </Field>
            <Field label="Business assets" htmlFor="businessAssets" hint="Stock and trading goods">
              <input
                id="businessAssets"
                inputMode="decimal"
                value={values.businessAssets}
                onChange={set("businessAssets")}
                className={inputClass}
                placeholder="0"
              />
            </Field>
            <Field label="Money owed to you" htmlFor="receivables" hint="Recoverable loans">
              <input
                id="receivables"
                inputMode="decimal"
                value={values.receivables}
                onChange={set("receivables")}
                className={inputClass}
                placeholder="0"
              />
            </Field>
          </div>

          <h2 className="mt-8 font-display text-lg">Liabilities</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Debts and immediate obligations"
              htmlFor="liabilities"
              hint="Deducted from your assets"
            >
              <input
                id="liabilities"
                inputMode="decimal"
                value={values.liabilities}
                onChange={set("liabilities")}
                className={inputClass}
                placeholder="0"
              />
            </Field>
          </div>

          <h2 className="mt-8 font-display text-lg">Nisab standard</h2>
          <p className="mt-1.5 text-[0.875rem] leading-relaxed text-mute">
            Scholars differ on whether the gold or the silver threshold should be used. NoorHub shows
            both and follows your choice.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ChipLink
              href="#zakat-standard"
              active={standard === "gold"}
              className="pointer-events-none"
            >
              Gold · 85 g
            </ChipLink>
            <ChipLink
              href="#zakat-standard"
              active={standard === "silver"}
              className="pointer-events-none"
            >
              Silver · 595 g
            </ChipLink>
          </div>
          <div className="mt-3">
            <Segmented
              label="Nisab standard"
              value={standard}
              onChange={setStandard}
              options={[
                { value: "gold", label: "Use gold standard" },
                { value: "silver", label: "Use silver standard" },
              ]}
            />
          </div>
          <a id="zakat-standard" className="sr-only">
            Nisab standard
          </a>

          {status === "error" ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Field
                label="Gold value per gram"
                htmlFor="manualGold"
                hint="Enter the value you use"
              >
                <input
                  id="manualGold"
                  inputMode="decimal"
                  value={manualGold}
                  onChange={(event) => setManualGold(event.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </Field>
              <Field
                label="Silver value per gram"
                htmlFor="manualSilver"
                hint="Enter the value you use"
              >
                <input
                  id="manualSilver"
                  inputMode="decimal"
                  value={manualSilver}
                  onChange={(event) => setManualSilver(event.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </Field>
            </div>
          ) : null}

          <div className="mt-8">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setValues({
                  cash: "",
                  goldGrams: "",
                  silverGrams: "",
                  investments: "",
                  businessAssets: "",
                  receivables: "",
                  liabilities: "",
                })
              }
            >
              Clear the form
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface rounded-[14px] p-5 sm:p-6">
            <h2 className="font-display text-lg">Estimate</h2>
            {!filled ? (
              <p className="mt-3 text-[0.875rem] leading-relaxed text-mute">
                Enter your figures to see a calculation. Nothing is sent anywhere — the sums run in
                your browser.
              </p>
            ) : (
              <dl className="mt-4 space-y-3 text-[0.9375rem]">
                <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--line)] pb-2">
                  <dt className="text-mute">Gold value</dt>
                  <dd className="tabular-nums">{money(result.goldValue)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--line)] pb-2">
                  <dt className="text-mute">Silver value</dt>
                  <dd className="tabular-nums">{money(result.silverValue)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--line)] pb-2">
                  <dt className="text-mute">Total assets</dt>
                  <dd className="tabular-nums">{money(result.totalAssets)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--line)] pb-2">
                  <dt className="text-mute">Eligible wealth</dt>
                  <dd className="tabular-nums">{money(result.eligibleWealth)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--line)] pb-2">
                  <dt className="text-mute">
                    Nisab ({result.nisabGrams} g {result.standard})
                  </dt>
                  <dd className="tabular-nums">{money(result.nisab)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 pt-1">
                  <dt className="font-display text-[1.0625rem]">Estimated zakat</dt>
                  <dd className="font-display text-[1.375rem] tabular-nums">
                    {result.meetsNisab ? money(result.zakatDue) : "Below nisab"}
                  </dd>
                </div>
              </dl>
            )}
            <p
              className={cn(
                "mt-4 text-[0.75rem] leading-relaxed text-mute",
                result.meetsNisab && filled ? "text-emerald-ink dark:text-sage-soft" : "",
              )}
            >
              {filled
                ? result.meetsNisab
                  ? "Calculated at 2.5% of eligible wealth."
                  : "Your eligible wealth is below the chosen nisab threshold."
                : ""}
            </p>
          </div>

          <Note tone="gold">{ZAKAT_DISCLAIMER}</Note>

          <Note>
            NoorHub does not hard-code metal prices. Values come from the configured price source and
            are shown with the date they were retrieved. Convert to your local currency before
            relying on the figure.
          </Note>
        </div>
      </div>
    </div>
  );
}

function Segmented({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: NisabStandard;
  onChange: (value: NisabStandard) => void;
  options: Array<{ value: NisabStandard; label: string }>;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-full border border-[color:var(--line)] bg-[color:var(--surface-sunken)] p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
            value === option.value
              ? "bg-[color:var(--surface-raised)] text-emerald-ink shadow-sm dark:text-sage-soft"
              : "text-mute hover:text-[color:var(--fg)]",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
