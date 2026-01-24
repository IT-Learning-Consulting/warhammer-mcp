# ObservableTransform

A custom Transform class allowing to observe changes with a callback.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [geometry](https://foundryvtt.com/api/modules/foundry.canvas.geometry.html) / [ObservableTransform](https://foundryvtt.com/api/classes/foundry.canvas.geometry.ObservableTransform.html)

## Hierarchy

* _Transform_
* **ObservableTransform**

## Constructors

```typescript
new ObservableTransform(callback: Function, scope: object): ObservableTransform
```

**Parameters**

- **callback**: `Function`  
  The callback called to observe changes.

- **scope**: `object`  
  The scope of the callback.

**Returns**  
`ObservableTransform`  

Overrides PIXI.Transform.constructor

## Properties

### cb

- **cb**: `Function`  
  The callback which is observing the changes.

### scope

- **scope**: `object`  
  The scope of the callback.

## Methods

### onChange

```typescript
onChange(): void
```

**Returns**  
`void`

Overrides PIXI.Transform.onChange

### updateSkew

```typescript
updateSkew(): void
```

**Returns**  
`void`

Overrides PIXI.Transform.updateSkew

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)