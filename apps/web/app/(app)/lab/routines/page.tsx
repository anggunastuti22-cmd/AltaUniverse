import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import {
  costPerWear,
  routinePairingNotes,
  collectClasses,
  type IngredientClass,
  type IngredientPairing,
} from '@alta/domain';
import { createClient } from '@/lib/supabase/server';
import { card, fieldStyle, label as labelStyle, muted, page, primaryBtn, formatMoney } from '../ui';
import { addRoutineStep, createRoutine } from '../actions';

export default async function RoutinesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: routines }, { data: steps }, { data: products }, { data: pairings }] =
    await Promise.all([
      supabase.from('lab_routines').select('id, time_of_day, name').order('time_of_day'),
      supabase
        .from('lab_routine_steps')
        .select('routine_id, user_product_id, step_order, instruction')
        .order('step_order'),
      supabase
        .from('lab_user_products')
        .select('id, custom_name, product_id, price_paid, est_uses, currency'),
      // Generic, admin-curated educational notes (RLS returns published only).
      supabase.from('lab_ingredient_pairings').select('class_a, class_b, note, source'),
    ]);

  const product = new Map((products ?? []).map((p) => [p.id, p]));
  const byRoutine = new Map<string, typeof steps>();
  for (const s of steps ?? []) {
    const arr = byRoutine.get(s.routine_id) ?? [];
    arr.push(s);
    byRoutine.set(s.routine_id, arr);
  }

  // Map each cabinet product to the ingredient classes of its catalogue product,
  // so routines can surface generic pairing education (ADR-004). Two flat
  // queries joined in JS (avoids relying on nested-select relationship typing).
  const catalogueIds = [
    ...new Set((products ?? []).map((p) => p.product_id).filter((id): id is string => id !== null)),
  ];
  const classByUserProduct = new Map<string, IngredientClass[]>();
  if (catalogueIds.length > 0) {
    const [{ data: links }, { data: ingredients }] = await Promise.all([
      supabase
        .from('lab_product_ingredients')
        .select('product_id, ingredient_id')
        .in('product_id', catalogueIds),
      supabase.from('lab_ingredients').select('id, class'),
    ]);
    const classById = new Map((ingredients ?? []).map((i) => [i.id, i.class]));
    const classesByCatalogue = new Map<string, IngredientClass[]>();
    for (const l of links ?? []) {
      const cls = classById.get(l.ingredient_id);
      if (!cls) continue;
      const arr = classesByCatalogue.get(l.product_id) ?? [];
      arr.push(cls as IngredientClass);
      classesByCatalogue.set(l.product_id, arr);
    }
    for (const p of products ?? []) {
      if (p.product_id) classByUserProduct.set(p.id, classesByCatalogue.get(p.product_id) ?? []);
    }
  }
  const pairingList: IngredientPairing[] = (pairings ?? []).map((p) => ({
    classA: p.class_a as IngredientClass,
    classB: p.class_b as IngredientClass,
    note: p.note,
    source: p.source,
  }));

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Routines</h1>
      <p style={muted}>
        Build a morning and evening routine from your cabinet. See its cost per use.
      </p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'required' ? 'Please complete the form.' : sp.error}
        </p>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: space.md,
        }}
      >
        <form action={createRoutine} style={{ ...card, display: 'grid', gap: space.md }}>
          <h2 style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600 }}>New routine</h2>
          <div>
            <label style={labelStyle} htmlFor="time_of_day">
              Time of day
            </label>
            <select id="time_of_day" name="time_of_day" style={fieldStyle} defaultValue="am">
              <option value="am">Morning</option>
              <option value="pm">Evening</option>
            </select>
          </div>
          <div>
            <label style={labelStyle} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              maxLength={120}
              style={fieldStyle}
              placeholder="Morning basics"
            />
          </div>
          <button type="submit" style={primaryBtn}>
            Create routine
          </button>
        </form>

        <form action={addRoutineStep} style={{ ...card, display: 'grid', gap: space.md }}>
          <h2 style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600 }}>Add a step</h2>
          <div>
            <label style={labelStyle} htmlFor="routine_id">
              Routine
            </label>
            <select id="routine_id" name="routine_id" required style={fieldStyle} defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              {(routines ?? []).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.time_of_day.toUpperCase()} · {r.name}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: space.sm,
            }}
          >
            <div>
              <label style={labelStyle} htmlFor="user_product_id">
                Product
              </label>
              <select
                id="user_product_id"
                name="user_product_id"
                style={fieldStyle}
                defaultValue=""
              >
                <option value="">—</option>
                {(products ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.custom_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle} htmlFor="step_order">
                Order
              </label>
              <input
                id="step_order"
                name="step_order"
                type="number"
                min="1"
                defaultValue={1}
                style={fieldStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle} htmlFor="instruction">
              Instruction (optional)
            </label>
            <input
              id="instruction"
              name="instruction"
              style={fieldStyle}
              placeholder="Cleanse gently"
            />
          </div>
          <button type="submit" style={primaryBtn}>
            Add step
          </button>
        </form>
      </div>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.md }}>
        {(routines ?? []).length === 0 ? (
          <p style={muted}>No routines yet.</p>
        ) : (
          (routines ?? []).map((r) => {
            const rsteps = byRoutine.get(r.id) ?? [];
            let cost = 0;
            let currency = 'USD';
            for (const s of rsteps) {
              const p = s.user_product_id ? product.get(s.user_product_id) : undefined;
              if (p) {
                const c = costPerWear(p.price_paid, p.est_uses ?? 0);
                if (c !== null) {
                  cost += c;
                  currency = p.currency;
                }
              }
            }
            const classes = collectClasses(
              rsteps
                .map((s) => (s.user_product_id ? classByUserProduct.get(s.user_product_id) : null))
                .filter((c): c is IngredientClass[] => c != null)
                .flatMap((arr) => arr.map((c) => ({ class: c }))),
            );
            const notes = routinePairingNotes(classes, pairingList);
            return (
              <div key={r.id} style={{ ...card, borderLeft: `3px solid ${color.lab}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: space.sm }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: 'var(--alta-font-family-display)',
                      fontSize: fontSize.lg,
                    }}
                  >
                    {r.time_of_day.toUpperCase()} · {r.name}
                  </h2>
                  <span style={{ ...muted, fontSize: fontSize.sm }}>
                    {formatMoney(cost, currency)}/use
                  </span>
                </div>
                <ol
                  style={{ margin: `${space.sm}px 0 0`, paddingLeft: space.lg, color: color.text }}
                >
                  {rsteps.length === 0 ? (
                    <span style={muted}>No steps yet.</span>
                  ) : (
                    rsteps.map((s, i) => (
                      <li key={i}>
                        {s.user_product_id
                          ? (product.get(s.user_product_id)?.custom_name ?? 'Product')
                          : 'Step'}
                        {s.instruction ? <span style={muted}> — {s.instruction}</span> : null}
                      </li>
                    ))
                  )}
                </ol>
                {notes.length > 0 ? (
                  <div
                    style={{
                      marginTop: space.md,
                      padding: space.md,
                      borderRadius: 8,
                      backgroundColor: color.labSoft,
                      border: `1px solid ${color.border}`,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: fontSize.xs,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: color.labText,
                      }}
                    >
                      General education — not medical advice
                    </p>
                    <ul style={{ margin: `${space.xs}px 0 0`, paddingLeft: space.lg }}>
                      {notes.map((n, i) => (
                        <li key={i} style={{ fontSize: fontSize.sm, color: color.text }}>
                          {n.note}
                          {n.source ? <span style={muted}> ({n.source})</span> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
