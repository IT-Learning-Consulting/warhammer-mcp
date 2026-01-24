# PulsePing

A type of ping that produces a pulsing animation.

## Hierarchy  
- [Ping](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html)  
- **PulsePing**  
- [AlertPing](https://foundryvtt.com/api/classes/foundry.canvas.interaction.AlertPing.html)  
- [ArrowPing](https://foundryvtt.com/api/classes/foundry.canvas.interaction.ArrowPing.html)  

---

## Constructors

### constructor

```typescript
new PulsePing(origin: Point, options?: PulsePingOptions): PulsePing
```

**Parameters:**

- **origin**: `Point`  
  The canvas coordinates of the origin of the ping.
- **options** (optional): `PulsePingOptions` = {}  
  Additional options to configure the ping animation.

**Returns:**  
`PulsePing`  

Overrides [Ping.constructor](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#constructor)

---

## Properties

### _color

`_color: Color`  

The color of the ping.

Inherited from [Ping._color](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#_color)

---

## Methods

### _animateFrame

```typescript
_animateFrame(dt: any, animation: any): void
```

On each tick, advance the animation.

**Parameters:**

- **dt**: `any`  
  The number of ms that elapsed since the previous frame.
- **animation**: `any`  
  The animation state.

**Returns:**  
`void`

Overrides [Ping._animateFrame](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#_animateframe)

---

### animate

```typescript
animate(): Promise<boolean>
```

Start the ping animation.

**Returns:**  
`Promise<boolean>`  
Returns true if the animation ran to completion, false otherwise.

Overrides [Ping.animate](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#animate)

---

### destroy

```typescript
destroy(options?: {}): void
```

**Parameters:**

- **options**: `{}` = {}

**Returns:**  
`void`

Inherited from [Ping.destroy](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#destroy)

---

### _drawShape

```typescript
_drawShape(g: Graphics, color: number, alpha: number, size: number): void
```

Draw the shape for this ping.

**Parameters:**

- **g**: `Graphics`  
  The graphics object to draw to.
- **color**: `number`  
  The color of the shape.
- **alpha**: `number`  
  The alpha of the shape.
- **size**: `number`  
  The size of the shape to draw.

**Returns:**  
`void`