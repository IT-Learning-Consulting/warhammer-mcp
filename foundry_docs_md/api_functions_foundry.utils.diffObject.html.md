# diffObject | Foundry Virtual Tabletop - API Documentation - Version 13

### Function diffObject

```typescript
diffObject(
    original: object,
    other: object,
    options?: { _d?: number; deletionKeys?: boolean; inner?: boolean },
): object
```

Deeply difference an object against some other, returning the update keys and values.

#### Parameters

- **original**: `object`  
  An object comparing data against which to compare

- **other**: `object`  
  An object containing potentially different data

- **options**? : `{ _d?: number; deletionKeys?: boolean; inner?: boolean } = {}`  
  Additional options which configure the diff operation

  - **_d**? : `number`  
    An internal depth tracker

  - **deletionKeys**? : `boolean`  
    Apply special logic to deletion keys. They will only be kept if the original object has a  
    corresponding key that could be deleted.

  - **inner**? : `boolean`  
    Only recognize differences in `other` for keys which also exist in `original`

#### Returns

- `object`  
  An object of the data in `other` which differs from that in `original`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)