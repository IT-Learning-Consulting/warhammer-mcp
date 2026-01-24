# JournalEntrySheet

**Foundry Virtual Tabletop - API Documentation - Version 13**  
The Application responsible for displaying and editing a single JournalEntry Document.

---

## Mixes

- HandlebarsApplication

## Hierarchy

- any
- JournalEntrySheet

---

## Constructors

### constructor

```typescript
new JournalEntrySheet(options: any, ...args: any[]): JournalEntrySheet
```

**Parameters**

- **options**: `any`
- **...args**: `any[]`

**Returns**  
`JournalEntrySheet`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).constructor

---

## Properties

### Protected

#### _pages

`_pages: Record<string, JournalSheetPageContext>`  
The cached list of processed page entries.

### Static

#### BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`  
Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

#### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    actions: {
        configCategories: (...this: any) => void;
        createPage: () => any;
        editPage: (event: PointerEvent, target: HTMLElement) => any;
        goToHeading: (
            ...this: any,
            event: PointerEvent,
            target: HTMLElement,
        ) => void;
        nextPage: () => any;
        previousPage: () => any;
        showPlayers: () => void;
        toggleLock: (...this: any) => void;
        toggleMode: (...this: any) => any;
        toggleSearch: () => any;
        toggleSidebar: () => void;
    };
    classes: string[];
    form: { submitOnChange: boolean };
    position: { height: number; width: number };
    viewPermission: 0;
    window: { resizable: boolean };
} = ...
```

#### emittedEvents

`readonly emittedEvents: ["render", "close", "position"] = ...`

#### OWNERSHIP_ICONS

```typescript
OWNERSHIP_ICONS: { "0": string; "2": string; "3": string } = ...
```

Icons for page ownership.

#### PARTS

```typescript
PARTS: {
    pages: { scrollable: string[]; template: string };
    sidebar: { scrollable: string[]; template: string; templates: string[] };
} = ...
```

#### RENDER_STATES

`RENDER_STATES: Record<string, number> = ...`  
The sequence of rendering states that describe the Application life-cycle.

#### TABS

`TABS: Record<string, ApplicationTabsConfiguration> = {}`  
Configuration of application tabs, with an entry per tab group.

#### VIEW_MODES

```typescript
VIEW_MODES: { MULTIPLE: number; SINGLE: number } = ...
```

---

## Accessors

### entry

```typescript
get entry(): documents.JournalEntry
```

The JournalEntry for this sheet.

**Returns**  
`documents.JournalEntry`

### isMultiple

```typescript
get isMultiple(): boolean
```

Whether the sheet is in multi-page mode.

**Returns**  
`boolean`

### locked

```typescript
get locked(): boolean
```

Whether the journal is locked and disallows modifications to the table of contents.

**Returns**  
`boolean`

### mode

```typescript
get mode(): { MULTIPLE: number; SINGLE: number }
```

Get the JournalEntry's current view mode.

**Returns**  
`{ MULTIPLE: number; SINGLE: number }`

### observer

```typescript
get observer(): IntersectionObserver
```

The currently active IntersectionObserver.

**Returns**  
`IntersectionObserver`

### pageId

```typescript
get pageId(): string
```

The ID of the currently-viewed page.

**Returns**  
`string`

### pageIndex

```typescript
get pageIndex(): number
```

The index of the currently-viewed page in the list of available pages.

**Returns**  
`number`

### pagesInView

```typescript
get pagesInView(): HTMLElement[]
```

The pages that are currently scrolled into view and marked as 'active' in the sidebar.

**Returns**  
`HTMLElement[]`

### searchMode

```typescript
get searchMode(): string
```

Get the JournalEntry's current search mode.

**Returns**  
`string`

### sidebarExpanded

```typescript
get sidebarExpanded(): boolean
```

The expanded state of the sidebar.

**Returns**  
`boolean`

### title

```typescript
get title(): string
```

**Returns**  
`string`

---

## Methods

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

**Returns**  
`void`

**Inherit Doc**

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

**Inherit Doc**

---

### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

**Parameters**

- **options**: `any`

**Returns**  
`any`

**Inherit Doc**

---

### _getHeaderControls

```typescript
_getHeaderControls(): any
```

**Returns**  
`any`

**Inherit Doc**

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

**Parameters**

- **options**: `any`

**Returns**  
`any`

**Inherit Doc**

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: any, event: any): any
```

**Parameters**

- **formConfig**: `any`
- **event**: `any`

**Returns**  
`any`

**Inherit Doc**

---

### _onClose

```typescript
_onClose(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

**Inherit Doc**

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns**  
`Promise<void>`

**Inherit Doc**

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

**Inherit Doc**

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<any>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<any>`

**Inherit Doc**

---

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

**Parameters**

- **partId**: `any`
- **context**: `any`
- **options**: `any`

**Returns**  
`Promise<any>`

**Inherit Doc**

---

### _preSyncPartState

