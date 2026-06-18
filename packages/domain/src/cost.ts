/**
 * Derived value metrics (pure). Cost-per-wear and routine cost are never stored;
 * they are computed from owned items + usage so the value story stays honest.
 */

/** price ÷ wear count. Returns null when it cannot be computed (no price/wears). */
export function costPerWear(price: number | null, wearCount: number): number | null {
  if (price === null || price < 0) return null;
  if (wearCount <= 0) return null;
  return price / wearCount;
}
