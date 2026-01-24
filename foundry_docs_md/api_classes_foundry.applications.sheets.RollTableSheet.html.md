# RollTableSheet

The Application responsible for editing, displaying, and using a single [RollTable](https://foundryvtt.com/api/classes/foundry.documents.RollTable.html) document.

**Mixes:**  
- HandlebarsApplication

**Hierarchy:**  
- DocumentSheetV2<this>  
- RollTableSheet

---

## Constructors

### constructor

```typescript
new RollTableSheet(options: any, ...args: any[]): RollTableSheet
```

**Parameters**

- **options**: `any`  
- **...args**: `any[]`

**Returns**  
`RollTableSheet`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).constructor

---

## Properties

### options

`options`: `Readonly<ApplicationConfiguration & DocumentSheetConfiguration>`

Application instance configuration options.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).options

---

### position

`position`: `ApplicationPosition = ...`

The current position of the application with respect to the window.document.body.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).position

---

### tabGroups

`tabGroups`: `Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).tabGroups

---

### BASE_APPLICATION

`BASE_APPLICATION`: `typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the  
`BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the  
`BASE_APPLICATION` are not dispatched.

---

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    actions: {
        changeMode: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        createResult: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        deleteResult: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        drawResult: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        drawSpecificResult: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        lockResult: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        normalizeResults: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        openResultSheet: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
        resetResults: (event: PointerEvent, target: HTMLElement) => void | Promise<void>;
    };
    classes: string[];
    form: { closeOnSubmit: boolean };
    position: { width: number };
    window: { contentClasses: string[]; icon: string; resizable: boolean };
} = ...
```

---

### emittedEvents

`emittedEvents`: `readonly ["render", "close", "position"] = ...`

---

### MODE_PARTS

`MODE_PARTS`: `{ edit: string[]; view: string[] } = ...`

Parts for each view.

---

### PARTS

```typescript
PARTS: {
    footer: { template: string };
    header: { template: string };
    results: { 
      scrollable: string[];
      template: string;
      templates: string[];
    };
    sheet: {
        root: boolean;
        scrollable: string[];
        template: string;
        templates: string[];
    };
    summary: { template: string };
    tabs: { template: string };
} = ...
```

---

### RENDER_STATES

`RENDER_STATES`: `Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

---

### TABS

```typescript
TABS: {
    sheet: {
        initial: string;
        labelPrefix: string;
        tabs: { icon: string; id: string }[];
    };
} = ...
```

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

**Returns**  
`DOMTokenList`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).classList

---

### document

```typescript
get document(): ClientDocument
```

The Document instance associated with the application.

**Returns**  
`ClientDocument`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).document

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

**Returns**  
`HTMLElement`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).element

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns**  
`null | HTMLFormElement`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).form

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns**  
`boolean`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).hasFrame

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
_initializeApplicationOptions.

**Returns**  
`string`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).id

---

### isEditable

```typescript
get isEditable(): boolean
```

Is this Document sheet editable by the current User? This is governed by the editPermission  
threshold configured for the class.

**Returns**  
`boolean`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).isEditable

---

### isEditMode

```typescript
get isEditMode(): boolean
```

Is the sheet in edit mode?

**Returns**  
`boolean`

---

### isVisible

```typescript
get isVisible(): boolean
```

Is this Document sheet visible to the current User? This is governed by the viewPermission  
threshold configured for the class.

**Returns**  
`boolean`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).isVisible

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns**  
`boolean`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).minimized

---

### mode

```typescript
get mode(): "view" | "edit"
set mode(value: "view" | "edit"): void
```

The operational mode of this sheet.

**Parameters**

- **value**: `"view"` | `"edit"`

Change the operational mode of this sheet. Changing this value will also change the mode in  
which subsequent RollTableSheet instances first render.

**Returns**  
`void`

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns**  
`boolean`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).rendered

---

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns**  
`number`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).state

---

### title

```typescript
get title(): string
```

**Returns**  
`string`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).title

---

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

Convenience references to window header elements.

**Returns**

- `close`: `HTMLButtonElement`
- `content`: `HTMLElement`
- `controls`: `HTMLButtonElement`
- `controlsDropdown`: `HTMLDivElement`
- `header`: `HTMLElement`
- `icon`: `HTMLElement`
- `onDrag`: `Function`
- `onResize`: `Function`
- `pointerMoveThrottle`: `boolean`
- `pointerStartPosition`: `ApplicationPosition`
- `resize`: `HTMLElement`
- `title`: `HTMLHeadingElement`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).window

---

## Methods

### _canRender

```typescript
_canRender(_options: any): void
```

**Parameters**

- **_options**: `any`

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._canRender

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
Overrides HandlebarsApplicationMixin(DocumentSheetV2)._configureRenderOptions

---

### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

**Parameters**

- **options**: `any`

**Returns**  
`any`

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, void, unknown>
```