```typescript
_preSyncPartState(
    partId: any,
    newElement: any,
    priorElement: any,
    state: any,
): void
```

**Parameters**

- **partId**: `any`
- **newElement**: `any`
- **priorElement**: `any`
- **state**: `any`

**Returns**  
`void`

**Inherit Doc**

---

### _replaceHTML

```typescript
_replaceHTML(result: any, content: any, options: any): void
```

**Parameters**

- **result**: `any`
- **content**: `any`
- **options**: `any`

**Returns**  
`void`

**Inherit Doc**

---

### _tearDown

```typescript
_tearDown(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

**Inherit Doc**

---

### _updateFrame

```typescript
_updateFrame(options: any): void
```

**Parameters**

- **options**: `any`

**Returns**  
`void`

**Inherit Doc**

---

### createPageDialog

```typescript
createPageDialog(): any
```

Prompt the user with a Dialog for creation of a new JournalEntryPage.

**Returns**  
`any`

---

### getPageSheet

```typescript
getPageSheet(page: string | documents.JournalEntryPage): JournalPageSheet
```

Retrieve the sheet instance for rendering this page inline.

**Parameters**

- **page**: `string | documents.JournalEntryPage`  
  The page instance or its ID.

**Returns**  
`JournalPageSheet`

---

### goToPage

```typescript
goToPage(pageId: string, options?: { anchor?: string }): any
```

Turn to a specific page.

**Parameters**

- **pageId**: `string`  
  The ID of the page to turn to.

Optional:

- **options**:  
  - **anchor?**: `string`  
    Optionally an anchor slug to focus within that page.

**Returns**  
`any`

---

### isPageVisible

```typescript
isPageVisible(page: documents.JournalEntryPage): boolean
```

Determine whether a given page is visible to the current user.

**Parameters**

- **page**: `documents.JournalEntryPage`  
  The page.

**Returns**  
`boolean`

---

### nextPage

```typescript
nextPage(): any
```

Turn to the next page.

**Returns**  
`any`

---

### previousPage

```typescript
previousPage(): any
```

Turn to the previous page.

**Returns**  
`any`

---

### toggleSearchMode

```typescript
toggleSearchMode(): any
```

Toggle the search mode for this journal entry between name and full text search.

**Returns**  
`any`

---

### toggleSidebar

```typescript
toggleSidebar(): void
```

Toggle the collapsed or expanded state of the sidebar.

**Returns**  
`void`

---

### _activatePagesInView

```typescript
_activatePagesInView(): void
```

Highlight the currently-viewed page in the sidebar.

**Returns**  
`void`

---

### _canDragDrop

```typescript
_canDragDrop(selector: string): boolean
```

Determine if drop operations are permitted.

**Parameters**

- **selector**: `string`  
  The candidate HTML selector for dragging.

**Returns**  
`boolean`  
Can the current user drag this selector?

---

### _canDragStart

```typescript
_canDragStart(selector: string): boolean
```

Determine if drag operations are permitted.

**Parameters**

- **selector**: `string`  
  The candidate HTML selector for dragging.

**Returns**  
`boolean`  
Can the current user drag this selector?

---

### _getEntryContextOptions

```typescript
_getEntryContextOptions(): ContextMenuEntry[]
```

Get the set of ContextMenu options which should be used for journal entry pages in the  
sidebar.

**Returns**  
`ContextMenuEntry[]`

---

### _observeHeadings

```typescript
_observeHeadings(): void
```

Create an intersection observer to maintain a list of headings that are in view. This is much  
more performant than calling getBoundingClientRect on all headings whenever we want to  
determine this list.

**Returns**  
`void`

---

### _observePages

```typescript
_observePages(): void
```

Create an intersection observer to maintain a list of pages that are in view.

**Returns**  
`void`

---

### _onClickImage

```typescript
_onClickImage(event: PointerEvent): void
```

Handle clicking an image to pop it out for fullscreen view.

**Parameters**

- **event**: `PointerEvent`  
  The triggering click event.

**Returns**  
`void`

---

### _onContextMenuClose

```typescript
_onContextMenuClose(target: HTMLElement): void
```

Handle closing the context menu.

**Parameters**

- **target**: `HTMLElement`  
  The element the context menu has been triggered for.

**Returns**  
`void`

---

### _onContextMenuOpen

```typescript
_onContextMenuOpen(target: HTMLElement): void
```

Handle opening the context menu.

**Parameters**

- **target**: `HTMLElement`  
  The element the context menu has been triggered for.

**Returns**  
`void`

---

### _onDragStart

```typescript
_onDragStart(event: DragEvent): void
```

Handle drag operations.

**Parameters**

- **event**: `DragEvent`

**Returns**  
`void`

---

### _onDrop

```typescript
_onDrop(event: DragEvent): Promise<any>
```

Handle drop operations.

**Parameters**

- **event**: `DragEvent`

**Returns**  
`Promise<any>`

---

### _onEditPage

```typescript
_onEditPage(event: PointerEvent, target: HTMLElement): any
```

Handle editing one of the journal entry's pages.

**Parameters**

- **event**: `PointerEvent`  
  The triggering event.
- **target**: `HTMLElement`  
  The action target.

**Returns**  
`any`

---

### _onPageScroll

```typescript
_onPageScroll(
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver,
): void
```

Handle new pages scrolling into view.

**Parameters**

- **entries**: `IntersectionObserverEntry[]`  
  An array of elements that have scrolled into or out of view.
- **observer**: `IntersectionObserver`  
  The IntersectionObserver that invoked this callback.

**Returns**  
`void`

---

### _onRevealSecret

```typescript
_onRevealSecret(event: Event): any
```

Handle toggling the revealed state of a secret embedded in some content.

**Parameters**

- **event**: `Event`  
  The triggering event.

**Returns**  
`any`

---

### _onSearchFilter

```typescript
_onSearchFilter(
    event: KeyboardEvent,
    query: string,
    rgx: RegExp,
    html: HTMLElement,
): void
```

Handle journal entry search and filtering.

**Parameters**

- **event**: `KeyboardEvent`  
  The keyboard input event.
- **query**: `string`  
  The input search string.
- **rgx**: `RegExp`  
  The regular expression query that should be matched against.
- **html**: `HTMLElement`  
  The container to filter items from.

**Returns**  
`void`

---

### _onShowPlayers

```typescript
_onShowPlayers(): void
```

Handle a request to show the JournalEntry to other Users.

**Returns**  
`void`

---

### _preparePageData

```typescript
_preparePageData(): Record<string, JournalSheetPageContext>
```

Prepare pages for display.

**Returns**  
`Record<string, JournalSheetPageContext>`

---

### _preparePagesContext

```typescript
_preparePagesContext(
    context: ApplicationRenderContext,
    options: DocumentSheetRenderOptions,
): Promise<void>
```

Prepare render context for the pages part.

**Parameters**

- **context**: `ApplicationRenderContext`
- **options**: `DocumentSheetRenderOptions`

**Returns**  
`Promise<void>`

---

### _prepareSidebarContext

```typescript
_prepareSidebarContext(
    context: ApplicationRenderContext,
    options: DocumentSheetRenderOptions,
): Promise<void>
```

Prepare render context for the sidebar part.

**Parameters**

- **context**: `ApplicationRenderContext`
- **options**: `DocumentSheetRenderOptions`

**Returns**  
`Promise<void>`

---

### _prepareTableOfContents

```typescript
_prepareTableOfContents(): Promise<(JournalSheetPageContext & JournalSheetCategoryContext)[]>
```

Prepare the sidebar table of contents.

**Returns**  
`Promise<(JournalSheetPageContext & JournalSheetCategoryContext)[]>`

---

### _renderHeadings

```typescript
_renderHeadings(
    pageNode: HTMLElement,
    toc: Record<string, JournalEntryPageHeading>,
): Promise<void>
```

Add headings to the table of contents for the given node.

**Parameters**

- **pageNode**: `HTMLElement`  
  The HTML node of the page's rendered contents.
- **toc**: `Record<string, JournalEntryPageHeading>`  
  The page's table of contents.

**Returns**  
`Promise<void>`

---

### _renderPageView

```typescript
_renderPageView(
    element: HTMLElement,
    sheet: JournalEntryPageSheet,
): Promise<void>
```

Render the page view for a page sheet.

**Parameters**

- **element**: `HTMLElement`  
  The existing page element in the journal entry view.
- **sheet**: `JournalEntryPageSheet`  
  The page sheet.

**Returns**  
`Promise<void>`

---

### _renderPageViews

```typescript
_renderPageViews(
    context: ApplicationRenderContext,
    options: DocumentSheetRenderOptions,
): Promise<void>
```

Update child views inside the main sheet.

**Parameters**

- **context**: `ApplicationRenderContext`
- **options**: `DocumentSheetRenderOptions`

**Returns**  
`Promise<void>`

---

### _setCurrentPage

```typescript
_setCurrentPage(options?: DocumentSheetRenderOptions): void
```

Update which page of the journal sheet should be currently rendered. This can be controlled  
by options passed into the render method, or by subclass override.

**Parameters**

- **options?**: `DocumentSheetRenderOptions` (optional)

**Returns**  
`void`

---

### _synchronizeSidebar

```typescript
_synchronizeSidebar(): void
```

If the set of active pages has changed, various elements in the sidebar will expand and  
collapse. For particularly long ToCs, this can leave the scroll position of the sidebar in a  
seemingly random state. We try to do our best to sync the sidebar scroll position with the  
current journal viewport.

**Returns**  
`void`

---

### _updateButtonState

```typescript
_updateButtonState(): void
```

Update the disabled state of the previous and next page buttons.

**Returns**  
`void`

---

### Static Methods

#### inheritanceChain

```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

#### parseCSSDimension

```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
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

---

#### waitForImages

```typescript
waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`  
  The element.

**Returns**  
`Promise<void>`