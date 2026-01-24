# Ping | Foundry Virtual Tabletop - API Documentation - Version 13

A class to manage a user ping on the canvas.

## Hierarchy
- Container  
- **Ping**  
  - [PulsePing](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html)  
  - [ChevronPing](https://foundryvtt.com/api/classes/foundry.canvas.interaction.ChevronPing.html)

---

## Constructors

### constructor

```typescript
new Ping(origin: Point, options?: PingOptions): Ping
```

**Parameters:**

- **origin**: `Point`  
  The canvas coordinates of the origin of the ping.

- **options** (optional): `PingOptions` = {}  
  Additional options to configure the ping animation.

**Returns:**  
`Ping`

Overrides PIXI.Container.constructor

---

## Properties

### _color

**Type:** [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)  
The color of the ping.

---

## Methods

### animate

```typescript
animate(): Promise<boolean>
```

Start the ping animation.

**Returns:**  
`Promise<boolean>` — Returns true if the animation ran to completion, false otherwise.

---

### destroy

```typescript
destroy(options?: {}): void
```

Overrides PIXI.Container.destroy

**Parameters:**

- **options**: `{}` = {}

**Returns:**  
`void`

---

### _animateFrame

```typescript
_animateFrame(dt: number, animation: CanvasAnimationData): void
```

Protected method called on each tick to advance the animation.

**Parameters:**

- **dt**: `number`  
  The number of milliseconds that elapsed since the previous frame.

- **animation**: `CanvasAnimationData`  
  The animation state.

**Returns:**  
`void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)