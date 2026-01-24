# UnboundTransform | Foundry Virtual Tabletop - API Documentation - Version 13

A custom Transform class which is not bound to the parent worldTransform. `localTransform` are working as usual.

## Hierarchy

* _Transform_
* **UnboundTransform**

## Properties

### IDENTITY

```typescript
static IDENTITY: UnboundTransform
```

Overrides `PIXI.Transform.IDENTITY`.

## Methods

### updateTransform

```typescript
updateTransform(parentTransform: any): void
```

**Parameters**

- **parentTransform**: *any*

**Returns**

- *void*

Overrides `PIXI.Transform.updateTransform`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)