# ReticuleOptions

```typescript
interface ReticuleOptions {
    alpha?: number;
    border?: { 
      color?: number; 
      width?: number; 
    };
    color?: number;
    margin?: number;
    size?: number;
}
```

## Properties

### alpha?  
*Type:* `number`  
The alpha value of the arrows.

### border?  
*Type:* `{ color?: number; width?: number; }`  
The arrows' border style configuration.

- **color?** `number`  
  The border color.

- **width?** `number`  
  The border width.

### color?  
*Type:* `number`  
The color of the arrows.

### margin?  
*Type:* `number`  
The amount of margin between the targeting arrows and the token's bounding box, expressed as a fraction of an arrow's size.

### size?  
*Type:* `number`  
The size of the arrows as a proportion of grid size. Default: `CONFIG.Canvas.targeting.size`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)