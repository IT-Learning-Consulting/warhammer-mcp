# TokenHUD

An implementation of the `BasePlaceableHUD` base class which renders a heads-up-display interface for Token objects. This interface provides controls for visibility, attribute bars, elevation, status effects, and more. The `TokenHUD` implementation can be configured and replaced via [`CONFIG.Token.hudClass`](https://foundryvtt.com/api/variables/CONFIG.Token.html#__typehudclass).

**Mixes:**  
HandlebarsApplication

**Hierarchy:**  
[BasePlaceableHUD](https://foundryvtt.com/api/classes/foundry.applications.hud.BasePlaceableHUD.html)<canvas.placeables>.Token, TokenDocument, TokenLayer, this  
⬇  
**TokenHUD**

---

## Constructors

### constructor

```typescript
new TokenHUD(options?: Partial<foundry.applications.types.ApplicationConfiguration>): TokenHUD
```

Applications are constructed by providing an object of configuration options.

**Parameters:**

- **options**: `Partial<foundry.applications.types.ApplicationConfiguration>` = `{}`  
  Options used to configure the Application instance

**Returns:**  
`TokenHUD`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).constructor`

---

## Properties

### options

```typescript
options: Readonly<foundry.applications.types.ApplicationConfiguration>
```

Application instance configuration options.

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).options`

---

### position

```typescript
position: foundry.applications.types.ApplicationPosition = ...
```

The current position of the application with respect to the `window.document.body`.

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).position`

---

### tabGroups

```typescript
tabGroups: Record<string, null | string> = ...
```

If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).tabGroups`

---

### BASE_APPLICATION

```typescript
BASE_APPLICATION: typeof BasePlaceableHUD = BasePlaceableHUD
```

---

### DEFAULT_OPTIONS

```typescript
DEFAULT_OPTIONS: {
    actions: {
        combat: (
            ...this: any,
            event: PointerEvent,
            target: HTMLButtonElement,
        ) => Promise<void>;
        effect: {
            buttons: number[];
            handler: (
                ...this: any,
                event: PointerEvent,
                target: HTMLButtonElement,
            ) => Promise<void>;
        };
        movementAction: (
            ...this: any,
            event: PointerEvent,
            target: HTMLButtonElement,
        ) => Promise<void>;
        target: (
            ...this: any,
            event: PointerEvent,
            target: HTMLButtonElement,
        ) => void;
    };
    id: string;
} = ...
```

---

### emittedEvents

```typescript
emittedEvents: readonly ["render", "close", "position"] = ...
```

---

### PARTS

```typescript
PARTS: { hud: { root: boolean; template: string } } = ...
```

---

### RENDER_STATES

```typescript
RENDER_STATES: Record<string, number> = ...
```

The sequence of rendering states that describe the Application life-cycle.

---

### TABS

```typescript
TABS: Record<string, foundry.applications.types.ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

---

## Accessors

### activePalette

```typescript
get activePalette(): null | string
```

The palette that is currently expanded, if any.

**Returns:**  
`null | string`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).activePalette`

---

### actor

```typescript
get actor(): Actor
```

Convenience reference to the Actor modified by this TokenHUD.

**Returns:**  
`Actor`

---

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

**Returns:**  
`DOMTokenList`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).classList`

---

### document

```typescript
get document(): ActiveHUDDocument
```

Convenience access to the Document which this HUD modifies.

**Returns:**  
`ActiveHUDDocument`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).document`

---

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

**Returns:**  
`HTMLElement`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).element`

---

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

**Returns:**  
`null | HTMLFormElement`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).form`

---

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

**Returns:**  
`boolean`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).hasFrame`

---

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. Provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.

**Returns:**  
`string`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).id`

---

### layer

```typescript
get layer(): ActiveHUDLayer
```

Convenience access for the canvas layer which this HUD modifies.

**Returns:**  
`ActiveHUDLayer`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).layer`

---

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

**Returns:**  
`boolean`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).minimized`

---

### object

```typescript
get object(): ActiveHUDObject
```

Reference a PlaceableObject this HUD is currently bound to.

