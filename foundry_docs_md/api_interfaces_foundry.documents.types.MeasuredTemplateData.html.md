# MeasuredTemplateData | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface MeasuredTemplateData

```typescript
interface MeasuredTemplateData {
    _id: null | string;
    angle?: number;
    author: string;
    borderColor?: string;
    direction?: number;
    distance?: number;
    elevation?: number;
    fillColor?: string;
    flags: DocumentFlags;
    hidden?: boolean;
    t?: string;
    texture?: string;
    width?: number;
    x?: number;
    y?: number;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this BaseMeasuredTemplate embedded document

- **angle**?: `number`  
  *Optional*  
  The angle of effect of the measured template, applies to cone types

- **author**: `string`  
  The _id of the user who created this measured template

- **borderColor**?: `string`  
  *Optional*  
  A color string used to tint the border of the template shape

- **direction**?: `number`  
  *Optional*  
  The angle of rotation for the measured template

- **distance**?: `number`  
  *Optional*  
  The distance of the template effect

- **elevation**?: `number`  
  *Optional*  
  The elevation

- **fillColor**?: `string`  
  *Optional*  
  A color string used to tint the fill of the template shape

- **flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags

- **hidden**?: `boolean`  
  *Optional*  
  Is the template currently hidden?

- **t**?: `string`  
  *Optional*  
  The value in `CONST.MEASURED_TEMPLATE_TYPES` which defines the geometry type of this template

- **texture**?: `string`  
  *Optional*  
  A repeatable tiling texture used to add a texture fill to the template shape

- **width**?: `number`  
  *Optional*  
  The width of the measured template, applies to ray types

- **x**?: `number`  
  *Optional*  
  The x-coordinate position of the origin of the template effect

- **y**?: `number`  
  *Optional*  
  The y-coordinate position of the origin of the template effect