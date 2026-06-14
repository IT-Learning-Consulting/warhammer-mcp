// Module Integration v1 Phase 11 — module-party-resources mcp-server response interfaces.
//
// CCR-5: Zod input validation lives package-local on the foundry-module side. The mcp-server tool
// layer only needs typed response shapes for this.query<T> (DP-15 — never <any>).

export interface PartyResourceSnapshot {
  id: string;
  value: number;
  name: string;
  max: number;
  min: number;
  visible: boolean;
  playerManaged: boolean;
  icon: string;
  useIcon: boolean;
  notifyChat: boolean;
  position: number;
}

export interface PartyListResult {
  count: number;
  resources: PartyResourceSnapshot[];
}

export type PartyGetResult = PartyResourceSnapshot;

export interface PartySetValueResult {
  resourceId: string; // not a branded id (polymorphic / non-document)
  previousValue: number;
  value: number;
  notifyChat: boolean;
}

export interface PartyIncrementResult {
  resourceId: string; // not a branded id (polymorphic / non-document)
  previousValue: number;
  value: number;
  jump: number;
  max: number;
}

export interface PartyDecrementResult {
  resourceId: string; // not a branded id (polymorphic / non-document)
  previousValue: number;
  value: number;
  jump: number;
  min: number;
}

export interface PartyUpdateMetaResult {
  resourceId: string; // not a branded id (polymorphic / non-document)
  updatedFields: string[];
  snapshot: PartyResourceSnapshot;
}

export interface PartyCreateResult {
  resourceId: string; // not a branded id (polymorphic / non-document)
  snapshot: PartyResourceSnapshot;
}

export interface PartyDeleteResult {
  resourceId: string; // not a branded id (polymorphic / non-document)
  removed: boolean;
  remaining: number;
}