**Returns:**  
`ActiveHUDObject`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).object`

---

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

**Returns:**  
`boolean`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).rendered`

---

### state

```typescript
get state(): number
```

The current render state of the Application.

**Returns:**  
`number`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).state`

---

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

**Returns:**  
`string`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).title`

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
    pointerStartPosition: foundry.applications.types.ApplicationPosition;
    resize: HTMLElement;
    title: HTMLHeadingElement;
}
```

Convenience references to window header elements.

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).window`

---

## Methods

### _onPosition

```typescript
_onPosition(position: any): void
```

Overrides `HandlebarsApplicationMixin(BasePlaceableHUD)._onPosition`

**Parameters:**

- **position**: `any`

**Returns:**  
`void`

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._onRender`

**Parameters:**

- **context**: `any`
- **options**: `any`

**Returns:**  
`Promise<void>`

---

### _onSubmit

```typescript
_onSubmit(event: any, form: any, formData: any): Promise<void>
```

Overrides `HandlebarsApplicationMixin(BasePlaceableHUD)._onSubmit`

**Parameters:**

- **event**: `any`
- **form**: `any`
- **formData**: `any`

**Returns:**  
`Promise<void>`

---

### _parseAttributeInput

```typescript
_parseAttributeInput(
    name: any,
    attr: any,
    input: any,
): { isBar: boolean; isDelta: boolean; value: number }
```

Overrides `HandlebarsApplicationMixin(BasePlaceableHUD)._parseAttributeInput`

**Parameters:**

- **name**: `any`
- **attr**: `any`
- **input**: `any`

**Returns:**  
An object containing:  
- **isBar**: `boolean`  
- **isDelta**: `boolean`  
- **value**: `number`

---

### _preClose

```typescript
_preClose(options: any): Promise<void>
```

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._preClose`

**Parameters:**

- **options**: `any`

**Returns:**  
`Promise<void>`

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<object>
```

Overrides `HandlebarsApplicationMixin(BasePlaceableHUD)._prepareContext`

**Parameters:**

- **options**: `any`

**Returns:**  
`Promise<object>`

---

### _renderHTML

```typescript
_renderHTML(
    context: foundry.applications.types.ApplicationRenderContext,
    options: foundry.applications.types.ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.

**Parameters:**

- **context**: `foundry.applications.types.ApplicationRenderContext`  
  Context data for the render operation

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns:**  
`Promise<any>` - The result of HTML rendering may be implementation specific. Whatever value is returned here is passed to `_replaceHTML`.

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._renderHTML`

---

### _updatePosition

```typescript
_updatePosition(position: any): any
```

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._updatePosition`

**Parameters:**

- **position**: `any`

**Returns:**  
`any`

---

### addEventListener

```typescript
addEventListener(
    type: string,
    listener: foundry.utils.types.EmittedEventListener,
    options?: { once?: boolean },
): void
```

Add a new event listener for a certain type of event.

**Parameters:**

- **type**: `string`  
  The type of event being registered for

- **listener**: [`EmittedEventListener`](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function called when the event occurs

- **options (optional)**: `{ once?: boolean } = {}`  
  Options which configure the event listener  
  - **once (optional)**: `boolean` - Should the event only be responded to once and then removed

**Returns:**  
`void`

See [MDN Documentation on addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).addEventListener`

---

### bind

```typescript
bind(object: canvas.placeables.Token): Promise<void>
```

Bind the HUD to a new PlaceableObject and display it.

**Parameters:**

- **object**: `canvas.placeables.Token`  
  A PlaceableObject instance to which the HUD should be bound

**Returns:**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).bind`

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index. Once ApplicationV1 is deprecated, switching from `_maxZ` to `ApplicationV2#maxZ` is planned. Also, elimination of `ui.activeWindow` in favor of only `ApplicationV2#frontApp`.

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).bringToFront`

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

**Parameters:**

- **tab**: `string`  
  The name of the tab which should become active

- **group**: `string`  
  The name of the tab group which defines the set of tabs

- **options (optional)**:  
  Additional options which affect tab navigation  
  - **event (optional)**: `Event` - An interaction event which caused the tab change, if any  
  - **force (optional)**: `boolean` - Force changing the tab even if the new tab is already active  
  - **navElement (optional)**: `HTMLElement` - An explicit navigation element being modified  
  - **updatePosition (optional)**: `boolean` - Update application position after changing the tab?

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).changeTab`

---

### close

```typescript
close(options?: Partial<foundry.applications.types.ApplicationClosingOptions>): Promise<TokenHUD>
```

Close the Application, removing it from the DOM.

**Parameters:**

- **options (optional)**: `Partial<foundry.applications.types.ApplicationClosingOptions> = {}`  
  Options which modify how the application is closed.

**Returns:**  
`Promise<TokenHUD>` - A Promise which resolves to the closed Application instance

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).close`

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters:**

- **event**: `Event` - The Event to dispatch

**Returns:**  
`boolean` - Was default behavior for the event prevented?

See [MDN Documentation on dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).dispatchEvent`

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns:**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).maximize`

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns:**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).minimize`

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: foundry.utils.types.EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters:**

