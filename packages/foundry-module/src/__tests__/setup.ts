// Foundry globals stub for vitest. Phase 3a substrate. Extend as handlers need more.
// Loaded via vitest.config.ts -> test.setupFiles.

(globalThis as any).game = {
  system: { id: 'wfrp4e' },
  user: { isGM: true, name: 'Test GM', id: 'test-user' },
  world: { id: 'test-world' },
  version: '13.0',
  settings: {
    get: (_m: string, _k: string) => true,
    set: async (_m: string, _k: string, _v: unknown) => {},
    register: () => {},
    registerMenu: () => {},
  },
  actors: new Map(),
  items: new Map(),
  scenes: new Map(),
  packs: new Map(),
  tables: new Map(),
  users: new Map(),
  journal: new Map(),
  socket: { on: () => {}, emit: () => {} },
};

(globalThis as any).CONFIG = { queries: {} };

(globalThis as any).Hooks = {
  once: () => {},
  on: () => {},
  off: () => {},
  call: () => {},
  callAll: () => {},
};

(globalThis as any).ui = {
  notifications: {
    info: () => {},
    warn: () => {},
    error: () => {},
  },
};

(globalThis as any).foundry = {
  utils: {
    randomID: () => 'test-id-' + Math.random().toString(36).slice(2),
    mergeObject: (a: any, b: any) => ({ ...a, ...b }),
    deepClone: (v: any) => JSON.parse(JSON.stringify(v)),
    flattenObject(obj: any): Record<string, any> {
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
          const nested = (globalThis as any).foundry.utils.flattenObject(v);
          for (const [nk, nv] of Object.entries(nested)) {
            result[`${k}.${nk}`] = nv;
          }
        } else {
          result[k] = v;
        }
      }
      return result;
    },
    getProperty(obj: any, path: string): any {
      return path.split('.').reduce((cursor: any, seg: string) => cursor?.[seg], obj);
    },
  },
  applications: {
    apps: {
      FilePicker: { implementation: { browse: async () => ({ files: [] }) } },
    },
  },
};

(globalThis as any).FormApplication = class FormApplication {
  static get defaultOptions() { return {}; }
};
(globalThis as any).Application = class Application {};
(globalThis as any).Dialog = class Dialog {};

(globalThis as any).Actor = class { static create = async () => ({}); };
(globalThis as any).Item = class { static create = async () => ({}); };
(globalThis as any).RollTable = class { static create = async () => ({}); };
(globalThis as any).canvas = { scene: null, tokens: { placeables: [] } };

// Foundry sometimes exposes fromUuid globally
(globalThis as any).fromUuid = async (_uuid: string) => null;