**Returns**  
`Generator<ApplicationHeaderControlsEntry, void, unknown>`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._headerControlButtons

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
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._initializeApplicationOptions

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
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onChangeForm

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
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClose

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
Overrides HandlebarsApplicationMixin(DocumentSheetV2)._onFirstRender

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
Overrides HandlebarsApplicationMixin(DocumentSheetV2)._onRender

---

### _prepareContext

```typescript
_prepareContext(
    options: any,
): Promise<
    ApplicationRenderContext & {
        document: ClientDocument;
        editable: boolean;
        fields: any;
        rootId: string;
        source: any;
        user: null | documents.User;
    }
>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<ApplicationRenderContext & { document: ClientDocument; editable: boolean; fields: any; rootId: string; source: any; user: null | documents.User; }>`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prepareContext

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

---

### _prepareSubmitData

```typescript
_prepareSubmitData(
    event: any,
    form: any,
    formData: any,
    updateData: any,
): object
```

**Parameters**

- **event**: `any`
- **form**: `any`
- **formData**: `any`
- **updateData**: `any`

**Returns**  
`object`

**Inherit Doc**  
Overrides HandlebarsApplicationMixin(DocumentSheetV2)._prepareSubmitData

---

### _prepareTabs

```typescript
_prepareTabs(group: any): Record<string, ApplicationTab> | { tabs: {} }
```

**Parameters**

- **group**: `any`

**Returns**  
`Record<string, ApplicationTab> | { tabs: {} }`

**Inherit Doc**  
Overrides HandlebarsApplicationMixin(DocumentSheetV2)._prepareTabs

---

### _preRender

```typescript
_preRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns**  
`Promise<void>`

**Inherit Doc**  
Overrides HandlebarsApplicationMixin(DocumentSheetV2)._preRender

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<HTMLElement>`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderFrame

---

### _renderHTML

```typescript
_renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.

**Parameters**

- **context**: `ApplicationRenderContext` - Context data for the render operation  
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options which configure application rendering behavior

**Returns**  
`Promise<any>`

The result of HTML rendering may be implementation specific. Whatever value is returned  
here is passed to _replaceHTML.

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderHTML

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

**Parameters**

- **type**: `string` - The type of event being registered for  
- **listener**: `EmittedEventListener` - The listener function called when the event occurs  
- **options?**: `{ once?: boolean } = {}` - Options which configure the event listener  
  - **once?**: `boolean` - Should the event only be responded to once and then removed

**Returns**  
`void`

**See**: [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ. We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).bringToFront

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

**Parameters**

- **tab**: `string` - The name of the tab which should become active  
- **group**: `string` - The name of the tab group which defines the set of tabs  
- **options?**:  
  - **event?**: `Event` - An interaction event which caused the tab change, if any  
  - **force?**: `boolean` - Force changing the tab even if the new tab is already active  
  - **navElement?**: `HTMLElement` - An explicit navigation element being modified  
  - **updatePosition?**: `boolean` - Update application position after changing the tab?

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).changeTab

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<RollTableSheet>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options?**: `Partial<ApplicationClosingOptions> = {}` - Options which modify how the application is closed.

**Returns**  
`Promise<RollTableSheet>` - A Promise which resolves to the closed Application instance.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).close

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event` - The Event to dispatch

**Returns**  
`boolean` - Was default behavior for the event prevented?

**See** [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).minimize

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: `string` - The type of event being removed  
- **listener**: `EmittedEventListener` - The listener function being removed

**Returns**  
`void`

**See** [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
Inherited from HandlebarsApplicationMixin(DocumentSheetV2).removeEventListener

---

### render

```typescript
render(
    options?: boolean | (ApplicationRenderOptions & DocumentSheetRenderOptions),
    _options?: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<RollTableSheet>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options?**: `boolean | ApplicationRenderOptions & DocumentSheetRenderOptions = {}` - Options which configure application rendering behavior. A boolean is interpreted as the "force" option.  
- **_options?**: `ApplicationRenderOptions & DocumentSheetRenderOptions = {}` - Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

**Returns**  
`Promise<RollTableSheet>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).render

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters**

