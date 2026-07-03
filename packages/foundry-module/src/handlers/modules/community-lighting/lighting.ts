// DIALOG-PATH: DIALOG_FREE — grepped for Dialog/DialogV2/prompt/FilePicker/Hooks.once/window.confirm; no matches in this file. Module-API calls here are settings/document writes only.
// Module Integration v1 Phase 15 — module-lighting handler (CommunityLighting, conditional).
//
// Single read-only action: list-animations.
//   - requireModuleActive('CommunityLighting') is the FIRST executable statement — RETURNS failure, never throws.
//   - Reads CONFIG.Canvas.lightAnimations at call time (the module populates it at runtime, post-repair).
//   - Filters separator <optgroup> keys + the disabled (_DISABLED_ / "(DISABLED") entries.
//   - Author is parsed from the key prefix; keys are `${author}${light.name}` where light.name starts "CL: …"
//     (animationmanager.js:75,95) → e.g. "Blitz" + "CL: Fader" = "BlitzCL: Fader".
//   - customProperties is an ARRAY of param descriptors (lights.json). Real, per-animation params carry a
//     `varName` (e.g. "listeningBand"); the two universal entries the module pushes onto every animation
//     (speedDescription / intensityDescription via {default,type}) have NO varName and are excluded so
//     hasCustomProperties stays meaningful (dossier §3: Fader has no custom properties).
//   - Read-only: GM-gated for parity with other module reads; NO notify (CCR-3 — writes only).
//
// Anchors:
//   - dossier CommunityLighting.md §3 (animation inventory), §4 (data model), §5.1 (tool design + return shape).
//   - CCR-1 conditional guard; CCR-5 package-local schema.
//   - Runtime shape verified against E:\foundry_v13\data\Data\modules\CommunityLighting\modules\animationmanager.js
//     + lights.json (Phase 15 execution, research-loop discipline).

import { requireModuleActive } from '../_shared/require-module-active.js';
import { ModuleLightingInput } from './schemas.js';

type Envelope<T> = { success: true; data: T } | { success: false; error: string };

function isGM(): boolean {
  return Boolean((globalThis as any).game?.user?.isGM);
}

// Cosmetic <optgroup> delimiter keys CommunityLighting registers per author group — never animation types.
function isSeparatorKey(key: string): boolean {
  return key.includes('CommunityLightingSeparatorStart') || key.includes('CommunityLightingSeparatorEnd');
}

// The "Custom Shader Example" entry is disabled in lights.json (renamed _DISABLED_shaders / "(DISABLED")
function isDisabledKey(key: string): boolean {
  return key.includes('_DISABLED_') || key.includes('(DISABLED');
}

/**
 * Parse the author group from a CommunityLighting animation key.
 * Keys are `${author}${light.name}` and light.name starts with "CL:" — so the author is the
 * substring before the first "CL:" segment. "BlitzCL: Fader" → "Blitz";
 * "SecretFireCL: Star Light" → "SecretFire"; "Blitz-CommissionedCL: …" → "Blitz-Commissioned".
 * A key with no "CL:" segment is not a CommunityLighting entry → null.
 */
function parseAuthor(key: string): string | null {
  const idx = key.indexOf('CL:');
  if (idx <= 0) return null;
  return key.slice(0, idx);
}

/**
 * Extract the per-animation custom-property identifiers (`varName`) from a CONFIG entry.
 * Excludes the two universal description hints (no varName) the module pushes onto every animation.
 */
function extractCustomPropertyKeys(entry: any): string[] {
  const cp = entry?.customProperties;
  if (!Array.isArray(cp)) return [];
  const keys: string[] = [];
  for (const p of cp) {
    if (p && typeof p === 'object' && typeof p.varName === 'string' && p.varName.length > 0) {
      keys.push(p.varName);
    }
  }
  return keys;
}

interface AnimationEntry {
  key: string;
  label: string;
  author: string | null;
  hasCustomProperties: boolean;
  customPropertyKeys: string[];
}

function handleListAnimations(): Envelope<{ animations: AnimationEntry[]; count: number }> {
  if (!isGM()) return { success: false, error: 'GM_REQUIRED: listing light animations requires GM access' };
  try {
    const raw: Record<string, any> = (globalThis as any).CONFIG?.Canvas?.lightAnimations ?? {};
    const animations: AnimationEntry[] = Object.entries(raw)
      .filter(([key]) => !isSeparatorKey(key) && !isDisabledKey(key))
      // CommunityLighting entries only — they all carry a "…CL:" prefix (core/other animations don't).
      .filter(([key]) => parseAuthor(key) !== null)
      .map(([key, entry]) => {
        const customPropertyKeys = extractCustomPropertyKeys(entry);
        return {
          key,
          label: (entry?.label as string) ?? key,
          author: parseAuthor(key),
          hasCustomProperties: customPropertyKeys.length > 0,
          customPropertyKeys,
        };
      });
    return { success: true, data: { animations, count: animations.length } };
  } catch (e) {
    return { success: false, error: `LIGHTING_LIST_ERROR: ${e instanceof Error ? e.message : String(e)}` };
  }
}

// ── Public dispatcher ─────────────────────────────────────────────────────────

export async function dispatchModuleLighting(data: unknown): Promise<any> {
  const g = requireModuleActive('CommunityLighting');
  if (g) return g;

  const parsed = ModuleLightingInput.parse(data);

  switch (parsed.action) {
    case 'list-animations':
      return handleListAnimations();
    // Single-member union — plain default (NOT a `never` guard; see schemas.ts note).
    default:
      return { success: false, error: `Unknown module-lighting action: ${(parsed as any).action}` };
  }
}
