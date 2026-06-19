import { describe, expect, it } from 'vitest';
import { routinePairingNotes, collectClasses, type IngredientPairing } from './ingredients';

const pairings: IngredientPairing[] = [
  { classA: 'retinoid', classB: 'aha', note: 'alternate days' },
  { classA: 'vitamin_c', classB: 'niacinamide', note: 'commonly discussed', source: 'x' },
  { classA: 'benzoyl_peroxide', classB: 'retinoid', note: 'apply at different times' },
];

describe('routinePairingNotes', () => {
  it('returns a pairing only when both classes are present', () => {
    const notes = routinePairingNotes(['retinoid', 'aha', 'spf'], pairings);
    expect(notes).toHaveLength(1);
    expect(notes[0]?.note).toBe('alternate days');
  });

  it('is order-independent and ignores extra classes', () => {
    const a = routinePairingNotes(['aha', 'retinoid'], pairings);
    const b = routinePairingNotes(['retinoid', 'aha'], pairings);
    expect(a).toEqual(b);
  });

  it('matches multiple pairings when several pairs are present', () => {
    const notes = routinePairingNotes(['retinoid', 'aha', 'benzoyl_peroxide'], pairings);
    expect(notes).toHaveLength(2);
  });

  it('returns nothing when only one side of a pair is present', () => {
    expect(routinePairingNotes(['retinoid', 'spf'], pairings)).toHaveLength(0);
  });

  it('returns nothing for an empty routine', () => {
    expect(routinePairingNotes([], pairings)).toHaveLength(0);
  });
});

describe('collectClasses', () => {
  it('dedupes and drops null/undefined classes', () => {
    const classes = collectClasses([
      { class: 'retinoid' },
      { class: 'retinoid' },
      { class: null },
      { class: undefined },
      { class: 'aha' },
    ]);
    expect(classes.sort()).toEqual(['aha', 'retinoid']);
  });
});
