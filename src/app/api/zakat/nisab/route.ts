import { NextResponse } from "next/server";
import { getMetalPrices, pricePerGram } from "@/lib/zakat/service";

export const revalidate = 3600;

export async function GET() {
  const prices = await getMetalPrices();
  return NextResponse.json({
    ...prices,
    goldPerGram: pricePerGram(prices.goldPerOunce),
    silverPerGram: pricePerGram(prices.silverPerOunce),
  });
}
