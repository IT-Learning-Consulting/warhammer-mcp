# FramebufferSnapshot

Provide the necessary methods to get a snapshot of the framebuffer into a render texture.  
Class meant to be used as a singleton. Created with the precious advices of dev7355608.

## Properties

### framebufferTexture

**Type:** `RenderTexture`  
The RenderTexture that is the render destination for the framebuffer snapshot.

## Methods

### getFramebufferTexture

```typescript
getFramebufferTexture(renderer: Renderer): RenderTexture
```

Get the framebuffer texture snapshot.

- **renderer**: `Renderer`  
  The renderer for this context.

**Returns:** `RenderTexture`

The framebuffer snapshot.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)