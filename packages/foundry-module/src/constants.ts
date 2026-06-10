// Constants for Warhammer MCP Module

/**
 * Module constants
 */
export const MODULE_ID = 'warhammer-mcp';
export const MODULE_TITLE = 'Warhammer MCP';

/**
 * Socket event names
 */
export const SOCKET_EVENTS = {
  MCP_QUERY: 'mcp-query',
  MCP_RESPONSE: 'mcp-response',
  BRIDGE_STATUS: 'bridge-status',
  PING: 'ping',
  PONG: 'pong',
} as const;

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  MCP_HOST: 'localhost',
  MCP_PORT: 31415,
  CONNECTION_TIMEOUT: 10,
  // BUG-282: was 999 — effectively unbounded per bridge instance, and the
  // heartbeat rebuilt the bridge (resetting the counter) every tick anyway.
  // 10 attempts ≈ 8.5 min of capped exponential back-off per instance; the
  // heartbeat-level restart budget (main.ts MAX_HEARTBEAT_RESTART_FAILURES)
  // bounds the outer loop.
  RECONNECT_ATTEMPTS: 10,
  RECONNECT_DELAY: 1000,
  LOG_LEVEL: 'info',
} as const;

/**
 * Connection states
 */
export const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
} as const;

/**
 * Token dispositions
 */
export const TOKEN_DISPOSITIONS = {
  HOSTILE: -1,
  NEUTRAL: 0,
  FRIENDLY: 1,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NOT_INITIALIZED: 'Data provider not initialized',
  NOT_CONNECTED: 'Not connected to Foundry VTT',
  CHARACTER_NOT_FOUND: 'Character not found',
  SCENE_NOT_FOUND: 'Scene not found',
  ACCESS_DENIED: 'Access denied - feature is disabled',
  QUERY_TIMEOUT: 'Query timeout',
  UNKNOWN_METHOD: 'Unknown method',
  BRIDGE_NOT_RUNNING: 'MCP Bridge is not running',
} as const;