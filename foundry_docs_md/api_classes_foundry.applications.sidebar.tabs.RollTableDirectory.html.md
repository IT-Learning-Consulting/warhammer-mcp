# RollTableDirectory | Foundry Virtual Tabletop - API Documentation - Version 13

The **World RollTable directory listing.**

This class extends [DocumentDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html).

---

## Properties

- **options**: `Readonly<DocumentDirectoryConfiguration>`

  Application instance configuration options.  
  _Inherited from [DocumentDirectory.options](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#options)_

- **position**: `ApplicationPosition = ...`

  The current position of the application with respect to the `window.document.body`.  
  _Inherited from [DocumentDirectory.position](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#position)_

- **tabGroups**: `Record<string, null | string> = ...`

  If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.  
  _Inherited from [DocumentDirectory.tabGroups](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#tabGroups)_

### Static Properties

- **BASE_APPLICATION**: `typeof ApplicationV2 = ApplicationV2`

  Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.  
  _Inherited from [DocumentDirectory.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#BASE_APPLICATION)_

- **DEFAULT_OPTIONS**: `{ collection: string } = ...`

  Overrides `DocumentDirectory.DEFAULT_OPTIONS`.

- **emittedEvents**: `readonly [ "render", "close", "position", "activate", "deactivate"] = ...`

  _Inherited from [DocumentDirectory.emittedEvents](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#emittedEvents)_

- **PARTS**: `{
    directory: { scrollable: string[]; template: string };
    footer: { template: string };
    header: { template: string };
  } = ...`

  _Inherited from [DocumentDirectory.PARTS](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#PARTS)_

- **RENDER_STATES**: `Record<string, number> = ...`

  The sequence of rendering states that describe the Application life-cycle.  
  _Inherited from [DocumentDirectory.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#RENDER_STATES)_

- **tabName**: `string = "tables"`

  Overrides `DocumentDirectory.tabName`.

- **TABS**: `Record<string, ApplicationTabsConfiguration> = {}`

  Configuration of application tabs, with an entry per tab group.

### Protected Static Properties

- **_entryPartial**: `string = "templates/sidebar/partials/document-partial.hbs"`

  The path to the template used to render a single entry within the directory.  
  _Inherited from [DocumentDirectory._entryPartial](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_entryPartial)_

- **_folderPartial**: `string = "templates/sidebar/partials/folder-partial.hbs"`

  The path to the template used to render a single folder within the directory.  
  _Inherited from [DocumentDirectory._folderPartial](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_folderPartial)_

---

## Accessors

- **active**: `boolean`

  Whether this tab is currently active in the sidebar.  
  _Inherited from [DocumentDirectory.active](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#active)_

- **classList**: `DOMTokenList`

  The CSS class list of this Application instance.  
  _Inherited from [DocumentDirectory.classList](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#classList)_

- **collection**: `DirectoryCollection`

  The Document collection that this directory represents.  
  _Inherited from [DocumentDirectory.collection](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#collection)_

- **documentClass**: `Constructor<TDocument>`

  The implementation of the Document type that this directory represents.  
  _Inherited from [DocumentDirectory.documentClass](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#documentClass)_

- **documentName**: `string`

  The named Document type that this directory represents.  
  _Inherited from [DocumentDirectory.documentName](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#documentName)_

- **element**: `HTMLElement`

  The HTMLElement which renders this Application into the DOM.  
  _Inherited from [DocumentDirectory.element](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#element)_

- **form**: `null | HTMLFormElement`

  Does this Application have a top-level form element?  
  _Inherited from [DocumentDirectory.form](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#form)_

- **hasFrame**: `boolean`

  Does this Application instance render within an outer window frame?  
  _Inherited from [DocumentDirectory.hasFrame](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#hasFrame)_

- **id**: `string`

  The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.  
  _Inherited from [DocumentDirectory.id](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#id)_

- **isPopout**: `boolean`

  Whether this is the popped-out tab or the in-sidebar one.  
  _Inherited from [DocumentDirectory.isPopout](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#isPopout)_

- **minimized**: `boolean`

  Is this Application instance currently minimized?  
  _Inherited from [DocumentDirectory.minimized](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#minimized)_

- **popout**: `void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>`

  A reference to the popped-out version of this tab, if one exists.  
  _Inherited from [DocumentDirectory.popout](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#popout)_

- **rendered**: `boolean`

  Is this Application instance currently rendered?  
  _Inherited from [DocumentDirectory.rendered](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#rendered)_

- **state**: `number`

  The current render state of the Application.  
  _Inherited from [DocumentDirectory.state](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#state)_

- **tabName**: `string`

  The base name of the sidebar tab.  
  _Inherited from [DocumentDirectory.tabName](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#tabName)_

- **title**: `string`

  _Inherited from [DocumentDirectory.title](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#title)_

- **window**:  
  ```typescript
  {
    close: HTMLButtonElement;
    content: HTMLElement;
    controls: HTMLButtonElement;
    controlsDropdown: HTMLDivElement;
    header: HTMLElement;
    icon: HTMLElement;
    onDrag: Function;
    onResize: Function;
    pointerMoveThrottle: boolean;
    pointerStartPosition: ApplicationPosition;
    resize: HTMLElement;
    title: HTMLHeadingElement;
  }
  ```
  
  Convenience references to window header elements.  
  _Inherited from [DocumentDirectory.window](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#window)_

---

## Methods

### _canRender

```typescript
_canRender(options: any): false | void
```

- **Parameters:**

  - **options**: `any`

- **Returns:** `false | void`

- _Inherit Doc_  
  _Inherited from [DocumentDirectory._canRender](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_canRender)_

---

### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

- **Parameters:**

  - **options**: `any`

- **Returns:** `any`

- _Inherit Doc_  
  _Inherited from [DocumentDirectory._configureRenderParts](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_configureRenderParts)_

---

### _getEntryContextOptions

```typescript
_getEntryContextOptions(): (ContextMenuEntry | { callback: (li: any) => void; icon: string; name: string })[]
```

- **Returns:**  
  `ContextMenuEntry | { callback: (li: any) => void; icon: string; name: string }[]`

- _Inherit Doc_  
  Overrides [DocumentDirectory._getEntryContextOptions](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_getEntryContextOptions)

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

- **Parameters:**

  - **options**: `any`

- **Returns:** `any`

- _Inherit Doc_  
  _Inherited from [DocumentDirectory._initializeApplicationOptions](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_initializeApplicationOptions)_

---

### _onClose

```typescript
_onClose(options: any): void
```

- **Parameters:**

  - **options**: `any`

- **Returns:** `void`

- _Inherit Doc_  
  _Inherited from [DocumentDirectory._onClose](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onClose)_

---

### _onDragStart

```typescript
_onDragStart(event: any): void
```

- **Parameters:**

  - **event**: `any`

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onDragStart](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onDragStart)_

---

### _onDrop

```typescript
_onDrop(event: any): undefined | Promise<void>
```

- **Parameters:**

  - **event**: `any`

- **Returns:** `undefined | Promise<void>`

- _Inherited from [DocumentDirectory._onDrop](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onDrop)_

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

- **Parameters:**

  - **context**: `any`
  - **options**: `any`

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._onFirstRender](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onFirstRender)_

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

- **Parameters:**

  - **context**: `any`
  - **options**: `any`

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._onRender](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onRender)_

---

### _prepareContext

```typescript
_prepareContext(
  options: any,
): Promise<
  ApplicationRenderContext & {
    canCreateEntry: boolean;
    canCreateFolder: boolean;
    documentName: string;
    folderIcon: string;
    sidebarIcon: any;
  }
>
```

- **Parameters:**

  - **options**: `any`

- **Returns:**  
  `Promise<ApplicationRenderContext & { canCreateEntry: boolean; canCreateFolder: boolean; documentName: string; folderIcon: string; sidebarIcon: any; }>`

- _Inherited from [DocumentDirectory._prepareContext](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_prepareContext)_

---

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

- **Parameters:**

  - **partId**: `any`
  - **context**: `any`
  - **options**: `any`

- **Returns:** `Promise<any>`

- _Inherited from [DocumentDirectory._preparePartContext](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_preparePartContext)_

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

- **Parameters:**

  - **partId**: `any`
  - **newElement**: `any`
  - **priorElement**: `any`
  - **state**: `any`

- **Returns:** `void`

- _Inherited from [DocumentDirectory._preSyncPartState](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_preSyncPartState)_

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

- **Parameters:**

  - **options**: `any`

- **Returns:** `Promise<HTMLElement>`

- _Inherited from [DocumentDirectory._renderFrame](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_renderFrame)_

---

### _renderHTML

```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.

- **Parameters:**

  - **context**: `ApplicationRenderContext` — Context data for the render operation
  - **options**: `HandlebarsRenderOptions` — Options which configure application rendering behavior

- **Returns:** `Promise<any>` — The result of HTML rendering may be implementation specific. Whatever value is returned here is passed to _replaceHTML.

- _Inherited from [DocumentDirectory._renderHTML](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_renderHTML)_

---

### _syncPartState

```typescript
_syncPartState(
  partId: any,
  newElement: any,
  priorElement: any,
  state: any,
): void
```

- **Parameters:**

  - **partId**: `any`
  - **newElement**: `any`
  - **priorElement**: `any`
  - **state**: `any`

- **Returns:** `void`

- _Inherited from [DocumentDirectory._syncPartState](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_syncPartState)_

---

### activate

```typescript
activate(): void
```

Activate this tab in the sidebar.

- **Returns:** `void`

- _Inherited from [DocumentDirectory.activate](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#activate)_

---

### addEventListener

```typescript
addEventListener(
  type: string,
  listener: EmittedEventListener,
  options?: { once?: boolean },
): void
```

Add a new event listener for a certain type of event.

- **Parameters:**

  - **type**: `string` — The type of event being registered for
  - **listener**: `EmittedEventListener` — The listener function called when the event occurs
  - **options?**: `{ once?: boolean } = {}` — Options which configure the event listener
    - **once?**: `boolean` — Should the event only be responded to once and then removed

- **Returns:** `void`

- See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
  _Inherited from [DocumentDirectory.addEventListener](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#addEventListener)_

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index. Once ApplicationV1 is deprecated we should switch from `_maxZ` to `ApplicationV2#maxZ`. We should also eliminate `ui.activeWindow` in favor of only `ApplicationV2#frontApp`.

- **Returns:** `void`

- _Inherited from [DocumentDirectory.bringToFront](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#bringToFront)_

---

### changeTab

```typescript
changeTab(
  tab: string,
  group: string,
  options?: {
    event?: Event;
    force?: boolean;
    navElement?: HTMLElement;
    updatePosition?: boolean;
  },
): void
```

Change the active tab within a tab group in this Application instance.

- **Parameters:**

  - **tab**: `string` — The name of the tab which should become active
  - **group**: `string` — The name of the tab group which defines the set of tabs
  - **options?**:
    - **event?**: `Event` — An interaction event which caused the tab change, if any
    - **force?**: `boolean` — Force changing the tab even if the new tab is already active
    - **navElement?**: `HTMLElement` — An explicit navigation element being modified
    - **updatePosition?**: `boolean` — Update application position after changing the tab?

- **Returns:** `void`

- _Inherited from [DocumentDirectory.changeTab](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#changeTab)_

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<RollTableDirectory>
```

Close the Application, removing it from the DOM.

- **Parameters:**

  - **options?**: `Partial<ApplicationClosingOptions> = {}` — Options which modify how the application is closed.

- **Returns:** `Promise<RollTableDirectory>` — A Promise which resolves to the closed Application instance

- _Inherited from [DocumentDirectory.close](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#close)_

---

### collapseAll

```typescript
collapseAll(): void
```

Collapse all open folders in this directory.

- **Returns:** `void`

- _Inherited from [DocumentDirectory.collapseAll](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#collapseAll)_

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

- **Parameters:**

  - **event**: `Event` — The Event to dispatch

- **Returns:** `boolean` — Was default behavior for the event prevented?

- See [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
  _Inherited from [DocumentDirectory.dispatchEvent](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#dispatchEvent)_

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory.maximize](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#maximize)_

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory.minimize](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#minimize)_

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

- **Parameters:**

  - **type**: `string` — The type of event being removed
  - **listener**: `EmittedEventListener` — The listener function being removed

- **Returns:** `void`

- See [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
  _Inherited from [DocumentDirectory.removeEventListener](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#removeEventListener)_

---

### render

```typescript
render(options: any, _options: any): Promise<RollTableDirectory>
```

- **Parameters:**

  - **options**: `any`
  - **_options**: `any`

- **Returns:** `Promise<RollTableDirectory>`

- _Inherited from [DocumentDirectory.render](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#render)_

---

### renderPopout

```typescript
renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>
```

Pop-out this sidebar tab as a new application.

- **Returns:** `Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>`

- _Inherited from [DocumentDirectory.renderPopout](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#renderPopout)_

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

- **Parameters:**

  - **position?**: `Partial<ApplicationPosition>` - New Application positioning data

- **Returns:** `void | ApplicationPosition` - The updated application position

- _Inherited from [DocumentDirectory.setPosition](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#setPosition)_

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

- **Parameters:**

  - **submitOptions?**: `object = {}` - Arbitrary options which are supported by and provided to the configured form submission handler.

- **Returns:** `Promise<any>` - A promise that resolves to the returned result of the form submission handler, if any.

- _Inherited from [DocumentDirectory.submit](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#submit)_

---

### toggleControls

```typescript
toggleControls(expanded?: boolean, options?: { animate?: boolean }): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

- **Parameters:**

  - **expanded?**: `boolean` — Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value.
  - **options?**: `{ animate?: boolean } = {}` — Options to configure the toggling behavior.
    - **animate?**: `boolean` — Animate the controls toggling.

- **Returns:** `Promise<void>` — A Promise which resolves once the control expansion animation is complete.

- _Inherited from [DocumentDirectory.toggleControls](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#toggleControls)_

---

### _attachFrameListeners

```typescript
protected _attachFrameListeners(): void
```

Attach event listeners to the Application frame.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._attachFrameListeners](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_attachFrameListeners)_

---

### _canCreateEntry

```typescript
protected _canCreateEntry(): boolean
```

Determine if the current user has permission to create directory entries.

- **Returns:** `boolean`

- _Inherited from [DocumentDirectory._canCreateEntry](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_canCreateEntry)_

---

### _canCreateFolder

```typescript
protected _canCreateFolder(): boolean
```

Determine if the current user has permission to create folders in this directory.

- **Returns:** `boolean`

- _Inherited from [DocumentDirectory._canCreateFolder](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_canCreateFolder)_

---

### _canDragDrop

```typescript
protected _canDragDrop(selector: string): boolean
```

Determine if drop operations are permitted.

- **Parameters:**

  - **selector**: `string` — The candidate HTML selector for dragging

- **Returns:** `boolean` — Can the current user drag this selector?

- _Inherited from [DocumentDirectory._canDragDrop](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_canDragDrop)_

---

### _canDragStart

```typescript
protected _canDragStart(selector: string): boolean
```

Determine if drag operations are permitted.

- **Parameters:**

  - **selector**: `string` — The candidate HTML selector for dragging

- **Returns:** `boolean` — Can the current user drag this selector?

- _Inherited from [DocumentDirectory._canDragStart](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_canDragStart)_

---

### _configureRenderOptions

```typescript
protected _configureRenderOptions(options: HandlebarsRenderOptions): void
```

Modify the provided options passed to a render request.

- **Parameters:**

  - **options**: `HandlebarsRenderOptions` — Options which configure application rendering behavior

- **Returns:** `void`

- _Inherited from [DocumentDirectory._configureRenderOptions](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_configureRenderOptions)_

---

### _createContextMenu

```typescript
protected _createContextMenu(
  handler: () => ContextMenuEntry[],
  selector: string,
  options?: {
    container?: HTMLElement;
    hookName?: string;
    parentClassHooks?: boolean;
  }
): null | ContextMenu
```

Create a ContextMenu instance used in this Application.

- **Parameters:**

  - **handler**: `() => ContextMenuEntry[]` — A handler function that provides initial context options
  - **selector**: `string` — A CSS selector to which the ContextMenu will be bound
  - **options?**:
    - **container?**: `HTMLElement` — A parent HTMLElement which contains the selector target
    - **hookName?**: `string` — The hook name
    - **parentClassHooks?**: `boolean` — Whether to call hooks for the parent classes in the inheritance chain.

- **Returns:** `null | ContextMenu` — A created ContextMenu or null if no menu items were defined

- _Inherited from [DocumentDirectory._createContextMenu](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_createContextMenu)_

---

### _createContextMenus

```typescript
protected _createContextMenus(): void
```

Register context menu entries and fire hooks.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._createContextMenus](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_createContextMenus)_

---

### _createDroppedEntry

```typescript
protected _createDroppedEntry(
  entry: DirectoryMixinEntry,
  updates?: object,
): Promise<documents.RollTable>
```

Create a new entry in this directory from one that was dropped on it.

- **Parameters:**

  - **entry**: `DirectoryMixinEntry` — The dropped entry.
  - **updates?**: `object = {}` — Modifications to the creation data.

- **Returns:** `Promise<documents.RollTable>`

- _Inherited from [DocumentDirectory._createDroppedEntry](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_createDroppedEntry)_

---

### _createDroppedFolderContent

```typescript
protected _createDroppedFolderContent(
  folder: documents.Folder,
  targetFolder?: documents.Folder,
): Promise<documents.Folder[]>
```

Import a dropped folder and its children into this collection if they do not already exist.

- **Parameters:**

  - **folder**: `documents.Folder` — The folder being dropped.
  - **targetFolder?**: `documents.Folder` — A folder to import into if not the directory root.

- **Returns:** `Promise<documents.Folder[]>`

- _Inherited from [DocumentDirectory._createDroppedFolderContent](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_createDroppedFolderContent)_

---

### _createDroppedFolderDocuments

```typescript
protected _createDroppedFolderDocuments(
  folder: documents.Folder,
  documents: object[] | documents.RollTable[],
): Promise<void>
```

Create a set of documents in a dropped folder.

- **Parameters:**

  - **folder**: `documents.Folder` — The dropped folder.
  - **documents**: `object[] | documents.RollTable[]` — The documents to create, or their indices.

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._createDroppedFolderDocuments](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_createDroppedFolderDocuments)_

---

### _entryAlreadyExists

```typescript
protected _entryAlreadyExists(entry: ClientDocument): boolean
```

Test if the given entry is already present in this directory.

- **Parameters:**

  - **entry**: `ClientDocument` — The directory entry.

- **Returns:** `boolean`

- _Inherited from [DocumentDirectory._entryAlreadyExists](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_entryAlreadyExists)_

---

### _entryBelongsToFolder

```typescript
protected _entryBelongsToFolder(entry: DirectoryMixinEntry, folder: string): boolean
```

Determine whether a given directory entry belongs to the given folder.

- **Parameters:**

  - **entry**: `DirectoryMixinEntry` — The entry.
  - **folder**: `string` — The target folder ID.

- **Returns:** `boolean`

- _Inherited from [DocumentDirectory._entryBelongsToFolder](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_entryBelongsToFolder)_

---

### _getDroppedEntryFromData

```typescript
protected _getDroppedEntryFromData(data: object): Promise<ClientDocument>
```

Get the entry instance from its dropped data.

- **Parameters:**

  - **data**: `object` — The drag data.

- **Returns:** `Promise<ClientDocument>`

- **Throws:** If the correct instance type could not be retrieved.

- _Inherited from [DocumentDirectory._getDroppedEntryFromData](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_getDroppedEntryFromData)_

---

### _getEntryDragData

```typescript
protected _getEntryDragData(entryId: string): any
```

Get drag data for an entry in this directory.

- **Parameters:**

  - **entryId**: `string` — The entry's ID.

- **Returns:** `any`

- _Inherited from [DocumentDirectory._getEntryDragData](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_getEntryDragData)_

---

### _getFolderContextOptions

```typescript
protected _getFolderContextOptions(): ContextMenuEntry[]
```

Get context menu entries for folders in this directory.

- **Returns:** `ContextMenuEntry[]`

- _Inherited from [DocumentDirectory._getFolderContextOptions](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_getFolderContextOptions)_

---

### _getFolderDragData

```typescript
protected _getFolderDragData(folderId: string): any
```

Get drag data for a folder in this directory.

- **Parameters:**

  - **folderId**: `string` — The folder ID.

- **Returns:** `any`

- _Inherited from [DocumentDirectory._getFolderDragData](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_getFolderDragData)_

---

### _getHeaderControls

```typescript
protected _getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

- **Returns:** `ApplicationHeaderControlsEntry[]`

- _Inherited from [DocumentDirectory._getHeaderControls](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_getHeaderControls)_

---

### _getTabsConfig

```typescript
protected _getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

- **Parameters:**

  - **group**: `string` — The ID of a tabs group

- **Returns:** `null | ApplicationTabsConfiguration`

- _Inherited from [DocumentDirectory._getTabsConfig](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_getTabsConfig)_

---

### _handleDroppedEntry

```typescript
protected _handleDroppedEntry(target: HTMLElement, data: object): Promise<void>
```

Handle dropping a new entry into this directory.

- **Parameters:**

  - **target**: `HTMLElement` — The drop target element.
  - **data**: `object` — The drop data.

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._handleDroppedEntry](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_handleDroppedEntry)_

---

### _handleDroppedFolder

```typescript
protected _handleDroppedFolder(target: HTMLElement, data: object): Promise<void>
```

Handle dropping a folder onto the directory.

- **Parameters:**

  - **target**: `HTMLElement` — The drop target element.
  - **data**: `object` — The drop data.

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._handleDroppedFolder](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_handleDroppedFolder)_

---

### _handleDroppedForeignFolder

```typescript
protected _handleDroppedForeignFolder(
  folder: documents.Folder,
  closestFolderId: string,
  sortData: object,
): Promise<null | { folder: documents.Folder; sortNeeded: boolean }>
```

Handle importing a new folder's into the directory.

- **Parameters:**

  - **folder**: `documents.Folder` — The dropped folder.
  - **closestFolderId**: `string` — The ID of the closest folder to the drop target.
  - **sortData**: `object` — Sort data for the folder.

- **Returns:** `Promise<null | { folder: documents.Folder; sortNeeded: boolean }>`

- _Inherited from [DocumentDirectory._handleDroppedForeignFolder](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_handleDroppedForeignFolder)_

---

### _headerControlButtons

```typescript
protected _headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

- **Returns:**  
  `Generator<ApplicationHeaderControlsEntry, any, any>`

- _Inherited from [DocumentDirectory._headerControlButtons](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_headerControlButtons)_

---

### _insertElement

```typescript
protected _insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

- **Parameters:**

  - **element**: `HTMLElement` — The element to insert

- **Returns:** `void`

- _Inherited from [DocumentDirectory._insertElement](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_insertElement)_

---

### _matchSearchEntries

```typescript
protected _matchSearchEntries(
  query: RegExp,
  entryIds: Set<string>,
  folderIds: Set<string>,
  autoExpandIds: Set<string>,
  options?: object,
): void
```

Identify entries in the collection which match a provided search query.

- **Parameters:**

  - **query**: `RegExp` — The search query.
  - **entryIds**: `Set<string>` — The set of matched entry IDs.
  - **folderIds**: `Set<string>` — The set of matched folder IDs.
  - **autoExpandIds**: `Set<string>` — The set of folder IDs that should be auto-expanded.
  - **options?**: `object = {}` — Additional options for subclass-specific behavior.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._matchSearchEntries](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_matchSearchEntries)_

---

### _matchSearchFolders

```typescript
protected _matchSearchFolders(
  query: RegExp,
  folderIds: Set<string>,
  autoExpandIds: Set<string>,
  options?: object,
): void
```

Identify folders in the collection which match a provided search query.

- **Parameters:**

  - **query**: `RegExp` — The search query.
  - **folderIds**: `Set<string>` — The set of matched folder IDs.
  - **autoExpandIds**: `Set<string>` — The set of folder IDs that should be auto-expanded.
  - **options?**: `object = {}` — Additional options for subclass-specific behavior.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._matchSearchFolders](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_matchSearchFolders)_

---

### _onActivate

```typescript
protected _onActivate(): void
```

Actions performed when this tab is activated in the sidebar.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onActivate](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onActivate)_

---

### _onChangeForm

```typescript
protected _onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

- **Parameters:**

  - **formConfig**: `ApplicationFormConfiguration` — The form configuration for which this handler is bound
  - **event**: `Event` — An input change event within the form

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onChangeForm](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onChangeForm)_

---

### _onClickAction

```typescript
protected _onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.

- **Parameters:**

  - **event**: `PointerEvent` — The originating click event
  - **target**: `HTMLElement` — The capturing HTML element which defined a `[data-action]`

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onClickAction](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onClickAction)_

---

### _onClickEntry

```typescript
protected _onClickEntry(
  event: PointerEvent,
  target: HTMLElement,
  options?: { _skipDeprecation?: boolean },
): Promise<void>
```

Handle activating a directory entry.

- **Parameters:**

  - **event**: `PointerEvent` — The triggering click event.
  - **target**: `HTMLElement` — The action target element.
  - **options?**: `{ _skipDeprecation?: boolean } = {}`  
    - **_skipDeprecation?**: `boolean` — Internal use only.

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._onClickEntry](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onClickEntry)_

---

### _onClickTab

```typescript
protected _onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

- **Parameters:**

  - **event**: `PointerEvent`

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onClickTab](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onClickTab)_

---

### _onCreateEntry

```typescript
protected _onCreateEntry(event: PointerEvent, target: HTMLElement): any
```

Handle creating a new entry in this directory.

- **Parameters:**

  - **event**: `PointerEvent` — The triggering click event.
  - **target**: `HTMLElement` — The action target element.

- **Returns:** `any`

- _Inherited from [DocumentDirectory._onCreateEntry](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onCreateEntry)_

---

### _onCreateFolder

```typescript
protected _onCreateFolder(event: PointerEvent, target: HTMLElement): void
```

Handle creating a new folder in this directory.

- **Parameters:**

  - **event**: `PointerEvent` — The triggering click event.
  - **target**: `HTMLElement` — The action target element.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onCreateFolder](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onCreateFolder)_

---

### _onDeactivate

```typescript
protected _onDeactivate(): void
```

Actions performed when this tab is deactivated in the sidebar.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onDeactivate](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onDeactivate)_

---

### _onDragHighlight

```typescript
protected _onDragHighlight(event: DragEvent): void
```

Highlight folders as drop targets when a drag event enters or exits their area.

- **Parameters:**

  - **event**: `DragEvent` — The in-progress drag event.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onDragHighlight](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onDragHighlight)_

---

### _onDragOver

```typescript
protected _onDragOver(event: DragEvent): void
```

Handle drag events over the directory.

- **Parameters:**

  - **event**: `DragEvent`

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onDragOver](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onDragOver)_

---

### _onMatchSearchEntry

```typescript
protected _onMatchSearchEntry(
  query: string,
  entryIds: Set<string>,
  element: HTMLElement,
  options?: object,
): void
```

Handle matching a given directory entry with the search filter.

- **Parameters:**

  - **query**: `string` — The input search string.
  - **entryIds**: `Set<string>` — The matched directory entry IDs.
  - **element**: `HTMLElement` — The candidate entry element.
  - **options?**: `object = {}` — Additional options for subclass-specific behavior.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onMatchSearchEntry](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onMatchSearchEntry)_

---

### _onPosition

```typescript
protected _onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

- **Parameters:**

  - **position**: `ApplicationPosition` — The requested application position

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onPosition](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onPosition)_

---

### _onSearchFilter

```typescript
protected _onSearchFilter(
  event: KeyboardEvent,
  query: string,
  rgx: RegExp,
  html: HTMLElement,
): void
```

Handle directory searching and filtering.

- **Parameters:**

  - **event**: `KeyboardEvent` — The keyboard input event.
  - **query**: `string` — The input search string.
  - **rgx**: `RegExp` — The regular expression query that should be matched against.
  - **html**: `HTMLElement` — The container to filter entries from.

- **Returns:** `void`

- _Inherited from [DocumentDirectory._onSearchFilter](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onSearchFilter)_

---

### _onSubmitForm

```typescript
protected _onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.

- **Parameters:**

  - **formConfig**: `ApplicationFormConfiguration` — The form configuration for which this handler is bound
  - **event**: `Event` | `SubmitEvent` — The form submission event

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._onSubmitForm](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onSubmitForm)_

---

### _onToggleFolder

```typescript
protected _onToggleFolder(
  event: PointerEvent,
  target: HTMLElement,
  options?: { _skipDeprecation?: boolean },
): any
```

Handle toggling a folder's expanded state.

- **Parameters:**

  - **event**: `PointerEvent` — The triggering click event.
  - **target**: `HTMLElement` — The action target element.
  - **options?**: `{ _skipDeprecation?: boolean } = {}`  
    - **_skipDeprecation?**: `boolean` — Internal use only.

- **Returns:** `any`

- _Inherited from [DocumentDirectory._onToggleFolder](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_onToggleFolder)_

---

### _organizeDroppedFoldersAndDocuments

```typescript
protected _organizeDroppedFoldersAndDocuments(
  folder: documents.Folder,
  targetFolder?: documents.Folder
): Promise<{
  documentsToCreate: object[] | documents.RollTable[];
  foldersToCreate: documents.Folder[];
}>
```

Organize a dropped folder and its children into a list of folders and documents to create.

- **Parameters:**

  - **folder**: `documents.Folder` — The dropped folder.
  - **targetFolder?**: `documents.Folder` — A folder to import into if not the directory root.

- **Returns:**  
  `Promise<{
    documentsToCreate: object[] | documents.RollTable[];
    foldersToCreate: documents.Folder[];
  }>`

- _Inherited from [DocumentDirectory._organizeDroppedFoldersAndDocuments](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_organizeDroppedFoldersAndDocuments)_

---

### _preClose

```typescript
protected _preClose(options: HandlebarsRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close process.

- **Parameters:**

  - **options**: `HandlebarsRenderOptions` — Provided render options

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._preClose](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_preClose)_

---

### _preFirstRender

```typescript
protected _preFirstRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```

Actions performed before a first render of the Application.

- **Parameters:**

  - **context**: `ApplicationRenderContext` — Prepared context data
  - **options**: `HandlebarsRenderOptions` — Provided render options

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._preFirstRender](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_preFirstRender)_

---

### _prepareDirectoryContext

```typescript
protected _prepareDirectoryContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the directory part.

- **Parameters:**

  - **context**: `ApplicationRenderContext`
  - **options**: `HandlebarsRenderOptions`

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._prepareDirectoryContext](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_prepareDirectoryContext)_

---

### _prepareFooterContext

```typescript
protected _prepareFooterContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the footer part.

- **Parameters:**

  - **context**: `ApplicationRenderContext`
  - **options**: `HandlebarsRenderOptions`

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._prepareFooterContext](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_prepareFooterContext)_

---

### _prepareHeaderContext

```typescript
protected _prepareHeaderContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the header part.

- **Parameters:**

  - **context**: `ApplicationRenderContext`
  - **options**: `HandlebarsRenderOptions`

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._prepareHeaderContext](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_prepareHeaderContext)_

---

### _prepareTabs

```typescript
protected _prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

- **Parameters:**

  - **group**: `string` — The ID of the tab group to prepare

- **Returns:** `Record<string, ApplicationTab>`

- _Inherited from [DocumentDirectory._prepareTabs](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_prepareTabs)_

---

### _prePosition

```typescript
protected _prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are **not** awaited because setPosition is synchronous.

- **Parameters:**

  - **position**: `ApplicationPosition` — The requested application position

- **Returns:** `void`

- _Inherited from [DocumentDirectory._prePosition](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_prePosition)_

---

### _preRender

```typescript
protected _preRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

- **Parameters:**

  - **context**: `ApplicationRenderContext` — Prepared context data
  - **options**: `HandlebarsRenderOptions` — Provided render options

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory._preRender](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_preRender)_

---

### _removeElement

```typescript
protected _removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

- **Parameters:**

  - **element**: `HTMLElement` — The element to be removed

- **Returns:** `void`

- _Inherited from [DocumentDirectory._removeElement](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_removeElement)_

---

### _renderHeaderControl

```typescript
protected _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

- **Parameters:**

  - **control**: `ApplicationHeaderControlsEntry`

- **Returns:** `HTMLLIElement`

- _Inherited from [DocumentDirectory._renderHeaderControl](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_renderHeaderControl)_

---

### _replaceHTML

```typescript
protected _replaceHTML(
  result: any,
  content: HTMLElement,
  options: HandlebarsRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.

- **Parameters:**

  - **result**: `any` — The result returned by the application rendering backend
  - **content**: `HTMLElement` — The content element into which the rendered result must be inserted
  - **options**: `HandlebarsRenderOptions` — Options which configure application rendering behavior

- **Returns:** `void`

- _Inherited from [DocumentDirectory._replaceHTML](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_replaceHTML)_

---

### _tearDown

```typescript
protected _tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application closure.

- **Parameters:**

  - **options**: `ApplicationClosingOptions`

- **Returns:** `void`

- _Inherited from [DocumentDirectory._tearDown](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_tearDown)_

---

### _updateFrame

```typescript
protected _updateFrame(options: HandlebarsRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

- **Parameters:**

  - **options**: `HandlebarsRenderOptions` — Options provided at render-time

- **Returns:** `void`

- _Inherited from [DocumentDirectory._updateFrame](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_updateFrame)_

---

### _updatePosition

```typescript
protected _updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.

- **Parameters:**

  - **position**: `ApplicationPosition` — Requested Application positioning data

- **Returns:** `ApplicationPosition` — Resolved Application positioning data

- _Inherited from [DocumentDirectory._updatePosition](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#_updatePosition)_

---

### inheritanceChain (Static)

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

- **Returns:**  
  `Generator<typeof ApplicationV2, void, unknown>`

- See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

- _Inherited from [DocumentDirectory.inheritanceChain](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#inheritanceChain)_

---

### parseCSSDimension (Static)

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

- **Parameters:**

  - **style**: `string` — The CSS style rule
  - **parentDimension**: `number` — The relevant dimension of the parent element

- **Returns:** `number | void` — The parsed style dimension in pixels

- _Inherited from [DocumentDirectory.parseCSSDimension](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#parseCSSDimension)_

---

### waitForImages (Static)

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

- **Parameters:**

  - **element**: `HTMLElement`

- **Returns:** `Promise<void>`

- _Inherited from [DocumentDirectory.waitForImages](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html#waitForImages)_

---

For full details, visit the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.RollTableDirectory.html).