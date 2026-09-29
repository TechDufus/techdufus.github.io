/**
 * Drawing kit · provenance vocabulary (the honesty rule as a drawing convention).
 *
 * Mirrors `Provenance` in src/data/hardware/types.ts (same union, declared here so the kit has no
 * dependency on the data layer; the two are structurally identical and interchangeable).
 *
 * Every provenance has a one-letter mark and a mark style, so it survives black-and-white print:
 *   measured  M  solid gold tag, dark letter   read from the machine (with a date)
 *   vendor    V  outlined tag                  manufacturer document (with a source link)
 *   owner     O  outlined round tag            stated by TechDufus
 *   inferred  I  dashed tag                    reasoned (say how in the note)
 *   assumed   A  dashed tag, dim               placeholder until surveyed
 * CSS: .prov .prov--{kind} (HTML chip, ProvChip.astro) and .pm .pm--{kind} (SVG mark, ProvMark.astro).
 */

export type Provenance = 'measured' | 'vendor' | 'owner' | 'inferred' | 'assumed';

export const PROV: Record<Provenance, { letter: string; label: string; means: string }> = {
  measured: { letter: 'M', label: 'Measured', means: 'read from the machine' },
  vendor: { letter: 'V', label: 'Vendor', means: 'manufacturer document' },
  owner: { letter: 'O', label: 'Owner', means: 'stated by TechDufus' },
  inferred: { letter: 'I', label: 'Inferred', means: 'reasoned, not read' },
  assumed: { letter: 'A', label: 'Assumed', means: 'placeholder until surveyed' },
};

export const PROV_ORDER: Provenance[] = ['measured', 'vendor', 'owner', 'inferred', 'assumed'];

/** "Measured 2026-09-27", "Vendor", "Assumed": the accessible name of a mark. */
export function provText(prov: Provenance, asOf?: string): string {
  return asOf ? `${PROV[prov].label} ${asOf}` : PROV[prov].label;
}