- **type**: `string` - The type of event being removed

- **listener**: [`EmittedEventListener`](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html) - The listener function being removed

**Returns:**  
`void`

See [MDN Documentation on removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).removeEventListener`

---

### render

```typescript
render(
    options?: boolean | foundry.applications.types.ApplicationRenderOptions,
    _options?: foundry.applications.types.ApplicationRenderOptions,
): Promise<TokenHUD>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters:**

- **options (optional)**: `boolean | foundry.applications.types.ApplicationRenderOptions = {}`  
  Options which configure application rendering behavior. A boolean is interpreted as the `"force"` option.

- **_options (optional)**: `foundry.applications.types.ApplicationRenderOptions = {}`  
  Legacy options for backwards-compatibility with the original `ApplicationV1#render` signature.

**Returns:**  
`Promise<TokenHUD>` - A Promise which resolves to the rendered Application instance

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).render`

---

### setPosition

```typescript
setPosition(position?: Partial<foundry.applications.types.ApplicationPosition>): void | foundry.applications.types.ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior position.

**Parameters:**

- **position (optional)**: `Partial<foundry.applications.types.ApplicationPosition>`  
  New Application positioning data

**Returns:**  
`void | foundry.applications.types.ApplicationPosition` - The updated application position

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).setPosition`

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level form.

**Parameters:**

- **submitOptions (optional)**: `object = {}`  
  Arbitrary options which are supported by and provided to the configured form submission handler.

**Returns:**  
`Promise<any>` - A promise that resolves to the returned result of the form submission handler, if any.

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).submit`

---

### toggleControls

```typescript
toggleControls(
    expanded?: boolean,
    options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters:**

- **expanded (optional)**: `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value

- **options (optional)**: `{ animate?: boolean } = {}`  
  Options to configure the toggling behavior.  
  - **animate (optional)**: `boolean` - Animate the controls toggling.

**Returns:**  
`Promise<void>` - A Promise which resolves once the control expansion animation is complete

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).toggleControls`

---

### togglePalette

```typescript
togglePalette(palette: null | string, active?: boolean): void
```

Toggle the expanded state of the given palette.

**Parameters:**

- **palette**: `null | string`  
  The palette to toggle or `null` to collapse the currently expanded palette

- **active (optional)**: `boolean`  
  Force the palette to be active or inactive

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD).togglePalette`

---

### _attachFrameListeners

```typescript
_protected _attachFrameListeners(): void
```

