# TooltipManager | Foundry Virtual Tabletop - API Documentation - Version 13

A singleton Tooltip Manager class responsible for rendering and positioning a dynamic tooltip element which is accessible as `game.tooltip`.

**See**  
[foundry.Game#tooltip](https://foundryvtt.com/api/classes/foundry.Game.html#tooltip)

---

## Properties

### element

`element: null | HTMLElement = null`  
A reference to the HTML element which is currently tool-tipped, if any.

### tooltip

`tooltip: HTMLElement = ...`  
A cached reference to the global tooltip element

### LOCKED_TOOLTIP_BUFFER_PX

`static LOCKED_TOOLTIP_BUFFER_PX: number = 50`  
The number of pixels buffer around a locked tooltip zone before they should be dismissed.

### TOOLTIP_ACTIVATION_MS

`static TOOLTIP_ACTIVATION_MS: number = 500`  
The number of milliseconds delay which activates a tooltip on a "long hover".

### TOOLTIP_DIRECTIONS

```typescript
static TOOLTIP_DIRECTIONS: {
    CENTER: string;
    DOWN: string;
    LEFT: string;
    RIGHT: string;
    UP: string;
} = ...
```
The directions in which a tooltip can extend, relative to its tool-tipped element.

### TOOLTIP_MARGIN_PX

`static TOOLTIP_MARGIN_PX: number = 5`  
An amount of margin which is used to offset tooltips from their anchored element.

---

## Accessors

### implementation

```typescript
static get implementation(): typeof TooltipManager
```

Retrieve the configured TooltipManager implementation.

**Returns:**  
`typeof [TooltipManager](https://foundryvtt.com/api/classes/foundry.helpers.interaction.TooltipManager.html)`

---

## Methods

### activate

```typescript
activate(
    element: HTMLElement,
    options?: {
        cssClass?: string;
        direction?: "UP" | "DOWN" | "LEFT" | "RIGHT" | "CENTER";
        html?: string | HTMLElement;
        locked?: boolean;
        text?: string;
    },
): void
```

Activate the tooltip for a hovered HTML element which defines a tooltip localization key.

**Parameters:**

- **element**: `HTMLElement`  
  The HTML element being hovered.

- **options** (optional):  
  Additional options which can override tooltip behavior.

  - **cssClass?**: `string`  
    An optional, space-separated list of CSS classes to apply to the activated tooltip. If this is not provided, the CSS classes are acquired from the `data-tooltip-class` attribute of the element or one of its parents.

  - **direction?**: `"UP" | "DOWN" | "LEFT" | "RIGHT" | "CENTER"`  
    An explicit tooltip expansion direction. If this is not provided, the direction is acquired from the `data-tooltip-direction` attribute of the element or one of its parents.

  - **html?**: `string | HTMLElement`  
    Explicit HTML to inject into the tooltip rather than using tooltip text. If passed as a [string](https://foundryvtt.com/api/functions/foundry.utils.cleanHTML.html), the HTML string is cleaned with `foundry.utils.cleanHTML`. An explicit HTML string may also be set with the `data-tooltip-html` attribute on the element.

  - **locked?**: `boolean`  
    An optional boolean to lock the tooltip after creation. Defaults to false.

  - **text?**: `string`  
    Explicit tooltip text to display. If this is not provided the tooltip text is acquired from the element's `data-tooltip-text` attribute if present and otherwise from its `data-tooltip` attribute. The `data-tooltip` text will be automatically localized. If `data-tooltip` is not a localization string, the text is rendered as HTML (cleaned). Both options.text and `data-tooltip-text` do not support HTML. It is not recommended to use `data-tooltip` for plain text and HTML as it could cause an unintentional localization. Instead use `data-tooltip-text` and `data-tooltip-html`, respectively.

**Returns:** `void`

---

### activateEventListeners

```typescript
activateEventListeners(): void
```

Activate interactivity by listening for hover events on HTML elements which have a data-tooltip defined.

**Returns:** `void`

---

### createLockedTooltip

```typescript
createLockedTooltip(
    position: { bottom: string; left: string; right: string; top: string },
    text: string,
    options?: { cssClass?: string },
): HTMLElement
```

Create a locked tooltip at the given position.

**Parameters:**

- **position**:  
  An object with coordinates for where the tooltip should be placed

  - **bottom**: `string`  
    Explicit bottom position for the tooltip

  - **left**: `string`  
    Explicit left position for the tooltip

  - **right**: `string`  
    Explicit right position for the tooltip

  - **top**: `string`  
    Explicit top position for the tooltip

- **text**: `string`  
  Explicit tooltip text or HTML to display.

- **options** (optional):  
  Additional options which can override tooltip behavior.

  - **cssClass?**: `string`  
    An optional, space-separated list of CSS classes to apply to the activated tooltip.

**Returns:** `HTMLElement`

---

### deactivate

```typescript
deactivate(): void
```

Deactivate the tooltip from a previously hovered HTML element.

**Returns:** `void`

---

### dismissLockedTooltip

```typescript
dismissLockedTooltip(element: HTMLElement): void
```

Dismiss a given locked tooltip.

**Parameters:**

- **element**: `HTMLElement`  
  The locked tooltip to dismiss.

**Returns:** `void`

---

### dismissLockedTooltips

```typescript
dismissLockedTooltips(): void
```

Dismiss the set of active locked tooltips.

**Returns:** `void`

---

### lockTooltip

```typescript
lockTooltip(): HTMLElement
```

Lock the current tooltip.

**Returns:** `HTMLElement`

---

### _determineDirection  _(Protected)_

```typescript
_determineDirection(): any
```

If an explicit tooltip expansion direction was not specified, figure out a valid direction based on the bounds of the target element and the screen.

**Returns:** `any`

---

### _onLockedTooltipDismiss  _(Protected)_

```typescript
_onLockedTooltipDismiss(event: MouseEvent): void
```

Handle dismissing a locked tooltip.

**Parameters:**

- **event**: `MouseEvent`  
  The click event.

**Returns:** `void`

---

### _onLockTooltip  _(Protected)_

```typescript
_onLockTooltip(event: MouseEvent): void
```

Handle a request to lock the current tooltip.

**Parameters:**

- **event**: `MouseEvent`  
  The click event.

**Returns:** `void`

---

### _setAnchor  _(Protected)_

```typescript
_setAnchor(direction: "UP" | "DOWN" | "LEFT" | "RIGHT" | "CENTER"): void
```

Set tooltip position relative to an HTML element using an explicitly provided data-tooltip-direction.

**Parameters:**

- **direction**: `"UP" | "DOWN" | "LEFT" | "RIGHT" | "CENTER"`  
  The tooltip expansion direction specified by the element or a parent element.

**Returns:** `void`

---

### _setStyle  _(Protected)_

```typescript
_setStyle(position?: object): void
```

Apply inline styling rules to the tooltip for positioning and text alignment.

**Parameters:**

- **position** (optional): `object = {}`  
  An object of positioning data, supporting top, right, bottom, left, and textAlign

**Returns:** `void`

---

## Examples

### API Usage

```typescript
game.tooltip.activate(htmlElement, { text: "Some tooltip text", direction: "UP" });
game.tooltip.deactivate();
```

### HTML Usage

```html
<span data-tooltip="Some Tooltip" data-tooltip-direction="LEFT">I have a tooltip</span>
<ol data-tooltip-direction="RIGHT">
  <li data-tooltip="The First One">One</li>
  <li data-tooltip="The Second One">Two</li>
  <li data-tooltip="The Third One">Three</li>
</ol>
```

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)