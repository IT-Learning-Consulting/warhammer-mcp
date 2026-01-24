# PlaylistDirectory

The World Playlist directory listing.

## Hierarchy
- [DocumentDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html)
- **PlaylistDirectory**

---

## Properties

### options
- **Type:** `Readonly<DocumentDirectoryConfiguration>`
- **Description:** Application instance configuration options.  
  Inherited from DocumentDirectory.options.

### position
- **Type:** `ApplicationPosition = ...`
- **Description:** The current position of the application with respect to the window.document.body.  
  Inherited from DocumentDirectory.position.

### tabGroups
- **Type:** `Record<string, null | string> = ...`
- **Description:**  
  If this Application uses tabbed navigation groups, this mapping is updated whenever the  
  `changeTab` method is called. Reports the active tab for each group, with a value of `null`  
  indicating no tab is active. Subclasses may override this property to define default tabs for  
  each group.  
  Inherited from DocumentDirectory.tabGroups.

### _expanded  _(protected)_
- **Type:** `Set<string> = ...`
- **Description:** Track the playlist IDs which are currently expanded in the display.

### _playing  _(protected)_
- **Type:**  
  ```typescript
  {
    context: PlaylistSoundRenderContext[];
    playlists: documents.Playlist[];
    sounds: documents.PlaylistSound[];
  } = ...
  ```
- **Description:** Cache the set of Playlist and PlaylistSound documents that are displayed as playing when the directory is rendered.

### _volumeExpanded  _(protected)_
- **Type:** `boolean = true`
- **Description:** Whether the global volume controls are currently expanded.

### _entryPartial** _(static)_
- **Type:** `string = "templates/sidebar/tabs/playlist/playlist-partial.hbs"`
- **Description:** Overrides DocumentDirectory._entryPartial.

### BASE_APPLICATION**  _(static)_
- **Type:** `typeof ApplicationV2 = ApplicationV2`
- **Description:**  
  Designates which upstream Application class in this class' inheritance chain is the base  
  application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
  BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
  BASE_APPLICATION are not dispatched.  
  Inherited from DocumentDirectory.BASE_APPLICATION.

### DEFAULT_OPTIONS**  _(static)_
- **Type:**  
  ```typescript
  {
    actions: {
      pinCurrentlyPlaying: (...this: any) => void;
      playlistBackward: (...this: any, event: PointerEvent, target: HTMLElement) => any;
      playlistForward: (...this: any, event: PointerEvent, target: HTMLElement) => any;
      playlistMode: (...this: any, event: PointerEvent, target: HTMLElement) => any;
      playlistPlay: (...this: any, event: PointerEvent, target: HTMLElement) => any;
      playlistStop: (...this: any, event: PointerEvent, target: HTMLElement) => any;
      soundCreate: (...this: any, event: PointerEvent, target: HTMLElement) => void;
      soundPause: (...this: any, event: PointerEvent, target: HTMLElement) => any;
      soundPlay: (...this: any, event: PointerEvent, target: HTMLElement) => any;
      soundRepeat: (...this: any, event: PointerEvent, target: HTMLElement) => any;
      soundStop: (...this: any, event: PointerEvent, target: HTMLElement) => any;
      volumeExpand: (...this: any, event: PointerEvent, target: HTMLElement) => void;
    };
    collection: string;
    renderUpdateKeys: string[];
  } = ...
  ```
- **Description:** Overrides DocumentDirectory.DEFAULT_OPTIONS.

### emittedEvents**  _(static)_
- **Type:**  
  ```typescript
  readonly [
    "render",
    "close",
    "position",
    "activate",
    "deactivate",
  ] = ...
  ```
- **Description:** Inherited from DocumentDirectory.emittedEvents.

### PARTS**  _(static)_
- **Type:**  
  ```typescript
  {
    controls: { template: string };
    directory: { scrollable: string[]; template: string };
    footer: { template: string };
    header: { template: string };
    playing: { template: string; templates: string[] };
  } = ...
  ```
- **Description:** Overrides DocumentDirectory.PARTS.

### PLAYLIST_MODES**  _(static)_
- **Type:**  
  ```typescript
  Record<
    Readonly<{ DISABLED: -1; SEQUENTIAL: 0; SHUFFLE: 1; SIMULTANEOUS: 2 }>,
    PlaylistDirectoryControlContext
  > = ...
  ```
- **Description:** Playlist mode button descriptors.

### RENDER_STATES**  _(static)_
- **Type:** `Record<string, number> = ...`
- **Description:** The sequence of rendering states that describe the Application life-cycle.

### tabName**  _(static)_
- **Type:** `string = "playlists"`
- **Description:** Overrides DocumentDirectory.tabName.

### TABS**  _(static)_
- **Type:** `Record<string, ApplicationTabsConfiguration> = {}`
- **Description:** Configuration of application tabs, with an entry per tab group.  
  Inherited from DocumentDirectory.TABS.

### _folderPartial**  _(static protected)_
- **Type:** `string = "templates/sidebar/partials/folder-partial.hbs"`
- **Description:** The path to the template used to render a single folder within the directory.  
  Inherited from DocumentDirectory._folderPartial.

---

## Accessors

### active
```typescript
get active(): boolean
```
- **Description:** Whether this tab is currently active in the sidebar.  
  Returns `boolean`.  
  Inherited from DocumentDirectory.active.

