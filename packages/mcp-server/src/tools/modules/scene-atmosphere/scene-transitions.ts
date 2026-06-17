// Phase 8 (R8.4): scene-transitions sub-family of module-scene-atmosphere — result interfaces + formatters
// extracted VERBATIM from scene-atmosphere.ts (no logic change; the split is purely to land
// each file <=600 lines). Imported back by the main tool's formatResult trampoline.
import { SceneId } from '@foundry-mcp/shared';

// ── Phase 4B: scene-transitions result shapes ─────────────────────────────────

export interface TransitionOptions {
  action?: string;
  name?: string;
  content?: string;
  [key: string]: unknown;
}

export interface PlayTransitionResult {
  played: boolean;
  showMe: boolean;
  options: TransitionOptions;
  note: string;
}

export interface EndTransitionResult {
  ended: boolean;
  note: string;
}

export interface SetSceneTransitionResult {
  subAction: string;
  sceneId?: SceneId | null;
  sceneName?: string | null;
  savedOptions?: TransitionOptions;
  // per-scene: verifiedHasOptions; world-default: verified
  verifiedHasOptions?: boolean;
  verified?: boolean;
  // show-journal branch
  showJournal?: boolean;
  note?: string;
}

export interface GetSceneTransitionResult {
  subAction: string;
  sceneId?: SceneId | null;
  sceneName?: string | null;
  // per-scene branch
  hasTransition?: boolean;
  transition?: unknown;
  // world-default branch
  hasDefault?: boolean;
  defaultOptions?: unknown;
  note?: string;
}

export interface DeleteSceneTransitionResult {
  sceneId: SceneId;
  sceneName: string;
  hadTransition: boolean;
  deleted: boolean;
  verifiedDeleted: boolean;
  note: string;
}

export type SceneTransitionsResult =
  | PlayTransitionResult
  | EndTransitionResult
  | SetSceneTransitionResult
  | GetSceneTransitionResult
  | DeleteSceneTransitionResult;


// ── Phase 4B: scene-transitions formatters (F03 — emit EVERY returned field) ──

export function formatPlayTransition(r: PlayTransitionResult): string {
  const actionLabel = r.options?.action ? ` action=${r.options.action}` : '';
  const nameLabel = r.options?.name ? ` "${r.options.name}"` : '';
  const rawContent = typeof r.options?.content === 'string' ? r.options.content : null;
  const contentSnippet = rawContent
    ? rawContent.slice(0, 60).replace(/<[^>]+>/g, '').trim()
    : null;
  const snippet = contentSnippet ? `\nContent: ${contentSnippet}` : '';
  return [
    `scene-transitions: play-transition OK${actionLabel}${nameLabel} (played=${r.played}, showMe=${r.showMe}).${snippet}`,
    `Note: ${r.note}`,
  ].join('\n');
}

export function formatEndTransition(r: EndTransitionResult): string {
  return [`scene-transitions: end-transition OK (ended=${r.ended}).`, `Note: ${r.note}`].join('\n');
}

export function formatSetSceneTransition(r: SetSceneTransitionResult): string {
  const sceneLabel = r.sceneId ? ` on "${r.sceneName}" (${r.sceneId})` : '';
  const lines: string[] = [
    `scene-transitions: set-scene-transition OK (subAction=${r.subAction})${sceneLabel}.`,
  ];
  if (r.savedOptions !== undefined) {
    lines.push(`Saved options: ${JSON.stringify(r.savedOptions)}`);
  }
  if (r.verifiedHasOptions !== undefined) {
    lines.push(`Verified has options: ${r.verifiedHasOptions}`);
  } else if (r.verified !== undefined) {
    lines.push(`Verified: ${r.verified}`);
  }
  if (r.showJournal !== undefined) {
    lines.push(`showJournal: ${r.showJournal}`);
  }
  if (r.note) {
    lines.push(`Note: ${r.note}`);
  }
  return lines.join('\n');
}

export function formatGetSceneTransition(r: GetSceneTransitionResult): string {
  const sceneLabel = r.sceneId ? ` from "${r.sceneName}" (${r.sceneId})` : '';
  if (r.subAction === 'per-scene') {
    if (!r.hasTransition) {
      return `scene-transitions: get-scene-transition (subAction=${r.subAction})${sceneLabel}: not set.`;
    }
    return [
      `scene-transitions: get-scene-transition (subAction=${r.subAction})${sceneLabel}: found.`,
      `Transition: ${JSON.stringify(r.transition)}`,
    ].join('\n');
  }
  // world-default branch
  if (!r.hasDefault) {
    return `scene-transitions: get-scene-transition (subAction=${r.subAction}): no world default set.`;
  }
  return [
    `scene-transitions: get-scene-transition (subAction=${r.subAction}): world default found.`,
    `Default options: ${JSON.stringify(r.defaultOptions)}`,
  ].join('\n');
}

export function formatDeleteSceneTransition(r: DeleteSceneTransitionResult): string {
  return [
    `scene-transitions: delete-scene-transition OK — "${r.sceneName}" (${r.sceneId}).`,
    `Had transition: ${r.hadTransition} | Deleted: ${r.deleted} | Verified deleted: ${r.verifiedDeleted}`,
    `Note: ${r.note}`,
  ].join('\n');
}

