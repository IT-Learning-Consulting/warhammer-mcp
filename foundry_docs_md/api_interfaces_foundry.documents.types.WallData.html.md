# WallData

```typescript
interface WallData {
    _id: null | string;
    c: number[];
    dir?: number;
    door?: number;
    doorSound?: string;
    ds?: number;
    flags: DocumentFlags;
    light?: number;
    move?: number;
    sight?: number;
    sound?: number;
    threshold: WallThresholdData;
}
```

## Properties

### _id

**Type:** `null | string`

The _id which uniquely identifies the embedded Wall document.

### c

**Type:** `number[]`

The wall coordinates, a length-4 array of finite numbers `[x0, y0, x1, y1]`.

### dir (Optional)

**Type:** `number`

The direction of effect imposed by this wall.

### door (Optional)

**Type:** `number`

The type of door which this wall contains, if any.

### doorSound (Optional)

**Type:** `string`

The type of door sound to play, if any.

### ds (Optional)

**Type:** `number`

The state of the door this wall contains, if any.

### flags

**Type:** [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)

An object of optional key/value flags.

### light (Optional)

**Type:** `number`

The illumination restriction type of this wall.

### move (Optional)

**Type:** `number`

The movement restriction type of this wall.

### sight (Optional)

**Type:** `number`

The visual restriction type of this wall.

### sound (Optional)

**Type:** `number`

The auditory restriction type of this wall.

### threshold

**Type:** [WallThresholdData](https://foundryvtt.com/api/interfaces/foundry.documents.types.WallThresholdData.html)

Configuration of threshold data for this wall.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)