### classList
```typescript
get classList(): DOMTokenList
```
- **Description:** The CSS class list of this Application instance.  
  Returns `DOMTokenList`.  
  Inherited from DocumentDirectory.classList.

### collection
```typescript
get collection(): DirectoryCollection
```
- **Description:** The Document collection that this directory represents.  
  Returns `DirectoryCollection`.  
  Inherited from DocumentDirectory.collection.

### currentlyPlayingLocation
```typescript
get currentlyPlayingLocation(): "top" | "bottom"
```
- **Description:** The location of the currently-playing widget.  
  Returns `"top"` | `"bottom"`.

### documentClass
```typescript
get documentClass(): Constructor<TDocument>
```
- **Description:** The implementation of the Document type that this directory represents.  
  Returns `Constructor<TDocument>`.  
  Inherited from DocumentDirectory.documentClass.

### documentName
```typescript
get documentName(): string
```
- **Description:** The named Document type that this directory represents.  
  Returns `string`.  
  Inherited from DocumentDirectory.documentName.

### element
```typescript
get element(): HTMLElement
```
- **Description:** The HTMLElement which renders this Application into the DOM.  
  Returns `HTMLElement`.  
  Inherited from DocumentDirectory.element.

### form
```typescript
get form(): null | HTMLFormElement
```
- **Description:** Does this Application have a top-level form element?  
  Returns `null` | `HTMLFormElement`.  
  Inherited from DocumentDirectory.form.

### hasFrame
```typescript
get hasFrame(): boolean
```
- **Description:** Does this Application instance render within an outer window frame?  
  Returns `boolean`.  
  Inherited from DocumentDirectory.hasFrame.

### id
```typescript
get id(): string
```
- **Description:** The HTML element ID of this Application instance. This provides a readonly view into the  
  internal ID used by this application. This getter should not be overridden by subclasses,  
  which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
  _initializeApplicationOptions.  
  Returns `string`.  
  Inherited from DocumentDirectory.id.

### isPopout
```typescript
get isPopout(): boolean
```
- **Description:** Whether this is the popped-out tab or the in-sidebar one.  
  Returns `boolean`.  
  Inherited from DocumentDirectory.isPopout.

### minimized
```typescript
get minimized(): boolean
```
- **Description:** Is this Application instance currently minimized?  
  Returns `boolean`.  
  Inherited from DocumentDirectory.minimized.

### playing
```typescript
get playing(): documents.Playlist[]
```
- **Description:** The Playlist documents that are currently playing.  
  Returns `documents.Playlist[]`.

### popout
```typescript
get popout(): void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>
```
- **Description:** A reference to the popped-out version of this tab, if one exists.  
  Returns `void` | `AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>`.  
  Inherited from DocumentDirectory.popout.

### rendered
```typescript
get rendered(): boolean
```
- **Description:** Is this Application instance currently rendered?  
  Returns `boolean`.  
  Inherited from DocumentDirectory.rendered.

### state
```typescript
get state(): number
```
- **Description:** The current render state of the Application.  
  Returns `number`.  
  Inherited from DocumentDirectory.state.

### tabName
```typescript
get tabName(): string
```
- **Description:** The base name of the sidebar tab.  
  Returns `string`.  
  Inherited from DocumentDirectory.tabName.

### title
```typescript
get title(): string
```
- **Description:** Returns `string`.  
  Inherited from DocumentDirectory.title.

