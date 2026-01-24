# AdaptiveFragmentChannelMixin | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
AdaptiveFragmentChannelMixin(
    ShaderClass: typeof Shader | Filter,
): (ShaderClass: typeof Shader | Filter) => typeof AdaptiveFragmentChannelMixin
```

A mixin which decorates a shader or filter and constructs a fragment shader according to a chosen channel.

## Parameters

- **ShaderClass**: `typeof Shader | Filter`  
  The parent ShaderClass class being mixed.

## Returns

- `(ShaderClass: typeof Shader | Filter) => typeof AdaptiveFragmentChannelMixin`  
  A Shader/Filter subclass mixed with AdaptiveFragmentChannelMixin.

---

**Mixin**

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)