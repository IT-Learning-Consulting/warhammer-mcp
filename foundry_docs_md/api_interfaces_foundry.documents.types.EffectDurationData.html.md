# EffectDurationData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface EffectDurationData {
    combat?: string;
    rounds?: number;
    seconds?: number;
    startRound?: number;
    startTime?: number;
    startTurn?: number;
    turns?: number;
}
```

## Properties

- **combat?**: `string`  
  The _id of the CombatEncounter in which the effect first started

- **rounds?**: `number`  
  The maximum duration of the effect, in combat rounds

- **seconds?**: `number`  
  The maximum duration of the effect, in seconds

- **startRound?**: `number`  
  The round of the CombatEncounter in which the effect first started

- **startTime?**: `number`  
  The world time when the active effect first started

- **startTurn?**: `number`  
  The turn of the CombatEncounter in which the effect first started

- **turns?**: `number`  
  The maximum duration of the effect, in combat turns

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)