### window
```typescript
get window(): {
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
- **Description:** Convenience references to window header elements.  
  Returns an object with references to window components.  
  Inherited from DocumentDirectory.window.

---

## Methods

### _attachFrameListeners
```typescript
_attachFrameListeners(): void
```
- **Description:** Overrides DocumentDirectory._attachFrameListeners.

### _canRender
```typescript
_canRender(options: any): false | void
```
- **Parameters:**  
  - **options**: `any`  
- **Returns:** `false | void`  
- **Description:** Inherited from DocumentDirectory._canRender.

### _configureRenderParts
```typescript
_configureRenderParts(options: any): any
```
- **Parameters:**  
  - **options**: `any`  
- **Returns:** `any`  
- **Description:** Inherited from DocumentDirectory._configureRenderParts.

### _createContextMenus
```typescript
_createContextMenus(): void
```
- **Description:** Overrides DocumentDirectory._createContextMenus.

### _getEntryContextOptions
```typescript
_getEntryContextOptions(): {
  callback: (header: any) => any;
  icon: string;
  name: string;
}[]
```
- **Returns:** Array of context menu options for entries.  
- **Description:** Overrides DocumentDirectory._getEntryContextOptions.

### _initializeApplicationOptions
```typescript
_initializeApplicationOptions(options: any): any
```
- **Parameters:**  
  - **options**: `any`  
- **Returns:** `any`  
- **Description:** Inherited from DocumentDirectory._initializeApplicationOptions.

### _matchSearchEntries
```typescript
_matchSearchEntries(
  query: any,
  entryIds: any,
  folderIds: any,
  autoExpandIds: any,
  options?: {}
): void
```
- **Parameters:**  
  - **query**: `any`  
  - **entryIds**: `any`  
  - **folderIds**: `any`  
  - **autoExpandIds**: `any`  
  - **options**: `{}` (optional)  
- **Returns:** `void`  
- **Description:** Overrides DocumentDirectory._matchSearchEntries.

### _matchSearchFolders
```typescript
_matchSearchFolders(query: any, folderIds: any, autoExpandIds: any): void
```
- **Parameters:**  
  - **query**: `any`  
  - **folderIds**: `any`  
  - **autoExpandIds**: `any`  
- **Returns:** `void`  
- **Description:** Overrides DocumentDirectory._matchSearchFolders.

### _onClickEntry
```typescript
_onClickEntry(event: any, target: any): Promise<void>
```
- **Parameters:**  
  - **event**: `any`  
  - **target**: `any`  
- **Returns:** `Promise<void>`  
- **Description:** Overrides DocumentDirectory._onClickEntry.

### _onClose
```typescript
_onClose(options: any): void
```
- **Parameters:**  
  - **options**: `any`  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onClose.

### _onDragStart
```typescript
_onDragStart(event: any): void
```
- **Parameters:**  
  - **event**: `any`  
- **Returns:** `void`  
- **Description:** Overrides DocumentDirectory._onDragStart.

### _onDrop
```typescript
_onDrop(event: any): Promise<void>
```
- **Parameters:**  
  - **event**: `any`  
- **Returns:** `Promise<void>`  
- **Description:** Overrides DocumentDirectory._onDrop.

### _onFirstRender
```typescript
_onFirstRender(context: any, options: any): Promise<void>
```
- **Parameters:**  
  - **context**: `any`  
  - **options**: `any`  
- **Returns:** `Promise<void>`  
- **Description:** Overrides DocumentDirectory._onFirstRender.

### _onMatchSearchEntry
```typescript
_onMatchSearchEntry(
  query: any,
  entryIds: any,
  element: any,
  __namedParameters?: {}
): void
```
- **Parameters:**  
  - **query**: `any`  
  - **entryIds**: `any`  
  - **element**: `any`  
  - **__namedParameters**: `{}` (optional)  
- **Returns:** `void`  
- **Description:** Overrides DocumentDirectory._onMatchSearchEntry.

### _onRender
```typescript
_onRender(context: any, options: any): Promise<void>
```
- **Parameters:**  
  - **context**: `any`  
  - **options**: `any`  
- **Returns:** `Promise<void>`  
- **Description:** Overrides DocumentDirectory._onRender.

### _prepareContext
```typescript
_prepareContext(
  options: any
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
- **Returns:** `Promise<ApplicationRenderContext & {...}>`  
- **Description:** Inherited from DocumentDirectory._prepareContext.

### _prepareDirectoryContext
```typescript
_prepareDirectoryContext(context: any, options: any): Promise<void>
```
- **Parameters:**  
  - **context**: `any`  
  - **options**: `any`  
- **Returns:** `Promise<void>`  
- **Description:** Overrides DocumentDirectory._prepareDirectoryContext.

### _preparePartContext
```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```
- **Parameters:**  
  - **partId**: `any`  
  - **context**: `any`  
  - **options**: `any`  
- **Returns:** `Promise<any>`  
- **Description:** Overrides DocumentDirectory._preparePartContext.

### _preSyncPartState
```typescript
_preSyncPartState(partId: any, newElement: any, priorElement: any, state: any): void
```
- **Parameters:**  
  - **partId**: `any`  
  - **newElement**: `any`  
  - **priorElement**: `any`  
  - **state**: `any`  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._preSyncPartState.

### _renderFrame
```typescript
_renderFrame(options: any): Promise<HTMLElement>
```
- **Parameters:**  
  - **options**: `any`  
- **Returns:** `Promise<HTMLElement>`  
- **Description:** Inherited from DocumentDirectory._renderFrame.

### _renderHTML
```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<any>
```
- **Parameters:**  
  - **context**: `ApplicationRenderContext` — Context data for the render operation  
  - **options**: `HandlebarsRenderOptions` — Options which configure application rendering behavior  
- **Returns:** The result of HTML rendering may be implementation specific. Whatever value is returned here is passed to _replaceHTML.  
- **Description:** Inherited from DocumentDirectory._renderHTML. Must be implemented by subclasses.

### _syncPartState
```typescript
_syncPartState(partId: any, newElement: any, priorElement: any, state: any): void
```
- **Parameters:**  
  - **partId**: `any`  
  - **newElement**: `any`  
  - **priorElement**: `any`  
  - **state**: `any`  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._syncPartState.

### activate
```typescript
activate(): void
```
- **Description:** Activate this tab in the sidebar.  
  Inherited from DocumentDirectory.activate.

### addEventListener
```typescript
addEventListener(
  type: string,
  listener: EmittedEventListener,
  options?: { once?: boolean }
): void
```
- **Parameters:**  
  - **type**: `string` — The type of event being registered for  
  - **listener**: `EmittedEventListener` — The listener function called when the event occurs  
  - **options?**: `{ once?: boolean }` — Options to configure the listener (optional)  
    - **once?**: `boolean` — Should the event only be responded to once and then removed  
- **Returns:** `void`  
- **See:** [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
- **Description:** Inherited from DocumentDirectory.addEventListener.

### bringToFront
```typescript
bringToFront(): void
```
- **Description:**  
  Bring this Application window to the front of the rendering stack by increasing its z-index.  
  Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ.  
  We should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp.  
  Inherited from DocumentDirectory.bringToFront.

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
  }
): void
```
- **Parameters:**  
  - **tab**: `string` — The name of the tab which should become active  
  - **group**: `string` — The name of the tab group which defines the set of tabs  
  - **options?** (optional):  
    - **event?**: `Event` — An interaction event which caused the tab change, if any  
    - **force?**: `boolean` — Force changing the tab even if the new tab is already active  
    - **navElement?**: `HTMLElement` — An explicit navigation element being modified  
    - **updatePosition?**: `boolean` — Update application position after changing the tab?  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory.changeTab.

### close
```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<PlaylistDirectory>
```
- **Description:** Close the Application, removing it from the DOM.  
- **Parameters:**  
  - **options?**: `Partial<ApplicationClosingOptions>` (optional) — Options which modify how the application is closed.  
- **Returns:** A Promise which resolves to the closed Application instance.  
- **Description:** Inherited from DocumentDirectory.close.

### collapseAll
```typescript
collapseAll(): void
```
- **Description:** Overrides DocumentDirectory.collapseAll.

### dispatchEvent
```typescript
dispatchEvent(event: Event): boolean
```
- **Description:** Dispatch an event on this target.  
- **Parameters:**  
  - **event**: `Event` — The Event to dispatch  
- **Returns:** `boolean` — Was default behavior for the event prevented?  
- **See:** [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
- **Description:** Inherited from DocumentDirectory.dispatchEvent.

### maximize
```typescript
maximize(): Promise<void>
```
- **Description:** Restore the Application to its original dimensions.  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory.maximize.

### minimize
```typescript
minimize(): Promise<void>
```
- **Description:** Minimize the Application, collapsing it to a minimal header.  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory.minimize.

### removeEventListener
```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```
- **Description:** Remove an event listener for a certain type of event.  
- **Parameters:**  
  - **type**: `string` — The type of event being removed  
  - **listener**: `EmittedEventListener` — The listener function being removed  
- **Returns:** `void`  
- **See:** [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
- **Description:** Inherited from DocumentDirectory.removeEventListener.

### render
```typescript
render(options: any, _options: any): Promise<PlaylistDirectory>
```
- **Parameters:**  
  - **options**: `any`  
  - **_options**: `any`  
- **Returns:** `Promise<PlaylistDirectory>`  
- **Description:** Inherited from DocumentDirectory.render.

### renderPopout
```typescript
renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>
```
- **Description:** Pop-out this sidebar tab as a new application.  
- **Returns:** Promise resolving to an AbstractSidebarTab instance.  
- **Description:** Inherited from DocumentDirectory.renderPopout.

### setPosition
```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```
- **Description:** Update the Application element position using provided data which is merged with the prior position.  
- **Parameters:**  
  - **position?**: `Partial<ApplicationPosition>` (optional) — New Application positioning data  
- **Returns:** `void` | `ApplicationPosition` — The updated application position  
- **Description:** Inherited from DocumentDirectory.setPosition.

### submit
```typescript
submit(submitOptions?: object): Promise<any>
```
- **Description:** Programmatically submit an ApplicationV2 instance which implements a single top-level form.  
- **Parameters:**  
  - **submitOptions?**: `object` (optional) — Arbitrary options which are supported by and provided to the configured form submission handler.  
- **Returns:** A promise that resolves to the returned result of the form submission handler, if any.  
- **Description:** Inherited from DocumentDirectory.submit.

### toggleControls
```typescript
toggleControls(expanded?: boolean, options?: { animate?: boolean }): Promise<void>
```
- **Description:** Toggle display of the Application controls menu. Only applicable to window Applications.  
- **Parameters:**  
  - **expanded?**: `boolean` (optional) — Set the controls visibility to a specific state. Otherwise, toggles from current.  
  - **options?**: `{ animate?: boolean }` (optional) — Options to configure the toggling behavior.  
    - **animate?**: `boolean` — Animate the controls toggling.  
- **Returns:** A Promise which resolves once the control expansion animation is complete.  
- **Description:** Inherited from DocumentDirectory.toggleControls.

### updateTimestamps
```typescript
updateTimestamps(): void
```
- **Description:** Update the displayed timestamps for all currently playing audio sources every second.  
- **Returns:** `void`.

### _canCreateEntry  _(protected)_
```typescript
_canCreateEntry(): boolean
```
- **Description:** Determine if the current user has permission to create directory entries.  
- **Returns:** `boolean`.  
- **Description:** Inherited from DocumentDirectory._canCreateEntry.

### _canCreateFolder  _(protected)_
```typescript
_canCreateFolder(): boolean
```
- **Description:** Determine if the current user has permission to create folders in this directory.  
- **Returns:** `boolean`.  
- **Description:** Inherited from DocumentDirectory._canCreateFolder.

### _canDragDrop  _(protected)_
```typescript
_canDragDrop(selector: string): boolean
```
- **Description:** Determine if drop operations are permitted.  
- **Parameters:**  
  - **selector**: `string` — The candidate HTML selector for dragging  
- **Returns:** `boolean` — Can the current user drag this selector?  
- **Description:** Inherited from DocumentDirectory._canDragDrop.

### _canDragStart  _(protected)_
```typescript
_canDragStart(selector: string): boolean
```
- **Description:** Determine if drag operations are permitted.  
- **Parameters:**  
  - **selector**: `string` — The candidate HTML selector for dragging  
- **Returns:** `boolean` — Can the current user drag this selector?  
- **Description:** Inherited from DocumentDirectory._canDragStart.

### _configureRenderOptions  _(protected)_
```typescript
_configureRenderOptions(options: HandlebarsRenderOptions): void
```
- **Description:** Modify the provided options passed to a render request.  
- **Parameters:**  
  - **options**: `HandlebarsRenderOptions` — Options which configure application rendering behavior  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._configureRenderOptions.

### _createContextMenu  _(protected)_
```typescript
_createContextMenu(
  handler: () => ContextMenuEntry[],
  selector: string,
  options?: {
    container?: HTMLElement;
    hookName?: string;
    parentClassHooks?: boolean;
  }
): null | ContextMenu
```
- **Description:** Create a ContextMenu instance used in this Application.  
- **Parameters:**  
  - **handler**: `() => ContextMenuEntry[]` — A handler function that provides initial context options  
  - **selector**: `string` — A CSS selector to which the ContextMenu will be bound  
  - **options?** (optional):  
    - **container?**: `HTMLElement` — A parent HTMLElement which contains the selector target  
    - **hookName?**: `string` — The hook name  
    - **parentClassHooks?**: `boolean` — Whether to call hooks for the parent classes in the inheritance chain  
- **Returns:** `null` | `ContextMenu` — A created ContextMenu or null if no menu items were defined  
- **Description:** Inherited from DocumentDirectory._createContextMenu.

### _createDroppedEntry  _(protected)_
```typescript
_createDroppedEntry(entry: DirectoryMixinEntry, updates?: object): Promise<documents.Playlist>
```
- **Description:** Create a new entry in this directory from one that was dropped on it.  
- **Parameters:**  
  - **entry**: `DirectoryMixinEntry` — The dropped entry.  
  - **updates?**: `object` (optional) — Modifications to the creation data.  
- **Returns:** `Promise<documents.Playlist>`  
- **Description:** Inherited from DocumentDirectory._createDroppedEntry.

### _createDroppedFolderContent  _(protected)_
```typescript
_createDroppedFolderContent(
  folder: documents.Folder,
  targetFolder?: documents.Folder
): Promise<documents.Folder[]>
```
- **Description:** Import a dropped folder and its children into this collection if they do not already exist.  
- **Parameters:**  
  - **folder**: `documents.Folder` — The folder being dropped.  
  - **targetFolder?**: `documents.Folder` (optional) — A folder to import into if not the directory root.  
- **Returns:** `Promise<documents.Folder[]>`  
- **Description:** Inherited from DocumentDirectory._createDroppedFolderContent.

### _createDroppedFolderDocuments  _(protected)_
```typescript
_createDroppedFolderDocuments(
  folder: documents.Folder,
  documents: object[] | documents.Playlist[]
): Promise<void>
```
- **Description:** Create a set of documents in a dropped folder.  
- **Parameters:**  
  - **folder**: `documents.Folder` — The dropped folder.  
  - **documents**: `object[] | documents.Playlist[]` — The documents to create, or their indices.  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory._createDroppedFolderDocuments.

### _entryAlreadyExists  _(protected)_
```typescript
_entryAlreadyExists(entry: ClientDocument): boolean
```
- **Description:** Test if the given entry is already present in this directory.  
- **Parameters:**  
  - **entry**: `ClientDocument` — The directory entry.  
- **Returns:** `boolean`  
- **Description:** Inherited from DocumentDirectory._entryAlreadyExists.

### _entryBelongsToFolder  _(protected)_
```typescript
_entryBelongsToFolder(entry: DirectoryMixinEntry, folder: string): boolean
```
- **Description:** Determine whether a given directory entry belongs to the given folder.  
- **Parameters:**  
  - **entry**: `DirectoryMixinEntry` — The entry.  
  - **folder**: `string` — The target folder ID.  
- **Returns:** `boolean`  
- **Description:** Inherited from DocumentDirectory._entryBelongsToFolder.

### _getDroppedEntryFromData  _(protected)_
```typescript
_getDroppedEntryFromData(data: object): Promise<ClientDocument>
```
- **Description:** Get the entry instance from its dropped data.  
- **Parameters:**  
  - **data**: `object` — The drag data.  
- **Returns:** `Promise<ClientDocument>`  
- **Throws:** If the correct instance type could not be retrieved.  
- **Description:** Inherited from DocumentDirectory._getDroppedEntryFromData.

### _getEntryDragData  _(protected)_
```typescript
_getEntryDragData(entryId: string): any
```
- **Description:** Get drag data for an entry in this directory.  
- **Parameters:**  
  - **entryId**: `string` — The entry's ID.  
- **Returns:** `any`  
- **Description:** Inherited from DocumentDirectory._getEntryDragData.

### _getFolderContextOptions  _(protected)_
```typescript
_getFolderContextOptions(): ContextMenuEntry[]
```
- **Description:** Get context menu entries for folders in this directory.  
- **Returns:** `ContextMenuEntry[]`  
- **Description:** Inherited from DocumentDirectory._getFolderContextOptions.

### _getFolderDragData  _(protected)_
```typescript
_getFolderDragData(folderId: string): any
```
- **Description:** Get drag data for a folder in this directory.  
- **Parameters:**  
  - **folderId**: `string` — The folder ID.  
- **Returns:** `any`  
- **Description:** Inherited from DocumentDirectory._getFolderDragData.

### _getHeaderControls  _(protected)_
```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```
- **Description:** Configure the array of header control menu options.  
- **Returns:** `ApplicationHeaderControlsEntry[]`  
- **Description:** Inherited from DocumentDirectory._getHeaderControls.

### _getSoundContextOptions  _(protected)_
```typescript
_getSoundContextOptions(): ContextMenuEntry[]
```
- **Description:** Context menu options for individual PlaylistSounds.  
- **Returns:** `ContextMenuEntry[]`  
- **Description:** Inherited from DocumentDirectory._getSoundContextOptions.

### _getTabsConfig  _(protected)_
```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```
- **Description:** Get the configuration for a tabs group.  
- **Parameters:**  
  - **group**: `string` — The ID of a tabs group  
- **Returns:** `null | ApplicationTabsConfiguration`  
- **Description:** Inherited from DocumentDirectory._getTabsConfig.

### _handleDroppedEntry  _(protected)_
```typescript
_handleDroppedEntry(target: HTMLElement, data: object): Promise<void>
```
- **Description:** Handle dropping a new entry into this directory.  
- **Parameters:**  
  - **target**: `HTMLElement` — The drop target element.  
  - **data**: `object` — The drop data.  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory._handleDroppedEntry.

### _handleDroppedFolder  _(protected)_
```typescript
_handleDroppedFolder(target: HTMLElement, data: object): Promise<void>
```
- **Description:** Handle dropping a folder onto the directory.  
- **Parameters:**  
  - **target**: `HTMLElement` — The drop target element.  
  - **data**: `object` — The drop data.  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory._handleDroppedFolder.

### _handleDroppedForeignFolder  _(protected)_
```typescript
_handleDroppedForeignFolder(
  folder: documents.Folder,
  closestFolderId: string,
  sortData: object
): Promise<null | { folder: documents.Folder; sortNeeded: boolean }>
```
- **Description:** Handle importing a new folder's contents into the directory.  
- **Parameters:**  
  - **folder**: `documents.Folder` — The dropped folder.  
  - **closestFolderId**: `string` — The ID of the closest folder to the drop target.  
  - **sortData**: `object` — Sort data for the folder.  
- **Returns:** `Promise<null | { folder: documents.Folder; sortNeeded: boolean }>`  
- **Description:** Inherited from DocumentDirectory._handleDroppedForeignFolder.

### _headerControlButtons  _(protected)_
```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```
- **Description:** Iterate over header control buttons, filtering for controls which are visible for the current client.  
- **Yields:** `ApplicationHeaderControlsEntry`  
- **Description:** Inherited from DocumentDirectory._headerControlButtons.

### _insertElement  _(protected)_
```typescript
_insertElement(element: HTMLElement): void
```
- **Description:** Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.  
- **Parameters:**  
  - **element**: `HTMLElement` — The element to insert  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._insertElement.

### _onActivate  _(protected)_
```typescript
_onActivate(): void
```
- **Description:** Actions performed when this tab is activated in the sidebar.  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onActivate.

### _onChangeForm  _(protected)_
```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```
- **Description:** Handle changes to an input element within the form.  
- **Parameters:**  
  - **formConfig**: `ApplicationFormConfiguration` — The form configuration for which this handler is bound  
  - **event**: `Event` — An input change event within the form  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onChangeForm.

### _onClickAction  _(protected)_
```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```
- **Description:** A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions which have no defined handler.  
- **Parameters:**  
  - **event**: `PointerEvent` — The originating click event  
  - **target**: `HTMLElement` — The capturing HTML element which defined a `[data-action]`  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onClickAction.

### _onClickTab  _(protected)_
```typescript
_onClickTab(event: PointerEvent): void
```
- **Description:** Handle click events on a tab within the Application.  
- **Parameters:**  
  - **event**: `PointerEvent`  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onClickTab.

### _onCreateEntry  _(protected)_
```typescript
_onCreateEntry(event: PointerEvent, target: HTMLElement): any
```
- **Description:** Handle creating a new entry in this directory.  
- **Parameters:**  
  - **event**: `PointerEvent` — The triggering click event.  
  - **target**: `HTMLElement` — The action target element.  
- **Returns:** `any`  
- **Description:** Inherited from DocumentDirectory._onCreateEntry.

### _onCreateFolder  _(protected)_
```typescript
_onCreateFolder(event: PointerEvent, target: HTMLElement): void
```
- **Description:** Handle creating a new folder in this directory.  
- **Parameters:**  
  - **event**: `PointerEvent` — The triggering click event.  
  - **target**: `HTMLElement` — The action target element.  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onCreateFolder.

### _onDeactivate  _(protected)_
```typescript
_onDeactivate(): void
```
- **Description:** Actions performed when this tab is deactivated in the sidebar.  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onDeactivate.

### _onDragHighlight  _(protected)_
```typescript
_onDragHighlight(event: DragEvent): void
```
- **Description:** Highlight folders as drop targets when a drag event enters or exits their area.  
- **Parameters:**  
  - **event**: `DragEvent` — The in-progress drag event.  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onDragHighlight.

### _onDragOver  _(protected)_
```typescript
_onDragOver(event: DragEvent): void
```
- **Description:** Handle drag events over the directory.  
- **Parameters:**  
  - **event**: `DragEvent`  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onDragOver.

### _onGlobalVolume  _(protected)_
```typescript
_onGlobalVolume(slider: HTMLRangePickerElement): void
```
- **Description:** Handle modifying a global volume slider.  
- **Parameters:**  
  - **slider**: `HTMLRangePickerElement` — The slider.  
- **Returns:** `void`.

### _onPosition  _(protected)_
```typescript
_onPosition(position: ApplicationPosition): void
```
- **Description:** Actions performed after the Application is re-positioned.  
- **Parameters:**  
  - **position**: `ApplicationPosition` — The requested application position  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onPosition.

### _onSearchFilter  _(protected)_
```typescript
_onSearchFilter(
  event: KeyboardEvent,
  query: string,
  rgx: RegExp,
  html: HTMLElement
): void
```
- **Description:** Handle directory searching and filtering.  
- **Parameters:**  
  - **event**: `KeyboardEvent` — The keyboard input event.  
  - **query**: `string` — The input search string.  
  - **rgx**: `RegExp` — The regular expression query that should be matched against.  
  - **html**: `HTMLElement` — The container to filter entries from.  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._onSearchFilter.

### _onSoundVolume  _(protected)_
```typescript
_onSoundVolume(slider: HTMLRangePickerElement): void
```
- **Description:** Handle modifying a playing PlaylistSound's volume.  
- **Parameters:**  
  - **slider**: `HTMLRangePickerElement` — The volume slider.  
- **Returns:** `void`.

### _onSubmitForm  _(protected)_
```typescript
_onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent
): Promise<void>
```
- **Description:** Handle submission for an Application which uses the form element.  
- **Parameters:**  
  - **formConfig**: `ApplicationFormConfiguration` — The form configuration for which this handler is bound  
  - **event**: `Event | SubmitEvent` — The form submission event  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory._onSubmitForm.

### _onToggleFolder  _(protected)_
```typescript
_onToggleFolder(
  event: PointerEvent,
  target: HTMLElement,
  options?: { _skipDeprecation?: boolean }
): any
```
- **Description:** Handle toggling a folder's expanded state.  
- **Parameters:**  
  - **event**: `PointerEvent` — The triggering click event.  
  - **target**: `HTMLElement` — The action target element.  
  - **options?**: `{ _skipDeprecation?: boolean }` (optional) — Internal use only.  
- **Returns:** `any`  
- **Description:** Inherited from DocumentDirectory._onToggleFolder.

### _organizeDroppedFoldersAndDocuments  _(protected)_
```typescript
_organizeDroppedFoldersAndDocuments(
  folder: documents.Folder,
  targetFolder?: documents.Folder
): Promise<{
  documentsToCreate: object[] | documents.Playlist[];
  foldersToCreate: documents.Folder[];
}>
```
- **Description:** Organize a dropped folder and its children into a list of folders and documents to create.  
- **Parameters:**  
  - **folder**: `documents.Folder` — The dropped folder.  
  - **targetFolder?**: `documents.Folder` (optional) — A folder to import into if not the directory root.  
- **Returns:** Promise resolving with documents and folders to create.  
- **Description:** Inherited from DocumentDirectory._organizeDroppedFoldersAndDocuments.

### _preClose  _(protected)_
```typescript
_preClose(options: HandlebarsRenderOptions): Promise<void>
```
- **Description:** Actions performed before closing the Application. Pre-close steps are awaited by the close process.  
- **Parameters:**  
  - **options**: `HandlebarsRenderOptions` — Provided render options  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory._preClose.

### _preFirstRender  _(protected)_
```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
- **Description:** Actions performed before a first render of the Application.  
- **Parameters:**  
  - **context**: `ApplicationRenderContext` — Prepared context data  
  - **options**: `HandlebarsRenderOptions` — Provided render options  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory._preFirstRender.

