# PointEffectSourceMixin | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
Function PointEffectSourceMixin<T extends class>(BaseSource: T): any
```

Provides a common framework for effect sources that emanate from a central point and extend within a specific radius. This mixin can be used to manage any effect with a point-based origin, such as light, darkness, or other effects.

**Type Parameters**

- **T** extends `class`

**Parameters**

- **BaseSource**: `T`  
  The base source class to extend

**Returns**  
`any`  
An extended class containing PointEffectSource logic

**Mixin**

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)