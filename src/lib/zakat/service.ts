import rawSources from "@/data/sources.json";
import type { MetalPrice } from "@/types";

export const ZAKAT_SOURCES = rawSources.nisab;

export const GRAMS_PER_TROY_OUNCE = 31.1034768;
export const ZAKAT_RATE = 0.025;

/**
 * Commonly used nisab thresholds. Scholars and schools differ on whether the
 * gold or silver standard should be applied, so both are shown and the user
 * chooses.
 */
export const NISAB_THRESHOLDS = {
  gold: { grams: 85, label: "Gold standard — 85 g of gold" },
  silver: { grams: 595, label: "Silver standard — 595 g of silver" },
} as const;

export type NisabStandard = keyof typeof NISAB_THRESHOLDS;

export async function getMetalPrices(): Promise<MetalPrice> {
  const base = process.env.METALS_API_URL ?? "https://api.gold-api.com";
  const [gold, silver] = await Promise.all([
    fetch(`${base}/price/XAU`, { next: { revalidate: 3600 } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetch(`${base}/price/XAG`, { next: { revalidate: 3600 } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  const goldPerOunce = typeof gold?.price === "number" ? gold.price : null;
  const silverPerOunce = typeof silver?.price === "number" ? silver.price : null;

  return {
    goldPerOunce,
    silverPerOunce,
    currency: (gold?.currency as string) ?? "USD",
    retrievedAt: new Date().toISOString(),
    source: ZAKAT_SOURCES.name,
    available: goldPerOunce !== null && silverPerOunce !== null,
  };
}

export function pricePerGram(perOunce: number | null) {
  if (perOunce === null) return null;
  return perOunce / GRAMS_PER_TROY_OUNCE;
}

export type ZakatInput = {
  cash: number;
  goldGrams: number;
  goldValuePerGram?: number | null;
  silverGrams: number;
  silverValuePerGram?: number | null;
  investments: number;
  businessAssets: number;
  receivables: number;
  liabilities: number;
  standard: NisabStandard;
  goldPricePerGram?: number | null;
  silverPricePerGram?: number | null;
};

export type ZakatResult = {
  goldValue: number;
  silverValue: number;
  totalAssets: number;
  eligibleWealth: number;
  nisab: number;
  nisabGrams: number;
  meetsNisab: boolean;
  zakatDue: number;
  standard: NisabStandard;
};

export function calculateZakat(input: ZakatInput): ZakatResult {
  const goldValue =
    input.goldGrams *
    (input.goldValuePerGram ?? input.goldPricePerGram ?? 0);
  const silverValue =
    input.silverGrams *
    (input.silverValuePerGram ?? input.silverPricePerGram ?? 0);

  const totalAssets =
    input.cash + goldValue + silverValue + input.investments + input.businessAssets + input.receivables;
  const eligibleWealth = Math.max(totalAssets - input.liabilities, 0);

  const threshold = NISAB_THRESHOLDS[input.standard];
  const perGram =
    input.standard === "gold"
      ? (input.goldValuePerGram ?? input.goldPricePerGram ?? 0)
      : (input.silverValuePerGram ?? input.silverPricePerGram ?? 0);
  const nisab = threshold.grams * perGram;
  const meetsNisab = eligibleWealth >= nisab && nisab > 0;

  return {
    goldValue,
    silverValue,
    totalAssets,
    eligibleWealth,
    nisab,
    nisabGrams: threshold.grams,
    meetsNisab,
    zakatDue: meetsNisab ? eligibleWealth * ZAKAT_RATE : 0,
    standard: input.standard,
  };
}

export const ZAKAT_DISCLAIMER =
  "This calculator is provided for educational and informational purposes. Zakat rules can vary according to circumstances and scholarly interpretation. Consult a qualified scholar for personal guidance.";