### _prepareControlsContext  _(protected)_
```typescript
_prepareControlsContext(
  context: PlaylistDirectoryRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
- **Description:** Prepare render context for the volume controls part.  
- **Parameters:**  
  - **context**: `PlaylistDirectoryRenderContext`  
  - **options**: `HandlebarsRenderOptions`  
- **Returns:** `Promise<void>`.

### _prepareFooterContext  _(protected)_
```typescript
_prepareFooterContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
- **Description:** Prepare render context for the footer part.  
- **Parameters:**  
  - **context**: `ApplicationRenderContext`  
  - **options**: `HandlebarsRenderOptions`  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory._prepareFooterContext.

### _prepareHeaderContext  _(protected)_
```typescript
_prepareHeaderContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
- **Description:** Prepare render context for the header part.  
- **Parameters:**  
  - **context**: `ApplicationRenderContext`  
  - **options**: `HandlebarsRenderOptions`  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory._prepareHeaderContext.

### _preparePlayingContext  _(protected)_
```typescript
_preparePlayingContext(
  context: PlaylistDirectoryRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
- **Description:** Prepare render context for the currently playing part.  
- **Parameters:**  
  - **context**: `PlaylistDirectoryRenderContext`  
  - **options**: `HandlebarsRenderOptions`  
- **Returns:** `Promise<void>`.

### _preparePlaylistContext  _(protected)_
```typescript
_preparePlaylistContext(
  root: PlaylistDirectoryRenderContext,
  playlist: documents.Playlist
): PlaylistRenderContext
```
- **Description:** Prepare render context for a playlist.  
- **Parameters:**  
  - **root**: `PlaylistDirectoryRenderContext` — The root render context.  
  - **playlist**: `documents.Playlist` — The Playlist document.  
- **Returns:** `PlaylistRenderContext`.

### _prepareTabs  _(protected)_
```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```
- **Description:** Prepare application tab data for a single tab group.  
- **Parameters:**  
  - **group**: `string` — The ID of the tab group to prepare  
- **Returns:** `Record<string, ApplicationTab>`  
- **Description:** Inherited from DocumentDirectory._prepareTabs.

### _prepareTreeContext  _(protected)_
```typescript
_prepareTreeContext(
  root: PlaylistDirectoryRenderContext,
  node: object
): PlaylistDirectoryTreeContext
```
- **Description:** Augment the tree directory structure with playlist-level data objects for rendering.  
- **Parameters:**  
  - **root**: `PlaylistDirectoryRenderContext` — The root render context.  
  - **node**: `object` — The tree node being prepared.  
- **Returns:** `PlaylistDirectoryTreeContext`.

### _prePosition  _(protected)_
```typescript
_prePosition(position: ApplicationPosition): void
```
- **Description:** Actions performed before the Application is re-positioned. Pre-position steps are not awaited because setPosition is synchronous.  
- **Parameters:**  
  - **position**: `ApplicationPosition` — The requested application position  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._prePosition.

### _preRender  _(protected)_
```typescript
_preRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
- **Description:** Actions performed before any render of the Application. Pre-render steps are awaited by the render process.  
- **Parameters:**  
  - **context**: `ApplicationRenderContext` — Prepared context data  
  - **options**: `HandlebarsRenderOptions` — Provided render options  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory._preRender.

### _removeElement  _(protected)_
```typescript
_removeElement(element: HTMLElement): void
```
- **Description:** Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.  
- **Parameters:**  
  - **element**: `HTMLElement` — The element to be removed  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._removeElement.

### _renderHeaderControl  _(protected)_
```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```
- **Description:** Render a header control button.  
- **Parameters:**  
  - **control**: `ApplicationHeaderControlsEntry`  
- **Returns:** `HTMLLIElement`  
- **Description:** Inherited from DocumentDirectory._renderHeaderControl.

### _replaceHTML  _(protected)_
```typescript
_replaceHTML(
  result: any,
  content: HTMLElement,
  options: HandlebarsRenderOptions
): void
```
- **Description:** Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.  
- **Parameters:**  
  - **result**: `any` — The result returned by the application rendering backend  
  - **content**: `HTMLElement` — The content element into which the rendered result must be inserted  
  - **options**: `HandlebarsRenderOptions` — Options which configure application rendering behavior  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._replaceHTML.

### _tearDown  _(protected)_
```typescript
_tearDown(options: ApplicationClosingOptions): void
```
- **Description:** Remove elements from the DOM and trigger garbage collection as part of application closure.  
- **Parameters:**  
  - **options**: `ApplicationClosingOptions`  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._tearDown.

### _updateFrame  _(protected)_
```typescript
_updateFrame(options: HandlebarsRenderOptions): void
```
- **Description:** When the Application is rendered, optionally update aspects of the window frame.  
- **Parameters:**  
  - **options**: `HandlebarsRenderOptions` — Options provided at render-time  
- **Returns:** `void`  
- **Description:** Inherited from DocumentDirectory._updateFrame.

### _updatePosition  _(protected)_
```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```
- **Description:** Translate a requested application position update into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.  
- **Parameters:**  
  - **position**: `ApplicationPosition` — Requested Application positioning data  
- **Returns:** Resolved Application positioning data.  
- **Description:** Inherited from DocumentDirectory._updatePosition.

---

## Static Methods

### inheritanceChain
```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```
- **Description:** Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.  
- **Returns:** Generator yielding the inheritance chain.  
- **See:** [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)  
- **Description:** Inherited from DocumentDirectory.inheritanceChain.

### parseCSSDimension
```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```
- **Description:** Parse a CSS style rule into a number of pixels which apply to that dimension.  
- **Parameters:**  
  - **style**: `string` — The CSS style rule  
  - **parentDimension**: `number` — The relevant dimension of the parent element  
- **Returns:** `number | void` — The parsed style dimension in pixels  
- **Description:** Inherited from DocumentDirectory.parseCSSDimension.

### waitForImages
```typescript
static waitForImages(element: HTMLElement): Promise<void>
```
- **Description:** Wait for any images in the given element to load.  
- **Parameters:**  
  - **element**: `HTMLElement` — The element.  
- **Returns:** `Promise<void>`  
- **Description:** Inherited from DocumentDirectory.waitForImages.

### formatTimestamp  _(protected static)_
```typescript
protected static formatTimestamp(seconds: number): string
```
- **Description:** Format the displayed timestamp given a number of seconds as input.  
- **Parameters:**  
  - **seconds**: `number` — The current playback time in seconds.  
- **Returns:** `string` — The formatted timestamp.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.PlaylistDirectory.html).