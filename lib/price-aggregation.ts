export type ProduceMarketPriceRow = {
  market?: string;
  itemName?: string;
  origin?: string;
  grade?: string;
  sizeClass?: string;
  quantityTons: number;
  unitWeightKg: number;
  highPriceYen?: number | null;
  middlePriceYen?: number | null;
  lowPriceYen?: number | null;
  wholesaleValueYen?: number | null;
};

export type AggregatedProducePrice = {
  rows: number;
  pricedMiddleRows: number;
  quantityTons: number;
  middlePricePerKg: number;
  observedHighPricePerKg: number | null;
  observedLowPricePerKg: number | null;
};

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function toPricePerKg(priceYen: number | null | undefined, unitWeightKg: number) {
  if (!isPositiveNumber(priceYen) || !isPositiveNumber(unitWeightKg)) return null;
  return priceYen / unitWeightKg;
}

export function aggregateCurrentMarketRows(rows: ProduceMarketPriceRow[] | undefined) {
  if (!rows?.length) return null;

  let totalQuantity = 0;
  let weightedMiddleTotal = 0;
  let middleQuantity = 0;
  let pricedMiddleRows = 0;
  let observedHighPricePerKg: number | null = null;
  let observedLowPricePerKg: number | null = null;

  rows.forEach((row) => {
    if (!isPositiveNumber(row.quantityTons) || !isPositiveNumber(row.unitWeightKg)) return;

    totalQuantity += row.quantityTons;

    const middlePricePerKg = toPricePerKg(row.middlePriceYen, row.unitWeightKg);
    if (middlePricePerKg !== null) {
      weightedMiddleTotal += middlePricePerKg * row.quantityTons;
      middleQuantity += row.quantityTons;
      pricedMiddleRows += 1;
    }

    const highPricePerKg = toPricePerKg(row.highPriceYen, row.unitWeightKg);
    if (highPricePerKg !== null) {
      observedHighPricePerKg =
        observedHighPricePerKg === null ? highPricePerKg : Math.max(observedHighPricePerKg, highPricePerKg);
    }

    const lowPricePerKg = toPricePerKg(row.lowPriceYen, row.unitWeightKg);
    if (lowPricePerKg !== null) {
      observedLowPricePerKg =
        observedLowPricePerKg === null ? lowPricePerKg : Math.min(observedLowPricePerKg, lowPricePerKg);
    }

  });

  if (!isPositiveNumber(totalQuantity) || !isPositiveNumber(middleQuantity)) return null;

  return {
    rows: rows.length,
    pricedMiddleRows,
    quantityTons: totalQuantity,
    middlePricePerKg: weightedMiddleTotal / middleQuantity,
    observedHighPricePerKg,
    observedLowPricePerKg
  } satisfies AggregatedProducePrice;
}
