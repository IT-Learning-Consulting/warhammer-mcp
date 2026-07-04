// mcp_code_quality_v2 Phase C2 (task 5.4 — Q4/Q5) — shared text/list truncation helpers.
//
// truncateText: was 2 byte-identical private methods (tools/character.ts + tools/compendium.ts,
// 9 call sites). Ellipsis form (`maxLength - 3` + '...') preserved byte-for-byte.
//
// truncatedJoin: parameterizes the slice-cap + "+N more" suffix logic the 5 divergent
// list-truncation sites hand-rolled (compendium-umbrella keys-preview, filepicker dirs/files,
// scene clear-layer preview, item-piles item lines). Caps (10/25/50) AND the per-site phrasing
// stay per-site parameters — this centralizes only the mechanism, so rendered output is
// byte-identical (deliberate: not forced uniformity).

/** Truncate to maxLength characters, ellipsis-terminated. Empty/short text passes through. */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Join up to `cap` items with `separator`; when items overflow the cap, append `more(hidden)`
 * (the per-site "+N more" phrasing) to the joined string.
 */
export function truncatedJoin(
  items: string[],
  cap: number,
  separator: string,
  more: (hidden: number) => string,
): string {
  const shown = items.slice(0, cap).join(separator);
  return items.length > cap ? shown + more(items.length - cap) : shown;
}