Attach event listeners to the Application frame.

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._attachFrameListeners`

---

### _canRender

```typescript
_protected _canRender(options: foundry.applications.types.ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters:**

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Provided render options

**Returns:**  
`false | void`  
Return false to prevent rendering.

**Throws:**  
An Error to display a warning message

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._canRender`

---

### _configureRenderOptions

```typescript
_protected _configureRenderOptions(options: foundry.applications.types.ApplicationRenderOptions): void
```

Modify the provided options passed to a render request.

**Parameters:**

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._configureRenderOptions`

---

### _createContextMenu

```typescript
_protected _createContextMenu(
    handler: () => ContextMenuEntry[],
    selector: string,
    options?: {
        container?: HTMLElement;
        hookName?: string;
        parentClassHooks?: boolean;
    },
): null | foundry.applications.ux.ContextMenu
```

Create a ContextMenu instance used in this Application.

**Parameters:**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options

- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound

- **options (optional)**:  
  Additional options which affect ContextMenu construction  
  - **container (optional)**: `HTMLElement` — A parent HTMLElement which contains the selector target  
  - **hookName (optional)**: `string` — The hook name  
  - **parentClassHooks (optional)**: `boolean` — Whether to call hooks for the parent classes in the inheritance chain.

**Returns:**  
`null | ContextMenu` - A created ContextMenu or null if no menu items were defined

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._createContextMenu`

---

### _getHeaderControls

```typescript
_protected _getHeaderControls(): foundry.applications.types.ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

**Returns:**  
`ApplicationHeaderControlsEntry[]`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._getHeaderControls`

---

### _getMovementActionChoices

```typescript
_protected _getMovementActionChoices(): {
    [id: string]: {
        cssClass: string;
        icon: string;
        id: string;
        isActive: boolean;
        label: string;
    };
}
```

Get the valid movement action choices.

**Returns:**  
An object mapping ID strings to choice details with fields:

- **cssClass**: `string`  
- **icon**: `string`  
- **id**: `string`  
- **isActive**: `boolean`  
- **label**: `string`

---

### _getStatusEffectChoices

```typescript
_protected _getStatusEffectChoices(): {
    [id: string]: {
        _id: string;
        cssClass: string;
        id: string;
        isActive: boolean;
        isOverlay: boolean;
        src: string;
        title: string;
    };
}
```

Get the valid status effect choices.

**Returns:**  
An object mapping ID strings to status effect details with fields:

- **_id**: `string`  
- **cssClass**: `string`  
- **id**: `string`  
- **isActive**: `boolean`  
- **isOverlay**: `boolean`  
- **src**: `string`  
- **title**: `string`

---

### _getTabsConfig

```typescript
_protected _getTabsConfig(group: string): null | foundry.applications.types.ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters:**

- **group**: `string`  
  The ID of a tabs group

**Returns:**  
`null | ApplicationTabsConfiguration`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._getTabsConfig`

---

### _headerControlButtons

```typescript
_protected _headerControlButtons(): Generator<
  foundry.applications.types.ApplicationHeaderControlsEntry,
  any,
  any
>
```

Iterate over header control buttons, filtering for controls which are visible for the current client.

**Yields:**  
`ApplicationHeaderControlsEntry`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._headerControlButtons`

---

### _initializeApplicationOptions

```typescript
_protected _initializeApplicationOptions(
    options: Partial<foundry.applications.types.ApplicationConfiguration>,
): foundry.applications.types.ApplicationConfiguration
```

Initialize configuration options for the Application instance. The default behavior of this method is to intelligently merge options for each class with those of their parents.

- Array-based options are concatenated  
- Inner objects are merged  
- Otherwise, properties in the subclass replace those defined by a parent

**Parameters:**

- **options**: `Partial<foundry.applications.types.ApplicationConfiguration>`  
  Options provided directly to the constructor

**Returns:**  
`ApplicationConfiguration` - Configured options for the application instance

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._initializeApplicationOptions`

---

### _insertElement

```typescript
_protected _insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.

**Parameters:**

- **element**: `HTMLElement`  
  The element to insert

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._insertElement`

---

### _onChangeForm

```typescript
_protected _onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters:**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound

- **event**: `Event`  
  An input change event within the form

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._onChangeForm`

---

### _onClickAction

```typescript
_protected _onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.

**Parameters:**

- **event**: `PointerEvent`  
  The originating click event

- **target**: `HTMLElement`  
  The capturing HTML element which defined a `[data-action]`

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._onClickAction`

---

### _onClickTab

```typescript
_protected _onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters:**

- **event**: `PointerEvent`

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._onClickTab`

---

### _onClose

```typescript
_protected _onClose(options: foundry.applications.types.ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the close process.

**Parameters:**

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Provided render options

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._onClose`

---

### _onFirstRender

```typescript
_protected _onFirstRender(
    context: foundry.applications.types.ApplicationRenderContext,
    options: foundry.applications.types.ApplicationRenderOptions,
): Promise<void>
```

Actions performed after a first render of the Application.

**Parameters:**

- **context**: `foundry.applications.types.ApplicationRenderContext`  
  Prepared context data

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Provided render options

**Returns:**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._onFirstRender`

---

### _onSubmitForm

```typescript
_protected _onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.

**Parameters:**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound

- **event**: `Event | SubmitEvent`  
  The form submission event

**Returns:**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._onSubmitForm`

---

### _preFirstRender

```typescript
_protected _preFirstRender(
    context: foundry.applications.types.ApplicationRenderContext,
    options: foundry.applications.types.ApplicationRenderOptions,
): Promise<void>
```

Actions performed before a first render of the Application.

**Parameters:**

- **context**: `foundry.applications.types.ApplicationRenderContext`  
  Prepared context data

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Provided render options

**Returns:**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._preFirstRender`

---

### _prepareTabs

```typescript
_protected _prepareTabs(group: string): Record<string, foundry.applications.types.ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters:**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns:**  
`Record<string, ApplicationTab>`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._prepareTabs`

---

### _prePosition

```typescript
_protected _prePosition(position: foundry.applications.types.ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not awaited because `setPosition` is synchronous.

**Parameters:**

- **position**: `foundry.applications.types.ApplicationPosition`  
  The requested application position

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._prePosition`

---

### _preRender

```typescript
_protected _preRender(
    context: foundry.applications.types.ApplicationRenderContext,
    options: foundry.applications.types.ApplicationRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the render process.

**Parameters:**

- **context**: `foundry.applications.types.ApplicationRenderContext`  
  Prepared context data

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Provided render options

**Returns:**  
`Promise<void>`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._preRender`

---

### _removeElement

```typescript
_protected _removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.

**Parameters:**

- **element**: `HTMLElement`  
  The element to be removed

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._removeElement`

---

### _renderFrame

```typescript
_protected _renderFrame(options: foundry.applications.types.ApplicationRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters:**

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns:**  
`Promise<HTMLElement>`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._renderFrame`

---

### _renderHeaderControl

```typescript
_protected _renderHeaderControl(control: foundry.applications.types.ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters:**

- **control**: `foundry.applications.types.ApplicationHeaderControlsEntry`

**Returns:**  
`HTMLLIElement`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._renderHeaderControl`

---

### _replaceHTML

```typescript
_protected _replaceHTML(
    result: any,
    content: HTMLElement,
    options: foundry.applications.types.ApplicationRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.

**Parameters:**

- **result**: `any`  
  The result returned by the application rendering backend

- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._replaceHTML`

---

### _tearDown

```typescript
_protected _tearDown(options: foundry.applications.types.ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application closure.

**Parameters:**

- **options**: `foundry.applications.types.ApplicationClosingOptions`

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._tearDown`

---

### _updateFrame

```typescript
_protected _updateFrame(options: foundry.applications.types.ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters:**

- **options**: `foundry.applications.types.ApplicationRenderOptions`  
  Options provided at render-time

**Returns:**  
`void`

Inherited from `HandlebarsApplicationMixin(BasePlaceableHUD)._updateFrame`

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<
  typeof foundry.applications.api.ApplicationV2,
  void,
  unknown
>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns:**  
`Generator<typeof foundry.applications.api.ApplicationV2, void, unknown>`

See [`ApplicationV2.BASE_APPLICATION`](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters:**

- **style**: `string`  
  The CSS style rule

- **parentDimension**: `number`  
  The relevant dimension of the parent element

**Returns:**  
`number | void` - The parsed style dimension in pixels

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters:**

- **element**: `HTMLElement`  
  The element.

**Returns:**  
`Promise<void>`

---

# Links

- [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)