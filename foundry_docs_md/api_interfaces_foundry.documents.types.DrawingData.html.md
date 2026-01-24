# DrawingData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DrawingData {
    _id: null | string;
    author: string;
    bezierFactor?: number;
    elevation?: number;
    fillAlpha?: number;
    fillColor?: string;
    fillType?: number;
    flags: DocumentFlags;
    fontFamily?: string;
    fontSize?: number;
    hidden?: boolean;
    locked?: boolean;
    rotation?: number;
    shape: ShapeData;
    sort?: number;
    strokeAlpha?: number;
    strokeColor?: number;
    strokeWidth?: number;
    text?: string;
    textAlpha?: number;
    textColor?: string;
    texture?: string;
    x: number;
    y: number;
}
```

## Properties

### _id

- **Type:** `null | string`  
- **Description:** The _id which uniquely identifies this BaseDrawing embedded document

### author

- **Type:** `string`  
- **Description:** The _id of the user who created the drawing

### bezierFactor (optional)

- **Type:** `number`  
- **Description:** An amount of bezier smoothing applied, between 0 and 1

### elevation (optional)

- **Type:** `number`  
- **Description:** The elevation of the drawing

### fillAlpha (optional)

- **Type:** `number`  
- **Description:** The opacity of the fill applied to the drawing geometry

### fillColor (optional)

- **Type:** `string`  
- **Description:** An optional color string with which to fill the drawing geometry

### fillType (optional)

- **Type:** `number`  
- **Description:** The fill type of the drawing shape, a value from [CONST.DRAWING_FILL_TYPES](https://foundryvtt.com/api/const.html)

### flags

- **Type:** [`DocumentFlags`](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
- **Description:** An object of optional key/value flags

### fontFamily (optional)

- **Type:** `string`  
- **Description:** The font family used to display text within this drawing, defaults to `CONFIG.defaultFontFamily`

### fontSize (optional)

- **Type:** `number`  
- **Description:** The font size used to display text within this drawing

### hidden (optional)

- **Type:** `boolean`  
- **Description:** Is the drawing currently hidden?

### locked (optional)

- **Type:** `boolean`  
- **Description:** Is the drawing currently locked?

### rotation (optional)

- **Type:** `number`  
- **Description:** The angle of rotation for the drawing figure

### shape

- **Type:** [`ShapeData`](https://foundryvtt.com/api/classes/foundry.data.ShapeData.html)  
- **Description:** The geometric shape of the drawing

### sort (optional)

- **Type:** `number`  
- **Description:** The z-index of this drawing relative to other siblings

### strokeAlpha (optional)

- **Type:** `number`  
- **Description:** The opacity of the boundary lines of the drawing geometry

### strokeColor (optional)

- **Type:** `number`  
- **Description:** The color of the boundary lines of the drawing geometry

### strokeWidth (optional)

- **Type:** `number`  
- **Description:** The width in pixels of the boundary lines of the drawing geometry

### text (optional)

- **Type:** `string`  
- **Description:** Optional text which is displayed overtop of the drawing

### textAlpha (optional)

- **Type:** `number`  
- **Description:** The opacity of text displayed within this drawing

### textColor (optional)

- **Type:** `string`  
- **Description:** The color of text displayed within this drawing

### texture (optional)

- **Type:** `string`  
- **Description:** The path to a tiling image texture used to fill the drawing geometry

### x

- **Type:** `number`  
- **Description:** The x-coordinate position of the top-left corner of the drawn shape

### y

- **Type:** `number`  
- **Description:** The y-coordinate position of the top-left corner of the drawn shape