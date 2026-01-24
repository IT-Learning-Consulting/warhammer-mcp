# AmbientLightConfig | Foundry Virtual Tabletop - API Documentation - Version 13

The AmbientLight configuration application.

---

## Class AmbientLightConfig

**Mixes:**  
HandlebarsApplication

**Hierarchy:**  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sheets.AmbientLightConfig)  
```
DocumentSheetV2<this>
AmbientLightConfig
```

---

## Constructors

### constructor

```typescript
new AmbientLightConfig(options: any, ...args: any[]): AmbientLightConfig
```

**Parameters**

- **options**: `any`
- **...args**: `any[]`

---

## Properties

### options

- **Type:** `Readonly<ApplicationConfiguration & DocumentSheetConfiguration>`
- **Description:** Application instance configuration options.  
- **Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).options

### position

- **Type:** `ApplicationPosition = ...`
- **Description:** The current position of the application with respect to the window.document.body.  
- **Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).position

### preview

- **Type:** `AmbientLightDocument`
- **Description:** Maintain a copy of the original to show a real-time preview of changes.

### tabGroups

- **Type:** `Record<string, null | string> = ...`
- **Description:**  
  If this Application uses tabbed navigation groups, this mapping is updated whenever the  
  `changeTab` method is called. Reports the active tab for each group, with a value of `null`  
  indicating no tab is active. Subclasses may override this property to define default tabs for  
  each group.  
- **Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).tabGroups

---

## Static Properties

### BASE_APPLICATION

- **Type:** `typeof ApplicationV2 = ApplicationV2`
- **Description:**  
Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

### DEFAULT_OPTIONS

- **Type:**  
```typescript
{
  actions: { reset: (...this: any, event: PointerEvent) => Promise<void> };
  classes: string[];
  form: { closeOnSubmit: boolean };
  position: { width: number };
  window: { contentClasses: string[] };
} = ...
```

### emittedEvents

- **Type:** `readonly ["render", "close", "position"] = ...`

### PARTS

- **Type:**

```typescript
{
  advanced: { template: string };
  animation: { template: string };
  basic: { template: string };
  footer: { template: string };
  tabs: { template: string };
} = ...
```

### RENDER_STATES

- **Type:** `Record<string, number> = ...`
- **Description:**  
The sequence of rendering states that describe the Application life-cycle.

### TABS

- **Type:**

```typescript
{
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
**Description:** The CSS class list of this Application instance  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).classList

### document

```typescript
get document(): ClientDocument
```
**Description:** The Document instance associated with the application  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).document

### element

```typescript
get element(): HTMLElement
```
**Description:** The HTMLElement which renders this Application into the DOM.  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).element

### form

```typescript
get form(): null | HTMLFormElement
```
**Description:** Does this Application have a top-level form element?  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).form

### hasFrame

```typescript
get hasFrame(): boolean
```
**Description:** Does this Application instance render within an outer window frame?  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).hasFrame

### id

```typescript
get id(): string
```
**Description:**  
The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
`_initializeApplicationOptions`.  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).id

### isEditable

```typescript
get isEditable(): boolean
```
**Description:**  
Is this Document sheet editable by the current User? This is governed by the editPermission  
threshold configured for the class.  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).isEditable

### isVisible

```typescript
get isVisible(): boolean
```
**Description:**  
Is this Document sheet visible to the current User? This is governed by the viewPermission  
threshold configured for the class.  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).isVisible

### minimized

```typescript
get minimized(): boolean
```
**Description:** Is this Application instance currently minimized?  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).minimized

### rendered

```typescript
get rendered(): boolean
```
**Description:** Is this Application instance currently rendered?  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).rendered

### state

```typescript
get state(): number
```
**Description:** The current render state of the Application.  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).state

### title

```typescript
get title(): string
```
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).title

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
**Description:** Convenience references to window header elements.  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).window

---

## Methods

### _canRender

```typescript
_canRender(_options: any): void
```

**Parameters**

- **_options**: `any`

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._canRender

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: any): void
```

**Parameters**

- **options**: `any`

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._configureRenderOptions

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, void, unknown>
```

**Returns:** `Generator<ApplicationHeaderControlsEntry, void, unknown>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._headerControlButtons

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): any
```

**Parameters**

- **options**: `any`

**Returns:** `any`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._initializeApplicationOptions

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: any, event: any): void
```

**Parameters**

- **formConfig**: `any`
- **event**: `any`

**Returns:** `void`  
**Overrides:** HandlebarsApplicationMixin(DocumentSheetV2)._onChangeForm

---

### _onClose

```typescript
_onClose(options: any): void
```

**Parameters**

- **options**: `any`

