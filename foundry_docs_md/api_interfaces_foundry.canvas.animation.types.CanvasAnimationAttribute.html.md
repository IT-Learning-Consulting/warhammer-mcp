# CanvasAnimationAttribute

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [animation](https://foundryvtt.com/api/modules/foundry.canvas.animation.html) / [types](https://foundryvtt.com/api/modules/foundry.canvas.animation.types.html) / [CanvasAnimationAttribute](https://foundryvtt.com/api/interfaces/foundry.canvas.animation.types.CanvasAnimationAttribute.html)

## Interface: CanvasAnimationAttribute

```typescript
interface CanvasAnimationAttribute {
    attribute: string;
    color?: boolean;
    delta?: number;
    done?: number;
    from?: number | Color;
    parent: object;
    to: number | Color;
}
```

## Properties

- **attribute**: `string`  
  The attribute name being animated

- **color?**: `boolean`  
  Is this a color animation that applies to RGB channels

- **delta?**: `number`  
  The computed delta between `to` and `from`

- **done?**: `number`  
  The amount of the total delta which has been animated

- **from?**: `number | [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)`  
  An initial value of the attribute, otherwise `parent[attribute]` is used

- **parent**: `object`  
  The object within which the attribute is stored

- **to**: `number | [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)`  
  The destination value of the attribute