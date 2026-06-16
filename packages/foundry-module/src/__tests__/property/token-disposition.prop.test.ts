// fast-check property tests — getTokenDisposition + getWFRPCharacteristicCode invariants (Phase 0 R0.2)
//
// Sites: FoundryDataAccess.getTokenDisposition  (data-access.ts ~1715, private)
//         FoundryDataAccess.getWFRPCharacteristicCode (data-access.ts ~1529, private)
//
// Both are pure mapping / clamp helpers that never touch Foundry globals.
// We access them via (da as any).<method>() after stubbing validateFoundryState.
//
// Contract — getTokenDisposition:
//   1. NUMERIC INPUT: numeric values are returned as-is (no clamping by this function).
//   2. NON-NUMERIC INPUT: any non-number returns TOKEN_DISPOSITIONS.NEUTRAL (0).
//   3. OUTPUT IS ALWAYS A NUMBER (typeof === 'number').
//
// Contract — getWFRPCharacteristicCode:
//   1. OUTPUT IS IN THE KNOWN CODE SET {'ws','bs','s','t','i','ag','dex','int','wp','fel'}.
//   2. CASE/WHITESPACE INSENSITIVE for canonical names: "Weapon Skill" → 'ws', etc.
//   3. UNKNOWN INPUTS default to 'ws' (weapon skill fallback).
//   4. TOTALITY: never throws for any string input.

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { FoundryDataAccess } from '../../data-access.js';
// Phase 4 (R4.1): getWFRPCharacteristicCode moved to RollRequestService; pierce it there. getTokenDisposition
// stays on FoundryDataAccess.
import { RollRequestService } from '../../services/index.js';

// ---------------------------------------------------------------------------
// Test rig
// ---------------------------------------------------------------------------

function makeDA(): any {
  const da = new FoundryDataAccess();
  // Bypass the Foundry-state gate so pure methods are reachable.
  (da as any).validateFoundryState = () => {};
  return da;
}

const da = makeDA();
// getWFRPCharacteristicCode is private on RollRequestService; reach it via an `any` cast on the instance.
const charSvc: any = new RollRequestService(() => {});

// ---------------------------------------------------------------------------
// Known constants from constants.ts
// ---------------------------------------------------------------------------

const TOKEN_DISPOSITIONS = { HOSTILE: -1, NEUTRAL: 0, FRIENDLY: 1 } as const;

const VALID_CHAR_CODES = new Set(['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel']);

// Canonical WFRP characteristic names (exact matches the map handles).
const CANONICAL_CHAR_INPUTS: [string, string][] = [
  ['weapon skill', 'ws'],
  ['weaponskill', 'ws'],
  ['ws', 'ws'],
  ['ballistic skill', 'bs'],
  ['ballisticskill', 'bs'],
  ['bs', 'bs'],
  ['strength', 's'],
  ['s', 's'],
  ['toughness', 't'],
  ['t', 't'],
  ['initiative', 'i'],
  ['i', 'i'],
  ['agility', 'ag'],
  ['ag', 'ag'],
  ['dexterity', 'dex'],
  ['dex', 'dex'],
  ['intelligence', 'int'],
  ['int', 'int'],
  ['willpower', 'wp'],
  ['wp', 'wp'],
  ['fellowship', 'fel'],
  ['fel', 'fel'],
];

// ---------------------------------------------------------------------------
// getTokenDisposition properties
// ---------------------------------------------------------------------------

describe('getTokenDisposition — numeric passthrough', () => {
  it('any finite number is returned unchanged', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        const result: number = da.getTokenDisposition(n);
        return result === n;
      }),
      { numRuns: 2000 }
    );
  });

  it('any float is returned unchanged', () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true }), (n) => {
        const result: number = da.getTokenDisposition(n);
        return result === n;
      }),
      { numRuns: 1000 }
    );
  });
});

