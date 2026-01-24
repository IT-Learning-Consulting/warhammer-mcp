# TokenRuler

The default implementation of the Token ruler.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.tokens.TokenRuler)

- *BaseTokenRuler*  
- **TokenRuler**

---

## Properties

### Static

#### WAYPOINT_LABEL_TEMPLATE

```typescript
WAYPOINT_LABEL_TEMPLATE: string = "templates/hud/waypoint-label.hbs"
```

A handlebars template used to render each waypoint label.

---

## Accessors

### Static: WAYPOINT_LABEL_TEMPLATE

See above.

---

### isVisible

```typescript
get isVisible(): boolean
```

Is the ruler supposed to be visible?  
The property `BaseTokenRuler#visible` is set to `BaseTokenRuler#isVisible` in [`foundry.canvas.placeables.Token#_refreshState`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_refreshstate).

**Returns:** `boolean`

Inherited from `BaseTokenRuler.isVisible`

---

### token

```typescript
get token(): canvas.placeables.Token
```

The reference to the Token this ruler belongs to.

**Returns:** `canvas.placeables.Token`

Inherited from `BaseTokenRuler.token`

---

### visible

```typescript
get visible(): boolean
set visible(value: boolean): void
```

Is the ruler visible?

**Returns:** `boolean`

**Default Value:** `false`

Setter is inherited from `BaseTokenRuler.visible` and sets `BaseTokenRuler#isVisible` in [`foundry.canvas.placeables.Token#_refreshState`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_refreshstate).

**Parameters:**

- **value**: `boolean`

---

## Methods

### _onVisibleChange

```typescript
_onVisibleChange(): void
```

Overrides [`BaseTokenRuler._onVisibleChange`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.BaseTokenRuler.html#_onvisiblechange).

**Returns:** `void`

---

### clear

```typescript
clear(): void
```

Overrides [`BaseTokenRuler.clear`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.BaseTokenRuler.html#clear).

**Returns:** `void`

---

### destroy

```typescript
destroy(): void
```

Overrides [`BaseTokenRuler.destroy`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.BaseTokenRuler.html#destroy).

**Returns:** `void`

---

### draw

```typescript
draw(): Promise<void>
```

Overrides [`BaseTokenRuler.draw`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.BaseTokenRuler.html#draw).

**Returns:** `Promise<void>`

---

### refresh

```typescript
refresh(
    __namedParameters: {
        passedWaypoints: any;
        pendingWaypoints: any;
        plannedMovement: any;
    },
): void
```

Overrides [`BaseTokenRuler.refresh`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.BaseTokenRuler.html#refresh).

**Parameters:**

- **__namedParameters**: Object containing:
  - **passedWaypoints**: `any`
  - **pendingWaypoints**: `any`
  - **plannedMovement**: `any`

**Returns:** `void`

---

### Protected Methods

#### _configureDashLine

```typescript
_configureDashLine(): { dash: number; gap: number; speed: number }
```

Configure the properties of the dash line. Called in [`TokenRuler.draw`](#draw).

**Returns:** 

- `dash`: number — The dash length in pixels
- `gap`: number — The gap length in pixels
- `speed`: number — The speed in pixels per second

---

#### _configureOutline

```typescript
_configureOutline(): { color: ColorSource; thickness: number }
```

Configure the properties of the outline. Called in [`TokenRuler.draw`](#draw).

**Returns:** 

- `color`: ColorSource — The outline color
- `thickness`: number — The thickness in pixels

---

#### _getGridHighlightStyle

```typescript
_getGridHighlightStyle(
    waypoint: DeepReadonly<Omit<TokenRulerWaypoint, "ray" | "size" | "center" | "index">>,
    offset: DeepReadonly<GridOffset3D>,
): {
    alpha?: number;
    color?: ColorSource;
    matrix?: null | Matrix;
    texture?: Texture<Resource>;
}
```

Get the style to be used to highlight the grid offset.

**Parameters:**

- **waypoint**: `DeepReadonly<Omit<TokenRulerWaypoint, "ray" | "size" | "center" | "index">>` — The waypoint
- **offset**: `DeepReadonly<GridOffset3D>` — An occupied grid offset at the given waypoint that is to be highlighted

**Returns:** Object containing optional styles:

- `alpha?`: `number` — The alpha transparency (if 0, grid space is not highlighted)
- `color?`: `ColorSource` — The highlight color
- `matrix?`: `null | Matrix` — The texture matrix
- `texture?`: `Texture<Resource>` — The texture to apply

---

#### _getSegmentStyle

```typescript
_getSegmentStyle(
    waypoint: DeepReadonly<TokenRulerWaypoint>,
): { alpha?: number; color?: ColorSource; width: number }
```

Get the style of the segment from the previous to the given waypoint.

**Parameters:**

- **waypoint**: `DeepReadonly<TokenRulerWaypoint>` — The waypoint

**Returns:** Object containing:

- `alpha?`: `number` — The alpha transparency
- `color?`: `ColorSource` — The color of the segment
- `width`: `number` — The line width; if 0, no segment is drawn

---

#### _getWaypointLabelContext

```typescript
_getWaypointLabelContext(
    waypoint: DeepReadonly<TokenRulerWaypoint>,
    state: object,
): void | object
```

Get the context used to render a ruler waypoint label.

**Parameters:**

- **waypoint**: `DeepReadonly<TokenRulerWaypoint>`
- **state**: `object`

**Returns:** `void` or an object used for rendering the label

---

#### _getWaypointStyle

```typescript
_getWaypointStyle(
    waypoint: DeepReadonly<TokenRulerWaypoint>,
): { alpha?: number; color?: ColorSource; radius: number }
```

Get the style of the waypoint at the given waypoint.

**Parameters:**

- **waypoint**: `DeepReadonly<TokenRulerWaypoint>`

**Returns:** Object containing:

- `alpha?`: `number` — The alpha transparency
- `color?`: `ColorSource` — The color of the waypoint marker
- `radius`: `number` — The radius of the waypoint; if 0, no waypoint marker is drawn

---

## See Also

- [BaseTokenRuler](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.BaseTokenRuler.html)  
- [Token](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html)  
- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)