# GridHighlight | Foundry Virtual Tabletop - API Documentation - Version 13

A special Graphics class which handles Grid layer highlighting.

## Hierarchy
* _Graphics_<this>  
* **GridHighlight**

---

## Properties

### positions
- Type: `Set<any>`  
Track distinct positions which have already been highlighted.

---

## Methods

### clear
```typescript
clear(): GridHighlight
```
**Returns:** `GridHighlight`

Overrides `PIXI.smooth.SmoothGraphics.clear`.

---

### destroy
```typescript
destroy(...args: any[]): void
```
**Parameters:**
- **...args**: `any[]`  

**Returns:** `void`  

Overrides `PIXI.smooth.SmoothGraphics.destroy`.

---

### highlight
```typescript
highlight(x: number, y: number): boolean
```
Record a position that is highlighted and return whether or not it should be rendered.

**Parameters:**
- **x**: `number`  
  The x-coordinate to highlight.
- **y**: `number`  
  The y-coordinate to highlight.

**Returns:** `boolean`  
Whether or not to draw the highlight for this location.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[Foundry Virtual Tabletop - API Documentation - Modules](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [containers](https://foundryvtt.com/api/modules/foundry.canvas.containers.html) / [GridHighlight](https://foundryvtt.com/api/classes/foundry.canvas.containers.GridHighlight.html)