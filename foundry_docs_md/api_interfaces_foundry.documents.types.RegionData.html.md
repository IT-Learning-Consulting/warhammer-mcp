# RegionData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface RegionData {
  _id: null | string;
  behaviors?: RegionBehaviorData[];
  color?: string;
  elevation?: number;
  flags: DocumentFlags;
  locked?: boolean;
  name: string;
  shapes?: BaseShapeData[];
  visibility?: number;
}
```

## Properties

- **_id**: `null | string`  
  The Region _id which uniquely identifies it within its parent Scene.

  _Optional_

- **behaviors?**: `RegionBehaviorData[]`  
  A collection of embedded RegionBehavior objects.

  _Optional_

- **color?**: `string`  
  The color used to highlight the Region.

  _Optional_

- **elevation?**: `number`  
  The elevation.

  _Optional_

- **flags**: [`DocumentFlags`](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags.

- **locked?**: `boolean`  
  Whether this region is locked or not.

  _Optional_

- **name**: `string`  
  The name used to describe the Region.

- **shapes?**: [`BaseShapeData`](https://foundryvtt.com/api/classes/foundry.data.BaseShapeData.html)[]  
  The shapes that make up the Region.

  _Optional_

- **visibility?**: `number`  
  The region visibility.

  _Optional_
  
---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).