# JournalEntryPageSheet | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract Application responsible for displaying and editing a single JournalEntryPage Document.

**Mixes:**  
HandlebarsApplication

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sheets.journal.JournalEntryPageSheet), Expand)  
- [DocumentSheetV2](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html)  
- **JournalEntryPageSheet**  
- [JournalEntryPageHandlebarsSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html)  

---

## Constructors

### constructor

```typescript
new JournalEntryPageSheet(options: any, ...args: any[]): JournalEntryPageSheet
```

**Parameters**

- **options**: `any`  
- **args**: `any[]` (rest parameter)  

**Returns**  
`JournalEntryPageSheet`

_Inherited from DocumentSheetV2.constructor_

---

## Properties

### isV2

`isV2: boolean = ...`

Indicates that the sheet renders with App V2 rather than V1.

### toc

`toc: Record<string, JournalEntryPageHeading>`

The table of contents for this text page.

### BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base application.  
Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored.  
Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.

_Inherited from DocumentSheetV2.BASE_APPLICATION_

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
  classes: string[];
  form: { submitOnChange: boolean };
  includeTOC: boolean;
  mode: string;
  position: { height: number; width: number };
  viewClasses: never[];
  viewPermission: 2;
  window: { resizable: boolean };
} = ...
```

Overrides DocumentSheetV2.DEFAULT_OPTIONS

### emittedEvents

`emittedEvents: readonly [unknown, "closeView"] = ...`

Overrides DocumentSheetV2.emittedEvents

### isV2 (static)

`isV2: boolean = true`

### RENDER_STATES

`RENDER_STATES: Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

_Inherited from DocumentSheetV2.RENDER_STATES_

### TABS

`TABS: Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

_Inherited from DocumentSheetV2.TABS_

---

## Accessors

### isView

```typescript
get isView(): boolean
```

Whether the sheet is in view mode.

**Returns**  
`boolean`

### page

```typescript
get page(): documents.JournalEntryPage
```

The JournalEntryPage for this sheet.

**Returns**  
`documents.JournalEntryPage`

---

## Methods

### _insertElement

```typescript
_insertElement(element: any): void
```

**Parameters**

- **element**: `any`

**Returns**  
`void`

_Inherited from DocumentSheetV2_

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<void>`

_Inherited from DocumentSheetV2_

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<any>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<any>`

_Inherited from DocumentSheetV2_

---

### _onCloseView

```typescript
protected _onCloseView(): void
```

Actions performed when this sheet is closed in some parent view.

**Returns**  
`void`

---

### _prepareHeadingLevels

```typescript
protected _prepareHeadingLevels(): Record<string, string>
```

Prepare heading level choices.

**Returns**  
`Record<string, string>`

---

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

_Inherited from DocumentSheetV2.inheritanceChain_

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: `string`  
  The CSS style rule
- **parentDimension**: `number`  
  The relevant dimension of the parent element

**Returns**  
`number | void`  
The parsed style dimension in pixels

_Inherited from DocumentSheetV2.parseCSSDimension_

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`  
  The element.

**Returns**  
`Promise<void>`

_Inherited from DocumentSheetV2.waitForImages_