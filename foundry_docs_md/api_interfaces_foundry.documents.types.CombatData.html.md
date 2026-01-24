# CombatData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CombatData {
  _id: null | string;
  _stats: DocumentStats;
  active?: boolean;
  combatants: CombatantData[];
  flags: DocumentFlags;
  groups: CombatantGroupData[];
  round?: number;
  scene: string;
  sort?: number;
  system?: object;
  turn?: null | number;
  type: string;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this Combat document

- **_stats**: [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
  An object of creation and access information

- **active?**: `boolean` (optional)  
  Is the Combat encounter currently active?

- **combatants**: [CombatantData](https://foundryvtt.com/api/interfaces/foundry.documents.types.CombatantData.html)[]  
  A Collection of Combatant embedded Documents

- **flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags

- **groups**: [CombatantGroupData](https://foundryvtt.com/api/interfaces/foundry.documents.types.CombatantGroupData.html)[]  
  A Collection of Documents that represent a grouping of individual Combatants

- **round?**: `number` (optional)  
  The current round of the Combat encounter

- **scene**: `string`  
  The _id of a Scene within which this Combat occurs

- **sort?**: `number` (optional)  
  The current sort order of this Combat relative to others in the same Scene

- **system?**: `object` (optional)  
  Game system data which is defined by system data models

- **turn?**: `null | number` (optional)  
  The current turn in the Combat round

- **type**: `string`  
  The type of this Combat.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)