**Returns:** `void`  
**Overrides:** HandlebarsApplicationMixin(DocumentSheetV2)._onClose

---

### _onFirstRender

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns:** `Promise<void>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._onFirstRender

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns:** `Promise<void>`  
**Overrides:** HandlebarsApplicationMixin(DocumentSheetV2)._onRender

---

### _prepareContext

```typescript
_prepareContext(
  options: any,
): Promise<
  ApplicationRenderContext &
  {
    document: ClientDocument;
    editable: boolean;
    fields: any;
    rootId: string;
    source: any;
    user: null | documents.User;
  } & {
    buttons: (
      | { action: string; icon: string; label: string; type: string }
      | { action?: undefined; icon: string; label: string; type: string }
    )[];
    colorationTechniques: Record<string, ShaderTechnique>;
    document: AmbientLightDocument;
    gridUnits: any;
    isDarkness: any;
    light: AmbientLightDocument;
    lightAnimations: LightSourceAnimationConfig | DarknessSourceAnimationConfig;
    source: AmbientLightData;
  },
>
```

**Parameters**

- **options**: `any`

**Returns:** A Promise resolving to augmented Application rendering context.  
**Overrides:** HandlebarsApplicationMixin(DocumentSheetV2)._prepareContext

---

### _preRender

```typescript
_preRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns:** `Promise<void>`  
**Overrides:** HandlebarsApplicationMixin(DocumentSheetV2)._preRender

---

### _renderFrame

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```

**Parameters**

- **options**: `any`

**Returns:** `Promise<HTMLElement>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._renderFrame

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

**Returns:** Promise resolving to the rendered HTML (implementation-specific).  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._renderHTML

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
- **options?**: Optional  
  - **once?**: `boolean` - Should the event only be responded to once and then removed

**Returns:** `void`  
**See:** [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ. We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp.

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).bringToFront

---

### changeTab

```typescript
changeTab(...args: any[]): void
```

**Parameters**

- **...args**: `any[]`

**Returns:** `void`  
**Overrides:** HandlebarsApplicationMixin(DocumentSheetV2).changeTab

---

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<AmbientLightConfig>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options?**: `Partial<ApplicationClosingOptions>` = `{}`  
  Options which modify how the application is closed.

**Returns:** A Promise which resolves to the closed Application instance  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).close

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event`

**Returns:** `boolean` - Was default behavior for the event prevented?  
**See:** [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns:** `Promise<void>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns:** `Promise<void>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).minimize

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: `string` - The type of event being removed
- **listener**: `EmittedEventListener` - The listener function being removed

**Returns:** `void`  
**See:** [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).removeEventListener

---

### render

```typescript
render(
  options?: boolean | (ApplicationRenderOptions & DocumentSheetRenderOptions),
  _options?: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<AmbientLightConfig>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options?**: `boolean` | `ApplicationRenderOptions & DocumentSheetRenderOptions` = `{}`  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  "force" option.
- **_options?**: Optional legacy options for backwards-compatibility with the original ApplicationV1#render signature.

**Returns:** A Promise which resolves to the rendered Application instance  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).render

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters**

- **position?**: `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns:** `void | ApplicationPosition` - The updated application position  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).setPosition

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters**

- **submitOptions?**: `object` = `{}`  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns:** A promise that resolves to the returned result of the form submission handler, if any.  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).submit

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

- **expanded?**: `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value.

- **options?**: `{ animate?: boolean } = {}`  
  Options to configure the toggling behavior.

  - **animate?**: `boolean`  
    Animate the controls toggling.

**Returns:** A Promise which resolves once the control expansion animation is complete  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2).toggleControls

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Protected  
Attach event listeners to the Application frame.

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._attachFrameListeners

---

### _createContextMenu

```typescript
_createContextMenu(
  handler: () => ContextMenuEntry[],
  selector: string,
  options?: { container?: HTMLElement; hookName?: string; parentClassHooks?: boolean },
): null | ContextMenu
```

Protected  
Create a ContextMenu instance used in this Application.

**Parameters**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options
- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound
- **options?**: Optional  
  - **container?**: `HTMLElement` - A parent HTMLElement which contains the selector target
  - **hookName?**: `string` - The hook name
  - **parentClassHooks?**: `boolean` - Whether to call hooks for the parent classes in the inheritance chain.

**Returns:** `null | ContextMenu`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._createContextMenu

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Protected  
Configure the array of header control menu options

**Returns:** `ApplicationHeaderControlsEntry[]`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._getHeaderControls

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Protected  
Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns:** `null | ApplicationTabsConfiguration`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._getTabsConfig

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Protected  
Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._insertElement

---

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

Protected  
A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event
- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._onClickAction

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Protected  
Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._onClickTab

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Protected  
Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._onPosition

