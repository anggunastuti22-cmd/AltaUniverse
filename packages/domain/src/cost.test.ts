import { describe, expect, it } from 'vitest';
import { costPerWear } from './cost';

describe('costPerWear', () => {
  it('computes price ÷ wears', () => {
    expect(costPerWear(220, 11)).toBeCloseTo(20);
    expect(costPerWear(90, 100)).toBeCloseTo(0.9);
  });

  it('returns null when not computable', () => {
    expect(costPerWear(null, 5)).toBeNull();
    expect(costPerWear(100, 0)).toBeNull();
    expect(costPerWear(-5, 5)).toBeNull();
  });
});
