# EnvironmentCanvasGroup

A container group which contains the primary canvas group and the effects canvas group.

## Hierarchy

* _any_
* **EnvironmentCanvasGroup**

## Properties

### colors

Colors exposed by the manager.

```typescript
colors: {
    ambientBrightest: undefined;
    ambientDarkness: undefined;
    ambientDaylight: undefined;
    background: undefined;
    bright: undefined;
    darkness: undefined;
    dim: undefined;
    fogExplored: undefined;
    fogUnexplored: undefined;
    halfdark: undefined;
    sceneBackground: undefined;
} = ...
```

### weights

Weights used by the manager to compute colors.

```typescript
weights: {
    bright: undefined;
    dark: undefined;
    dim: undefined;
    halfdark: undefined;
} = ...
```

### groupName

```typescript
static groupName: string = "environment"
```

### tearDownChildren

```typescript
static tearDownChildren: boolean = false
```

## Accessors

### darknessLevel

Get the darkness level of this scene.

```typescript
get darknessLevel(): number
```

**Returns:** `number`

## Methods

### _draw

```typescript
_draw(options: any): Promise<void>
```

**Parameters**

- **options**: `any`

**Returns:** `Promise<void>`

### initialize

Initialize the scene environment options.

```typescript
initialize(config?: CanvasEnvironmentConfig): void
```

**Parameters**

- **config**: [CanvasEnvironmentConfig](https://foundryvtt.com/api/interfaces/foundry.CanvasEnvironmentConfig.html) = {}

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)