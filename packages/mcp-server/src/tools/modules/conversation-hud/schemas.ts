// Module Integration v2 Phase 1 — module-conversation-hud mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

export interface ConvParticipantSummary {
  name: string | null;
  img: string | null;
}

export interface ConvCreateResult {
  journalId: string;
  uuid: string;
  name: string;
  participantCount: number;
  background: string;
  defaultActiveParticipant: number | null;
}

export interface ConvGetResult {
  journalId: string;
  uuid: string;
  name: string;
  background: string;
  defaultActiveParticipant: number | null;
  participants: ConvParticipantSummary[];
  participantCount: number;
  conversationData: unknown;
}

export interface ConvListEntry {
  journalId: string;
  uuid: string;
  name: string;
  participantCount: number;
  folder: string | null;
}

export interface ConvListResult {
  count: number;
  conversations: ConvListEntry[];
}

export interface ConvUpdateResult {
  journalId: string;
  name: string;
  participantCount: number;
  background: string;
}

export interface ConvDeleteResult {
  journalId: string;
  name: string | null;
  deleted: boolean;
}

export interface ConvActivateResult {
  journalId: string;
  name: string;
  active: boolean;
  visible: boolean;
  transient: boolean;
}

export interface ConvActiveStateResult {
  active: boolean;
  visible: boolean;
  participantCount: number;
  currentActiveParticipant: number | null;
  transient: boolean;
}

/** Generic transient runtime-control result (set-active-participant / add / update / reorder /
 * visibility / background / speaking-as / minimize / deactivate). All fields optional. */
export interface ConvRuntimeResult {
  transient: boolean;
  active?: boolean;
  index?: number;
  added?: number;
  participantCount?: number;
  oldIndex?: number;
  newIndex?: number;
  visible?: boolean | null;
  background?: string | null;
  toggled?: boolean;
  minimized?: boolean | null;
  locked?: boolean | null;
}

export interface ConvSceneResult {
  sceneId: string;
  journalId: string | null;
  visibilityOff?: boolean;
  cleared?: boolean;
}

export interface ConvTokenResult {
  tokenId: string;
  journalId: string | null;
  excludeFromPull: boolean | null;
}

export interface ConvFactionResult {
  journalId: string;
  uuid?: string;
  name: string;
  faction: unknown;
}

export interface ConvFactionListEntry {
  journalId: string;
  uuid: string;
  name: string;
  folder: string | null;
}

export interface ConvFactionListResult {
  count: number;
  factions: ConvFactionListEntry[];
}
