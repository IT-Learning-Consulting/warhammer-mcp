# BaseShaderMixin | Foundry Virtual Tabletop - API Documentation - Version 13

### Function BaseShaderMixin

```typescript
BaseShaderMixin(
    ShaderClass: typeof Shader,
): (ShaderClass: typeof Shader) => typeof BaseShaderMixin
```

A mixin which decorates a `PIXI.Filter` or `PIXI.Shader` with common properties.

**Parameters**

- **ShaderClass**: `typeof Shader`  
  The parent ShaderClass class being mixed.

**Returns**

- `(ShaderClass: typeof Shader) => typeof BaseShaderMixin`  
  A Shader/Filter subclass mixed with BaseShaderMixin features.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)