- **position?**: `Partial<ApplicationPosition>` - New Application positioning data

**Returns**  
`void | ApplicationPosition` - The updated application position

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).setPosition

---

### submit

```typescript
submit(options: any): Promise<any>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<any>`

**Inherit Doc**  
Overrides HandlebarsApplicationMixin(DocumentSheetV2).submit

---

### toggleControls

```typescript
toggleControls(
    expanded?: boolean,
    options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters**

- **expanded?**: `boolean` - Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value.  
- **options?**: `{ animate?: boolean } = {}` - Options to configure the toggling behavior.  
  - **animate?**: `boolean` - Animate the controls toggling.

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2).toggleControls

---

### _animateRoll

```typescript
_animateRoll(results: TableResult[]): Promise<void>
```

**Protected**

Display a roulette style animation when a Roll Table result is drawn from the sheet.

**Parameters**

- **results**: `TableResult[]` - An Array of drawn table results to highlight

**Returns**  
`Promise<void>` - A Promise that resolves once the animation is complete.

---

### _animateRoulette

```typescript
_animateRoulette(
    resultsTable: HTMLElement,
    drawnIds: Set<string>,
    nLoops: number,
    animTime: number,
    animOffset: number,
): Promise<void>
```

**Protected**

Animate a "roulette" through the table until arriving at the final loop and a drawn result.

**Parameters**

- **resultsTable**: `HTMLElement` - The list element being iterated  
- **drawnIds**: `Set<string>` - The result IDs which have already been drawn  
- **nLoops**: `number` - The number of times to loop through the animation  
- **animTime**: `number` - The desired animation time in milliseconds  
- **animOffset**: `number` - The desired pixel offset of the result within the list

**Returns**  
`Promise<void>` - A Promise that resolves once the animation is complete.

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

**Protected**

Attach event listeners to the Application frame.

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._attachFrameListeners

---

### _createContextMenu

```typescript
_createContextMenu(
    handler: () => ContextMenuEntry[],
    selector: string,
    options?: {
        container?: HTMLElement;
        hookName?: string;
        parentClassHooks?: boolean;
    },
): null | ContextMenu
```

**Protected**

Create a ContextMenu instance used in this Application.

**Parameters**

- **handler**: `() => ContextMenuEntry[]` - A handler function that provides initial context options  
- **selector**: `string` - A CSS selector to which the ContextMenu will be bound  
- **options?**:  
  - **container?**: `HTMLElement` - A parent HTMLElement which contains the selector target  
  - **hookName?**: `string` - The hook name  
  - **parentClassHooks?**: `boolean` - Whether to call hooks for the parent classes in the inheritance chain

**Returns**  
`null | ContextMenu` - A created ContextMenu or null if no menu items were defined.

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._createContextMenu

---

### _createResult

```typescript
_createResult(initialData?: DeepPartial<TableResultData>): Promise<void>
```

**Protected**

Create a Table Result from initial data and with reasonable defaults.

**Parameters**

- **initialData?**: `DeepPartial<TableResultData> = {}`

**Returns**  
`Promise<void>`

---

### _flashResult

```typescript
_flashResult(item: HTMLElement): Promise<void>
```

**Protected**

Display a flashing animation on the selected result to emphasize the draw.

**Parameters**

- **item**: `HTMLElement` - The HTML li item of the winning result

**Returns**  
`Promise<void>` - A Promise that resolves once the animation is complete.

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

**Protected**

Configure the array of header control menu options.

**Returns**  
`ApplicationHeaderControlsEntry[]`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._getHeaderControls

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

**Protected**

Get the configuration for a tabs group.

**Parameters**

- **group**: `string` - The ID of a tabs group

**Returns**  
`null | ApplicationTabsConfiguration`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._getTabsConfig

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

**Protected**

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement` - The element to insert

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._insertElement

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

**Protected**

A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

**Parameters**

- **event**: `PointerEvent` - The originating click event  
- **target**: `HTMLElement` - The capturing HTML element which defined a `[data-action]`

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClickAction

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

**Protected**

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onClickTab

---

### _onDrop

```typescript
_onDrop(event: DragEvent): Promise<void>
```

**Protected**

Create a Compendium or Document result from a dropped document.

**Parameters**

- **event**: `DragEvent` - The triggering drop event

**Returns**  
`Promise<void>`

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

