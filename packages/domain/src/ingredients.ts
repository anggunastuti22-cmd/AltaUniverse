/**
 * AltaLab ingredient pairing awareness (pure). See ADR-004.
 *
 * This derives, from the ingredient *classes* present in a routine, which
 * admin-curated educational notes apply. It is GENERIC education only: the same
 * for every user, never personalized to a skin profile, never a block, never
 * medical advice. The UI must present results as general education with a
 * non-medical disclaimer and must not prevent any action.
 */

/** Controlled ingredient classes — mirrors the DB `ingredient_class` enum. */
export type IngredientClass =
  | 'retinoid'
  | 'aha'
  | 'bha'
  | 'vitamin_c'
  | 'niacinamide'
  | 'benzoyl_peroxide'
  | 'peptide'
  | 'hydrator'
  | 'ceramide'
  | 'spf'
  | 'antioxidant'
  | 'exfoliant_physical'
  | 'other';

/** An admin-curated, generic educational note about an unordered class pair. */
export interface IngredientPairing {
  classA: IngredientClass;
  classB: IngredientClass;
  note: string;
  source?: string | null;
}

/**
 * The curated pairings whose *both* classes are present in the routine.
 *
 * Pure and order-independent: pair membership is by set, so a pairing stored as
 * (a, b) matches a routine containing a and b regardless of step order or how
 * many products carry each class. Each curated pairing is returned at most once.
 */
export function routinePairingNotes(
  classesPresent: Iterable<IngredientClass>,
  pairings: readonly IngredientPairing[],
): IngredientPairing[] {
  const present = new Set<IngredientClass>(classesPresent);
  return pairings.filter((p) => present.has(p.classA) && present.has(p.classB));
}

/** Distinct ingredient classes from a routine's products (drops null/duplicates). */
export function collectClasses(
  items: Iterable<{ class: IngredientClass | null | undefined }>,
): IngredientClass[] {
  const set = new Set<IngredientClass>();
  for (const it of items) {
    if (it.class) set.add(it.class);
  }
  return [...set];
}