describe('getTokenDisposition — non-numeric defaults to NEUTRAL (0)', () => {
  it('string input returns 0 (NEUTRAL)', () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const result: number = da.getTokenDisposition(s);
        return result === TOKEN_DISPOSITIONS.NEUTRAL;
      }),
      { numRuns: 1000 }
    );
  });

  it('null/undefined/object input returns 0 (NEUTRAL)', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.constant({}),
          fc.constant([]),
          fc.constant(true),
          fc.constant(false),
        ),
        (v) => {
          const result: number = da.getTokenDisposition(v);
          return result === TOKEN_DISPOSITIONS.NEUTRAL;
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('getTokenDisposition — output is always a number', () => {
  it('any input produces typeof number', () => {
    fc.assert(
      fc.property(fc.anything(), (v) => {
        const result = da.getTokenDisposition(v);
        return typeof result === 'number';
      }),
      { numRuns: 2000 }
    );
  });
});

// ---------------------------------------------------------------------------
// getWFRPCharacteristicCode properties
// ---------------------------------------------------------------------------

describe('getWFRPCharacteristicCode — output in valid code set', () => {
  // BUG-377 fix: the hasOwnProperty guard means prototype-key inputs (constructor,
  // __proto__, toString, ...) now fall back to 'ws' like any other unknown input,
  // so this arbitrary covers ALL strings — no exclusion list needed.
  it('any string input produces a code in the known set', () => {
    fc.assert(
      fc.property(fc.string(), (charName) => {
        const code: unknown = charSvc.getWFRPCharacteristicCode(charName);
        return VALID_CHAR_CODES.has(code as string);
      }),
      { numRuns: 2000 }
    );
  });
});

describe('getWFRPCharacteristicCode — canonical names map correctly', () => {
  for (const [input, expected] of CANONICAL_CHAR_INPUTS) {
    it(`"${input}" → "${expected}"`, () => {
      fc.assert(
        fc.property(fc.constant(input), (name) => {
          return charSvc.getWFRPCharacteristicCode(name) === expected;
        }),
        { numRuns: 1 }
      );
    });
  }
});

describe('getWFRPCharacteristicCode — case and whitespace insensitivity', () => {
  it('mixed-case "Weapon Skill" resolves to ws', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('Weapon Skill', 'WEAPON SKILL', 'weapon skill', 'WeaponSkill'),
        (name) => charSvc.getWFRPCharacteristicCode(name) === 'ws'
      ),
      { numRuns: 4 }
    );
  });
});

describe('getWFRPCharacteristicCode — unknown input defaults to ws', () => {
  // BUG-377 fix: prototype-property names (constructor/toString/valueOf/__proto__/...)
  // no longer escape via Object.prototype — the hasOwnProperty guard makes them
  // unknown inputs that default to 'ws', so they need no special exclusion here.
  const unknownStr = fc
    .string({ minLength: 1 })
    .filter((s) => {
      const n = s.toLowerCase().replace(/\s+/g, '');
      // Exclude only the canonical char keys; everything else (incl. prototype names) → 'ws'.
      return !['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel',
        'weaponskill', 'ballisticskill', 'strength', 'toughness', 'initiative',
        'agility', 'dexterity', 'intelligence', 'willpower', 'fellowship',
      ].includes(n);
    });

  it('unrecognised string defaults to "ws"', () => {
    fc.assert(
      fc.property(unknownStr, (name) => charSvc.getWFRPCharacteristicCode(name) === 'ws'),
      { numRuns: 1000 }
    );
  });
});

describe('getWFRPCharacteristicCode — totality', () => {
  it('never throws for any string input', () => {
    fc.assert(
      fc.property(fc.string(), (charName) => {
        let threw = false;
        try {
          charSvc.getWFRPCharacteristicCode(charName);
        } catch {
          threw = true;
        }
        return !threw;
      }),
      { numRuns: 2000 }
    );
  });
});