**Protected**

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition` - The requested application position

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onPosition

---

### _onRevealSecret

```typescript
_onRevealSecret(event: Event): any
```

**Protected**

Handle toggling the revealed state of a secret embedded in some content.

**Parameters**

- **event**: `Event` - The triggering event.

**Returns**  
`any`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onRevealSecret

---

### _onSubmitForm

```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

**Protected**

Handle submission for an Application which uses the form element.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound  
- **event**: `Event | SubmitEvent` - The form submission event

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._onSubmitForm

---

### _preClose

```typescript
_preClose(
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

**Protected**

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Provided render options

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preClose

---

### _preFirstRender

```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

**Protected**

Actions performed before a first render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext` - Prepared context data  
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Provided render options

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._preFirstRender

---

### _prepareResult

```typescript
_prepareResult(result: TableResult): Promise<object>
```

**Protected**

Prepare sheet data for a single TableResult.

**Parameters**

- **result**: `TableResult` - The result from which to prepare

**Returns**  
`Promise<object>` - The sheet data for this result

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

**Protected**

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.

**Parameters**

- **position**: `ApplicationPosition` - The requested application position

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._prePosition

---

### _processFormData

```typescript
_processFormData(
    event: null | SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended,
): object
```

**Protected**

Customize how form data is extracted into an expanded object.

**Parameters**

- **event**: `null | SubmitEvent` - The originating form submission event  
- **form**: `HTMLFormElement` - The form element that was submitted  
- **formData**: `FormDataExtended` - Processed data for the submitted form

**Returns**  
`object` - An expanded object of processed form data

**Throws**  
Subclasses may throw validation errors here to prevent form submission

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._processFormData

---

### _processSubmitData

```typescript
_processSubmitData(
    event: SubmitEvent,
    form: HTMLFormElement,
    submitData: object,
    options?: Partial<DatabaseUpdateOperation | DatabaseCreateOperation>,
): Promise<void>
```

**Protected**

Submit a document update or creation request based on the processed form data.

**Parameters**

- **event**: `SubmitEvent` - The originating form submission event  
- **form**: `HTMLFormElement` - The form element that was submitted  
- **submitData**: `object` - Processed and validated form data to be used for a document update  
- **options?**: `Partial<DatabaseUpdateOperation | DatabaseCreateOperation> = {}` - Additional options altering the request

**Returns**  
`Promise<void>`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._processSubmitData

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

**Protected**

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement` - The element to be removed

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._removeElement

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

**Protected**

Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns**  
`HTMLLIElement`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._renderHeaderControl

---

### _replaceHTML

```typescript
_replaceHTML(
    result: any,
    content: HTMLElement,
    options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): void
```

**Protected**

Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

**Parameters**

- **result**: `any` - The result returned by the application rendering backend  
- **content**: `HTMLElement` - The content element into which the rendered result must be inserted  
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options which configure application rendering behavior

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._replaceHTML

---

### _sortResults

```typescript
_sortResults(resultA: object, resultB: object): number
```

**Protected**

Compare a pair of results for sorted display in this sheet.

**Parameters**

- **resultA**: `object` - Sheet data for a result  
- **resultB**: `object` - Sheet data for a different result

**Returns**  
`number` - A comparator return value expected by `Array#sort`

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

**Protected**

Remove elements from the DOM and trigger garbage collection as part of application  
closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._tearDown

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: boolean): void
```

**Protected**

Disable or reenable all form fields in this application.

**Parameters**

- **disabled**: `boolean` - Should the fields be disabled?

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._toggleDisabled

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions & DocumentSheetRenderOptions): void
```

**Protected**

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions` - Options provided at render-time

**Returns**  
`void`

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._updateFrame

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

**Protected**

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: `ApplicationPosition` - Requested Application positioning data

**Returns**  
`ApplicationPosition` - Resolved Application positioning data

Inherited from HandlebarsApplicationMixin(DocumentSheetV2)._updatePosition

---

### #getDetailsDisplay

```typescript
"#getDetailsDisplay"(result: TableResult): Promise<string>
```

**Protected**

Prepare the details HTML for a single result.

**Parameters**

- **result**: `TableResult`

**Returns**  
`Promise<string>`

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: `string` - The CSS style rule  
- **parentDimension**: `number` - The relevant dimension of the parent element

**Returns**  
`number | void` - The parsed style dimension in pixels

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement` - The element.

**Returns**  
`Promise<void>`