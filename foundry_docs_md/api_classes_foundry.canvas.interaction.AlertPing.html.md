# AlertPing

A type of ping that produces a pulse warning sign animation.

**Hierarchy** [(View Summary)](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.interaction.AlertPing)  
*PulsePing*  
**AlertPing**

---

## Constructors

### constructor

```typescript
new AlertPing(origin: Point, options?: PulsePingOptions): AlertPing
```

**Parameters**

- **origin**: `Point`  
  The canvas coordinates of the origin of the ping.
- **options**: `PulsePingOptions` = {}  
  Additional options to configure the ping animation.

**Returns**  
`AlertPing`

Overrides [PulsePing.constructor](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#constructor)

---

## Properties

### _color

_type:_ [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)  
The color of the ping.

Inherited from [PulsePing._color](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#_color)

---

## Methods

### _animateFrame

```typescript
_animateFrame(dt: any, animation: any): void
```

On each tick, advance the animation.

**Parameters**

- **dt**: `any`  
  The number of ms that elapsed since the previous frame.
- **animation**: `any`  
  The animation state.

**Returns**  
`void`

Inherited from [PulsePing._animateFrame](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#_animateframe)

---

### _drawShape

```typescript
_drawShape(g: any, color: any, alpha: any, size: any): void
```

**Parameters**

- **g**: `any`
- **color**: `any`
- **alpha**: `any`
- **size**: `any`

**Returns**  
`void`

Overrides [PulsePing._drawShape](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#_drawshape)

---

### animate

```typescript
animate(): Promise<boolean>
```

Start the ping animation.

**Returns**  
A `Promise<boolean>` — Returns true if the animation ran to completion, false otherwise.

Inherited from [PulsePing.animate](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#animate)

---

### destroy

```typescript
destroy(options?: {}): void
```

**Parameters**

- **options**: `{}` = {}

**Returns**  
`void`

Inherited from [PulsePing.destroy](https://foundryvtt.com/api/classes/foundry.canvas.interaction.PulsePing.html#destroy)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)