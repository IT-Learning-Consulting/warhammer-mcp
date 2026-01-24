# compatibility

**Variable** `compatibility` &mdash; *Const*

```typescript
compatibility: {
    excludePatterns: RegExp[];
    includePatterns: RegExp[];
    mode: number;
} = ...
```

Configure the verbosity of compatibility warnings generated throughout the software. The compatibility mode defines the logging level of any displayed warnings. The `includePatterns` and `excludePatterns` arrays provide a set of regular expressions which can either only include or specifically exclude certain file paths or warning messages. Exclusion rules take precedence over inclusion rules.

## Properties

- **excludePatterns**: `RegExp[]`  
- **includePatterns**: `RegExp[]`  
- **mode**: `number`  

## See

- [CONST.COMPATIBILITY_MODES](https://foundryvtt.com/api/variables/CONST.COMPATIBILITY_MODES.html)

## Examples

### Include Specific Errors

```typescript
const includeRgx = new RegExp("/systems/dnd5e/module/documents/active-effect.mjs");
CONFIG.compatibility.includePatterns.push(includeRgx);
```

### Exclude Specific Errors

```typescript
const excludeRgx = new RegExp("/systems/dnd5e/");
CONFIG.compatibility.excludePatterns.push(excludeRgx);
```

### Both Include and Exclude

```typescript
const includeRgx = new RegExp("/systems/dnd5e/module/actor/");
const excludeRgx = new RegExp("/systems/dnd5e/module/actor/sheets/base.js");
CONFIG.compatibility.includePatterns.push(includeRgx);
CONFIG.compatibility.excludePatterns.push(excludeRgx);
```

### Targeting More Than Filenames

```typescript
CONFIG.compatibility.excludePatterns.push(excludeRgx);

const includeRgx = new RegExp("applyActiveEffects");
CONFIG.compatibility.includePatterns.push(includeRgx);
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)