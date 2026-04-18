// Shared TypeScript types for Foundry MCP Integration

/**
 * MCP Query types
 */
export interface MCPQuery {
  method: string;
  data?: unknown;
}

export interface MCPResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Character/Actor types
 */
export interface CharacterInfo {
  id: string;
  name: string;
  type: string;
  img?: string;
  system: Record<string, unknown>;
  items: CharacterItem[];
  effects: CharacterEffect[];
}

export interface CharacterItem {
  id: string;
  name: string;
  type: string;
  img?: string;
  system: Record<string, unknown>;
}

export interface CharacterEffect {
  id: string;
  name: string;
  icon?: string;
  disabled: boolean;
  duration?: {
    type: string;
    duration?: number;
    remaining?: number;
  };
}

/**
 * Compendium types
 */
export interface CompendiumSearchResult {
  id: string;
  name: string;
  type: string;
  img?: string;
  pack: string;
  packLabel: string;
  system?: Record<string, unknown>;
}

export interface CompendiumPack {
  id: string;
  label: string;
  type: string;
  system: string;
  private: boolean;
}

/**
 * Scene types
 */
export interface SceneInfo {
  id: string;
  name: string;
  img?: string;
  background?: string;
  width: number;
  height: number;
  padding: number;
  active: boolean;
  navigation: boolean;
  tokens: SceneToken[];
  walls: number;
  lights: number;
  sounds: number;
  notes: SceneNote[];
}

export interface SceneToken {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  actorId?: string;
  img: string;
  hidden: boolean;
  disposition: number;
}

export interface SceneNote {
  id: string;
  text: string;
  x: number;
  y: number;
}

/**
 * Configuration types
 */
export interface FoundryMCPConfig {
  enabled: boolean;
  mcpHost: string;
  mcpPort: number;
  connectionTimeout: number;
  debugLogging: boolean;
}

export interface MCPServerConfig {
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  foundry: {
    host: string;
    port: number;
    namespace: string;
    reconnectAttempts: number;
    reconnectDelay: number;
  };
}

/**
 * World info types
 */
export interface WorldInfo {
  id: string;
  title: string;
  system: string;
  systemVersion: string;
  foundryVersion: string;
  users: WorldUser[];
}

export interface WorldUser {
  id: string;
  name: string;
  active: boolean;
  isGM: boolean;
}

/**
 * Bridge status types
 */
export interface BridgeStatus {
  isRunning: boolean;
  config: FoundryMCPConfig;
  timestamp: number;
}
