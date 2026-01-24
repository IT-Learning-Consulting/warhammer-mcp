# TokenAnimationData

Foundry Virtual Tabletop - API Documentation - Version 13  
[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

## Interface: `TokenAnimationData`

```typescript
interface TokenAnimationData {
    alpha: number;
    elevation: number;
    height: number;
    ring: { subject: { scale: number; texture: string } };
    rotation: number;
    texture: {
        anchorX: number;
        anchorY: number;
        scaleX: number;
        scaleY: number;
        src: string;
        tint: Color;
    };
    width: number;
    x: number;
    y: number;
}
```

### Properties

- **alpha**: `number`  
  The alpha value.

- **elevation**: `number`  
  The elevation in grid units.

- **height**: `number`  
  The height in grid spaces.

- **ring**: `{ subject: { scale: number; texture: string } }`  
  The ring data.

  - **subject**:  
    The ring subject data.
    - **scale**: `number`  
      The ring subject scale.
    - **texture**: `string`  
      The ring subject texture.

- **rotation**: `number`  
  The rotation in degrees.

- **texture**:  
  The texture data.
  - **anchorX**: `number`  
    The texture anchor X.
  - **anchorY**: `number`  
    The texture anchor Y.
  - **scaleX**: `number`  
    The texture scale X.
  - **scaleY**: `number`  
    The texture scale Y.
  - **src**: `string`  
    The texture file path.
  - **tint**: [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)  
    The texture tint.

- **width**: `number`  
  The width in grid spaces.

- **x**: `number`  
  The x position in pixels.

- **y**: `number`  
  The y position in pixels.