# ChevronPing

A type of ping that points to a specific location.

## Hierarchy
- [Ping](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html)  
- **ChevronPing**

---

## Constructors

### constructor

```typescript
new ChevronPing(origin: Point, options?: PingOptions): ChevronPing
```

**Parameters**

- **origin**: `Point`  
  The canvas coordinates of the origin of the ping.

- **options**: `PingOptions` = {} (optional)  
  Additional options to configure the ping animation.

**Returns**  
`ChevronPing`

Overrides [`Ping.constructor`](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#constructor).

---

## Properties

### _color

**Type**: [`Color`](https://foundryvtt.com/api/classes/foundry.utils.Color.html)  

The color of the ping.

Inherited from [`Ping._color`](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#_color).

### CHEVRON_PATH

**Type**: `string` = `"icons/pings/chevron.webp"`  

The path to the chevron texture.

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

Overrides [`Ping._animateFrame`](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#_animateframe).

---

### animate

```typescript
animate(): Promise<boolean>
```

Start the ping animation.

**Returns**  
`Promise<boolean>` - Returns true if the animation ran to completion, false otherwise.

Overrides [`Ping.animate`](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#animate).

---

### destroy

```typescript
destroy(options?: {}): void
```

**Parameters**

- **options**: `{}` = {} (optional)

**Returns**  
`void`

Inherited from [`Ping.destroy`](https://foundryvtt.com/api/classes/foundry.canvas.interaction.Ping.html#destroy).

---

> [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)