---

### _onRevealSecret

```typescript
_onRevealSecret(event: Event): any
```

Protected  
Handle toggling the revealed state of a secret embedded in some content.

**Parameters**

- **event**: `Event`  
  The triggering event.

**Returns:** `any`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._onRevealSecret

---

### _onSubmitForm

```typescript
_onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent,
): Promise<void>
```

Protected  
Handle submission for an Application which uses the form element.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound
- **event**: `Event | SubmitEvent`  
  The form submission event

**Returns:** `Promise<void>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._onSubmitForm

---

### _preClose

```typescript
_preClose(
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Protected  
Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options

**Returns:** `Promise<void>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._preClose

---

### _preFirstRender

```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): Promise<void>
```

Protected  
Actions performed before a first render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Provided render options

**Returns:** `Promise<void>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._preFirstRender

---

### _prepareSubmitData

```typescript
_prepareSubmitData(
  event: SubmitEvent,
  form: HTMLFormElement,
  formData: FormDataExtended,
  updateData?: object,
): object
```

Protected  
Prepare data used to update the Document upon form submission. This data is cleaned and  
validated before being returned for further processing.

**Parameters**

- **event**: `SubmitEvent`  
  The originating form submission event
- **form**: `HTMLFormElement`  
  The form element that was submitted
- **formData**: `FormDataExtended`  
  Processed data for the submitted form
- **updateData?**: `object`  
  Additional data passed in if this form is submitted manually which should be merged with  
  prepared formData.

**Returns:** Prepared submission data as an object  
**Throws:** Subclasses may throw validation errors here to prevent form submission  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._prepareSubmitData

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Protected  
Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns:** `Record<string, ApplicationTab>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._prepareTabs

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Protected  
Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._prePosition

---

### _previewChanges

```typescript
_previewChanges(change?: object): void
```

Protected  
Preview changes to the AmbientLight document as if they were true document updates.

**Parameters**

- **change?**: `object`  
  A change to preview.

**Returns:** `void`

---

### _processFormData

```typescript
_processFormData(
  event: null | SubmitEvent,
  form: HTMLFormElement,
  formData: FormDataExtended,
): object
```

Protected  
Customize how form data is extracted into an expanded object.

**Parameters**

- **event**: `null | SubmitEvent`  
  The originating form submission event
- **form**: `HTMLFormElement`  
  The form element that was submitted
- **formData**: `FormDataExtended`  
  Processed data for the submitted form

**Returns:** An expanded object of processed form data  
**Throws:** Subclasses may throw validation errors here to prevent form submission  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._processFormData

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

Protected  
Submit a document update or creation request based on the processed form data.

**Parameters**

- **event**: `SubmitEvent`  
  The originating form submission event
- **form**: `HTMLFormElement`  
  The form element that was submitted
- **submitData**: `object`  
  Processed and validated form data to be used for a document update
- **options?**: Optional  
  Additional options altering the request

**Returns:** `Promise<void>`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._processSubmitData

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Protected  
Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._removeElement

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Protected  
Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns:** `HTMLLIElement`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._renderHeaderControl

---

### _replaceHTML

```typescript
_replaceHTML(
  result: any,
  content: HTMLElement,
  options: ApplicationRenderOptions & DocumentSheetRenderOptions,
): void
```

Protected  
Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend
- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted
- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Options which configure application rendering behavior

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._replaceHTML

---

### _resetPreview

```typescript
_resetPreview(): void
```

Protected  
Restore the true data for the AmbientLight document when the form is submitted or closed.

**Returns:** `void`

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Protected  
Remove elements from the DOM and trigger garbage collection as part of application  
closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._tearDown

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: boolean): void
```

Protected  
Disable or reenable all form fields in this application.

**Parameters**

- **disabled**: `boolean`  
  Should the fields be disabled?

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._toggleDisabled

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions & DocumentSheetRenderOptions): void
```

Protected  
When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions & DocumentSheetRenderOptions`  
  Options provided at render-time

**Returns:** `void`  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._updateFrame

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Protected  
Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns:** Resolved Application positioning data  
**Inherited from:** HandlebarsApplicationMixin(DocumentSheetV2)._updatePosition

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns:** Generator yielding types of ApplicationV2 and its parents until the base Application.  

**See:** [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

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

**Returns:** The parsed style dimension in pixels or `void`

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement` - The element.

**Returns:** `Promise<void>`

---

# Notes

- All links above use [Markdown links](https://foundryvtt.com/api/) as found in the original HTML.
- For full details on interfaces and types referenced, visit [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/).
- This class extends `DocumentSheetV2` and mixes in `HandlebarsApplication` behavior as noted.