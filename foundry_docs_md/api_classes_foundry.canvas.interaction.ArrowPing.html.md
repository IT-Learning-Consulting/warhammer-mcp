# ArrowPing | Foundry Virtual Tabletop - API Documentation - Version 13

A type of ping that produces an arrow pointing in a given direction.

## Hierarchy
- _PulsePing_
- **ArrowPing**

## Constructors

### constructor

```typescript
new ArrowPing(
    origin: Point,
    options?: PingOptions & _PulsePingOptions & { rotation?: number },
): ArrowPing
```

**Parameters:**

- **origin**: `Point`  
  The canvas coordinates of the origin of the ping. This becomes the arrow's tip.

- **options** (optional): `PingOptions & _PulsePingOptions & { rotation?: number }` = `{}`  
  Additional options to configure the ping animation.

**Returns:**  
`ArrowPing`

Overrides [PulsePing.constructor](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#constructor).

## Properties

### _color

_Type_: [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)  
The color of the ping.

Inherited from [PulsePing._color](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#_color).

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

**Returns:** `void`

Inherited from [PulsePing._animateFrame](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#_animateframe).

### _drawShape

```typescript
_drawShape(g: any, color: any, alpha: any, size: any): void
```

Draw the shape for this ping.

**Parameters:**

- **g**: `any`  
  The graphics object to draw to.

- **color**: `any`  
  The color of the shape.

- **alpha**: `any`  
  The alpha of the shape.

- **size**: `any`  
  The size of the shape to draw.

**Returns:** `void`

Overrides [PulsePing._drawShape](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#_drawshape).

### animate

```typescript
animate(): Promise<boolean>
```

Start the ping animation.

**Returns:** `Promise<boolean>`  
Returns true if the animation ran to completion, false otherwise.

Inherited from [PulsePing.animate](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#animate).

### destroy

```typescript
destroy(options?: {}): void
```

**Parameters:**

- **options** (optional): `{}` = `{}`

**Returns:** `void`

Inherited from [PulsePing.destroy](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#destroy).