# CanvasAnimation

A helper class providing utility methods for PIXI Canvas animation.

## Properties

### `animations`

```typescript
static animations: Record<string | symbol, CanvasAnimationData> = {}
```

Track an object of active animations by name, context, and function.  
This allows a currently playing animation to be referenced and terminated.

---

## Accessors

### `STATES`

```typescript
static get STATES(): Readonly<{
  COMPLETED: 2;
  FAILED: -2;
  RUNNING: 1;
  TERMINATED: -1;
  WAITING: 0;
}>
```

The possible states of an animation.

**Returns**  
`Readonly<{ COMPLETED: 2; FAILED: -2; RUNNING: 1; TERMINATED: -1; WAITING: 0 }>`  

---

### `ticker`

```typescript
static get ticker(): Ticker
```

The ticker used for animations.

**Returns**  
`Ticker`  

---

## Methods

### `animate`

```typescript
static animate(
  attributes: CanvasAnimationAttribute[],
  options?: CanvasAnimationOptions,
): Promise<boolean>
```

Apply an animation from the current value of some attribute to a new value.  
Resolve a Promise once the animation has concluded and the attributes have reached their new target.

**Parameters**

- **attributes**: `CanvasAnimationAttribute[]`  
  An array of attributes to animate.
- **options**: `CanvasAnimationOptions = {}`  
  Additional options which customize the animation.

**Returns**  
`Promise<boolean>` — A Promise which resolves to `true` once the animation has concluded or `false` if the animation was prematurely terminated.

**Example: Animate Token Position**

```typescript
let animation = [
  {
    parent: token,
    attribute: "x",
    to: 1000
  },
  {
    parent: token,
    attribute: "y",
    to: 2000
  }
];
foundry.canvas.animation.CanvasAnimation.animate(animation, {duration: 500});
```

---

### `easeInCircle`

```typescript
static easeInCircle(pt: number): number
```

Shallow ease in.

**Parameters**

- **pt**: `number`  
  The proportional animation timing on `[0,1]`.

**Returns**  
`number` — The eased animation progress on `[0,1]`.

---

### `easeInOutCosine`

```typescript
static easeInOutCosine(pt: number): number
```

Cosine based easing with smooth in-out.

**Parameters**

- **pt**: `number`  
  The proportional animation timing on `[0,1]`.

**Returns**  
`number` — The eased animation progress on `[0,1]`.

---

### `easeOutCircle`

```typescript
static easeOutCircle(pt: number): number
```

Shallow ease out.

**Parameters**

- **pt**: `number`  
  The proportional animation timing on `[0,1]`.

**Returns**  
`number` — The eased animation progress on `[0,1]`.

---

### `getAnimation`

```typescript
static getAnimation(name: string | symbol): CanvasAnimationData
```

Retrieve an animation currently in progress by its name.

**Parameters**

- **name**: `string | symbol`  
  The animation name to retrieve.

**Returns**  
`CanvasAnimationData` — The animation data, or undefined.

---

### `terminateAll`

```typescript
static terminateAll(): Promise<void>
```

Terminate all active animations in progress, forcibly resolving each one with `false`.  
This method returns a Promise that resolves once all animations have been terminated and removed.

**Returns**  
`Promise<void>` — A promise that resolves when all animations have been forcibly terminated.

---

### `terminateAnimation`

```typescript
static terminateAnimation(name: string | symbol): void
```

If an animation using a certain name already exists, terminate it.

**Parameters**

- **name**: `string | symbol`  
  The animation name to terminate.

**Returns**  
`void`

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules/foundry.canvas.animation.html#CanvasAnimation).