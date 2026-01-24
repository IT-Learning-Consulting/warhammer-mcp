# Tabs

A controller class for managing tabbed navigation within an Application instance.

**See:**  
[foundry.applications.api.ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)

---

## Example: Configure tab-control for a set of HTML elements

Activate tab control in JavaScript:

```html
<!-- Example HTML -->
<nav class="tabs" data-group="primary-tabs">
  <a class="item" data-tab="tab1" data-group="primary-tabs">Tab 1</a>
  <a class="item" data-tab="tab2" data-group="primary-tabs">Tab 2</a>
</nav>

<section class="content">
  <div class="tab" data-tab="tab1" data-group="primary-tabs">Content 1</div>
  <div class="tab" data-tab="tab2" data-group="primary-tabs">Content 2</div>
</section>
```

```javascript
const tabs = new foundry.applications.ux.Tabs({
  navSelector: ".tabs",
  contentSelector: ".content",
  initial: "tab1"
});
tabs.bind(html);
```

---

## Constructors

### constructor

```typescript
new Tabs(config?: TabsConfiguration): Tabs
```

**Parameters**

- **config**: `TabsConfiguration` = {}  
  The Tabs Configuration to use for this tabbed container

**Returns**  
`Tabs`

---

## Properties

- **active**: `string`  
  The value of the active tab

- **callback**: `null` | `Function`  
  A callback function to trigger when the tab is changed

- **group**: `string`  
  The name of the tabs group

---

## Methods

### activate

```typescript
activate(tabName: string, triggerCallback?: boolean): void
```

Activate a new tab by name.

**Parameters**

- **tabName**: `string`  
- **triggerCallback**: `boolean` (optional)

**Returns**  
`void`

---

### bind

```typescript
bind(html: HTMLElement): void
```

Bind the Tabs controller to an HTML application.

**Parameters**

- **html**: `HTMLElement`

**Returns**  
`void`

---

### _onClickNav  *(Protected)*

```typescript
_onClickNav(event: PointerEvent): void
```

Handle click events on the tab navigation entries.

**Parameters**

- **event**: `PointerEvent`  
  A left click event

**Returns**  
`void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)