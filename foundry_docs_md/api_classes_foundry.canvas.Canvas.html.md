# Canvas | Foundry Virtual Tabletop - API Documentation - Version 13

The virtual tabletop environment is implemented using a WebGL powered HTML5 canvas using the powerful PIXI.js library. The canvas is comprised by an ordered sequence of layers which define rendering groups and collections of objects that are drawn on the canvas itself.

## Hook Events

- [hookEvents.canvasConfig](https://foundryvtt.com/api/functions/hookEvents.canvasConfig.html)
- [hookEvents.canvasInit](https://foundryvtt.com/api/functions/hookEvents.canvasInit.html)
- [hookEvents.canvasReady](https://foundryvtt.com/api/functions/hookEvents.canvasReady.html)
- [hookEvents.canvasPan](https://foundryvtt.com/api/functions/hookEvents.canvasPan.html)
- [hookEvents.canvasTearDown](https://foundryvtt.com/api/functions/hookEvents.canvasTearDown.html)

## Examples

- **Example: Canvas State**
- **Example: Canvas Methods**

---

## Properties

### app

Type: `Application<ICanvas>`

The singleton PIXI.Application instance rendered on the Canvas.

### blurFilters

Type: `Set<Filter>`

A set of blur filter instances which are modified by the zoom level and the "soft shadows" setting.

### blurOptions

Type:
```typescript
{
    blurClass: typeof Filter;
    enabled: boolean;
    kernels: number;
    passes: number;
    strength: number;
}
```

Configure options passed to initialize blur for the Scene and override normal behavior. This object can be configured during the canvasInit hook before blur is initialized.

### currentMouseManager

Type: `null | MouseInteractionManager = null`

A reference to the MouseInteractionManager that is currently controlling pointer-based interaction, or null.

### edges

Type: [CanvasEdges](https://foundryvtt.com/api/classes/foundry.canvas.geometry.edges.CanvasEdges.html)

A singleton CanvasEdges instance.

### effects

Type: [EffectsCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.EffectsCanvasGroup.html)

The effects Canvas group which modifies the result of the [PrimaryCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.PrimaryCanvasGroup.html) by adding special effects. This includes lighting, vision, fog of war and related animations.

### environment

Type: [EnvironmentCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.EnvironmentCanvasGroup.html)

The environment canvas group which render the primary canvas group and the effects canvas group.

See also: [Canvas#primary](https://foundryvtt.com/api/classes/foundry.canvas.Canvas.html#primary), [Canvas#effects](https://foundryvtt.com/api/classes/foundry.canvas.Canvas.html#effects)

### fog

Type: [FogManager](https://foundryvtt.com/api/classes/foundry.canvas.perception.FogManager.html)

The singleton FogManager instance.

### fps

Type:
```typescript
{ render: number; values: number[] } = ...
```
Record framerate performance data.

### hud

Type: [HeadsUpDisplayContainer](https://foundryvtt.com/api/classes/foundry.applications.hud.HeadsUpDisplayContainer.html)

The singleton HeadsUpDisplay container which overlays HTML rendering on top of this Canvas.

### initializing

Type: `null | Promise<void> = null`

A promise that resolves when the canvas is first initialized and ready.

### interface

Type: [InterfaceCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.InterfaceCanvasGroup.html)

The interface Canvas group which is rendered above other groups and contains all [interactive elements](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html). The various [InteractionLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.InteractionLayer.html) instances of the interface group provide different control sets for interacting with different types of [foundry.abstract.Documents](https://foundryvtt.com/api/classes/foundry.abstract.Document.html) which can be represented on the Canvas.

### loading

Type: `boolean = false`

A flag to indicate whether a new Scene is currently being drawn.

### loadTexturesOptions

Type:
```typescript
{
  additionalSources: string[];
  expireCache: boolean;
}
```

Configure options passed to the texture loaded for the Scene. This object can be configured during the canvasInit hook before textures have been loaded.

### mouseInteractionManager

Type: [MouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.interaction.MouseInteractionManager.html)

The singleton interaction manager instance which handles mouse interaction on the Canvas.

### mousePosition

Type: `Point = ...`

Position of the mouse on stage.

### overlay

Type: [OverlayCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.OverlayCanvasGroup.html)

The overlay Canvas group which is rendered above other groups and contains elements not bound to stage transform.

### pendingRenderFlags

Type: `any`

Track objects which have pending render flags.

### perception

Type: [PerceptionManager](https://foundryvtt.com/api/classes/foundry.canvas.perception.PerceptionManager.html)

A perception manager interface for batching lighting, sight, and sound updates.

### performance

Type: [CanvasPerformanceSettings](https://foundryvtt.com/api/interfaces/foundry.types.CanvasPerformanceSettings.html)

Configured performance settings which affect the behavior of the Canvas and its renderer.

### photosensitiveMode

Type: `boolean`

Is the photosensitive mode enabled?

### previousMousePosition

Type: `Point = ...`

Previous position of the mouse on stage.

### primary

Type: [PrimaryCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.PrimaryCanvasGroup.html)

The primary Canvas group which generally contains tangible physical objects which exist within the Scene. This group is a [CachedContainer](https://foundryvtt.com/api/classes/foundry.canvas.containers.CachedContainer.html) which is rendered to the Scene as a [SpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html). This allows the rendered result of the Primary Canvas Group to be affected by a [BaseSamplerShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.shaders.BaseSamplerShader.html).

### rendered

Type: [RenderedCanvasGroup](https://foundryvtt.com/api/classes/foundry.canvas.groups.RenderedCanvasGroup.html)

The rendered canvas group which render the environment canvas group and the interface canvas group.

See also: [Canvas#environment](https://foundryvtt.com/api/classes/foundry.canvas.Canvas.html#environment), [Canvas#interface](https://foundryvtt.com/api/classes/foundry.canvas.Canvas.html#interface)

### sceneTextures

Type:
```typescript
Record<
  string,
  string | Texture<Resource> | Spritesheet<ISpritesheetData>
> = {}
```

Configure the Textures to apply to the Scene.

Textures registered here will be automatically loaded as part of the TextureLoader.loadSceneTextures workflow. To be loaded, a texture must be added to this record before or during the "canvasInit" hook.

After textures are loaded for the Scene, the values of this record are replaced with direct references to the PIXI.Textures that were loaded.

### screenDimensions

Type: `number[] = ...`

The renderer screen dimensions.

### snapshot

Type: [FramebufferSnapshot](https://foundryvtt.com/api/classes/foundry.canvas.FramebufferSnapshot.html)

The framebuffer snapshot.

### stage

Type: `Container<DisplayObject>`

The primary stage container of the PIXI.Application.

### supported

Type: [CanvasSupportedComponents](https://foundryvtt.com/api/interfaces/foundry.types.CanvasSupportedComponents.html)

A list of supported webGL capabilities and limitations.

### visibility

Type: [CanvasVisibility](https://foundryvtt.com/api/classes/foundry.canvas.groups.CanvasVisibility.html)

The visibility Canvas group which handles the fog of war overlay by consolidating multiple render textures, and applying a filter with special effects and blur.

---

## Accessors

### visibilityOptions

Type:
```typescript
{
  persistentVision: boolean;
}
```

Configure options used by the visibility framework for special effects. This object can be configured during the canvasInit hook before visibility is initialized.

### MOUSE_MOVE_HANDLER_PRIORITIES

Type:
```typescript
Readonly<{ HIGH: 75; LOW: 25; MEDIUM: 50 }> = ...
```

Mouse move handler priorities.

### activeLayer

```typescript
get activeLayer(): CanvasLayer
```

Return a reference to the active Canvas Layer.

**Returns:** `CanvasLayer`

### colors

```typescript
get colors(): Color
```

The colors bound to this scene and handled by the color manager.

**Returns:** [Color](https://foundryvtt.com/api/classes/foundry.utils.Color.html)

### darknessLevel

```typescript
get darknessLevel(): number
```

The currently displayed darkness level, which may override the saved Scene value.

**Returns:** `number`

### dimensions

```typescript
get dimensions(): null | Readonly<CanvasDimensions>
```

The current pixel dimensions of the displayed Scene, or null if the Canvas is blank.

**Returns:** `null | Readonly<CanvasDimensions>`

### forceSnapVertices

```typescript
get forceSnapVertices(): boolean
```

Force snapping to grid vertices?

**Returns:** `boolean`

### grid

```typescript
get grid(): null | BaseGrid<GridCoordinates2D, GridCoordinates3D>
```

A reference to the grid of the currently displayed Scene document, or null if the Canvas is currently blank.

**Returns:** `null | BaseGrid<GridCoordinates2D, GridCoordinates3D>`

### id

```typescript
get id(): null | string
```

The id of the currently displayed Scene.

**Returns:** `null | string`

### initialized

```typescript
get initialized(): boolean
```

A flag for whether the game Canvas is fully initialized and ready for additional content to be drawn.

**Returns:** `boolean`

### layers

```typescript
get layers(): CanvasLayer[]
```

An Array of all CanvasLayer instances which are active on the Canvas board.

**Returns:** `CanvasLayer[]`

### manager

```typescript
get manager(): null | SceneManager
```

A SceneManager instance which adds behaviors to this Scene, or null if there is no manager.

**Returns:** `null | SceneManager`

### masks

```typescript
get masks(): Container<DisplayObject>
```

Shortcut to get the masks container from HiddenCanvasGroup.

**Returns:** `Container<DisplayObject>`

### ready

```typescript
get ready(): boolean
```

A flag for whether the game Canvas is ready to be used. False if the canvas is not yet drawn, true otherwise.

**Returns:** `boolean`

### scene

```typescript
get scene(): null | documents.Scene
```

A reference to the currently displayed Scene document, or null if the Canvas is currently blank.

**Returns:** `null | documents.Scene`

### layers (static)

```typescript
get layers(): Record<string, CanvasLayer>
```

A mapping of named CanvasLayer classes which defines the layers which comprise the Scene.

**Returns:** `Record<string, CanvasLayer>`

---

## Methods

### activateFPSMeter

```typescript
activateFPSMeter(): void
```

Activate framerate tracking by adding an HTML element to the display and refreshing it every frame.

**Returns:** `void`

---

### addBlurFilter

```typescript
addBlurFilter(filter: Filter): Filter
```

Add a filter to the blur filter list if it has the `blur` property.

**Parameters:**

- **filter**: `Filter`  
  The filter instance to add.

**Returns:** `Filter`  
The filter that was passed to this function.

---

### animatePan

```typescript
animatePan(view?: any): Promise<boolean>
```

Animate panning the canvas to a certain destination coordinate and zoom scale. Customize the animation speed with additional options. Returns a Promise which is resolved once the animation has completed.

**Parameters:**

- **view**: `any = {}`  
  The desired view parameters.

**Returns:** `Promise<boolean>`  
A Promise which resolves once the animation has been completed.

---

### canvasCoordinatesFromClient

```typescript
canvasCoordinatesFromClient(origin: Point): Point
```

Convert client viewport coordinates to canvas coordinates.

**Parameters:**

- **origin**: `Point`  
  The client coordinates.

**Returns:** `Point`  
The corresponding canvas coordinates.

---

### clientCoordinatesFromCanvas

```typescript
clientCoordinatesFromCanvas(origin: Point): Point
```

Convert canvas coordinates to the client's viewport.

**Parameters:**

- **origin**: `Point`  
  The canvas coordinates.

**Returns:** `Point`  
The corresponding coordinates relative to the client's viewport.

---

### createBlurFilter

```typescript
createBlurFilter(blurStrength: number, blurQuality?: number): BlurFilter
```

Create a BlurFilter instance and register it to the array for updates when the zoom level changes.

**Parameters:**

- **blurStrength**: `number`  
  The desired blur strength to use for this filter.
- **blurQuality**: `number = CONFIG.Canvas.blurQuality`  
  The desired quality to use for this filter.

**Returns:** `BlurFilter`

---

### deactivateFPSMeter

```typescript
deactivateFPSMeter(): void
```

Deactivate framerate tracking by canceling ticker updates and removing the HTML element.

**Returns:** `void`

---

### draw

```typescript
draw(scene?: documents.Scene): Promise<canvas.Canvas>
```

Draw the game canvas.

**Parameters:**

- **scene** (optional): `documents.Scene`  
  A specific Scene document to render on the Canvas.

**Returns:** `Promise<canvas.Canvas>`  
A Promise which resolves once the Canvas is fully drawn.

---

### getCollectionLayer

```typescript
getCollectionLayer(collectionName: string): PlaceablesLayer
```

Get the InteractionLayer of the canvas which manages Documents of a certain collection within the Scene.

**Parameters:**

- **collectionName**: `string`  
  The collection name.

**Returns:** `PlaceablesLayer`  
The canvas layer.

---

### getGLParameter

```typescript
getGLParameter(parameter: string): any
```

Get the value of a GL parameter.

**Parameters:**

- **parameter**: `string`  
  The GL parameter to retrieve.

**Returns:** `any`  
The GL parameter value.

---

### getLayerByEmbeddedName

```typescript
getLayerByEmbeddedName(embeddedName: string): null | PlaceablesLayer
```

Given an embedded object name, get the canvas layer for that object.

**Parameters:**

- **embeddedName**: `string`

**Returns:** `null | PlaceablesLayer`

---

### highlightObjects

```typescript
highlightObjects(active: boolean): void
```

Highlight objects on any layers which are visible.

**Parameters:**

- **active**: `boolean`

**Returns:** `void`

---

### initialize

```typescript
initialize(): void
```

Initialize the Canvas by creating the HTML element and PIXI application. This step should only ever be performed once per client session. Subsequent requests to reset the canvas should go through `Canvas#draw`.

**Returns:** `void`

---

### initializeCanvasPosition

```typescript
initializeCanvasPosition(): void
```

Initialize the starting view of the canvas stage. If we are re-drawing a scene which was previously rendered, restore the prior view position. Otherwise set the view to the top-left corner of the scene at standard scale.

**Returns:** `void`

---

### isOffscreen

```typescript
isOffscreen(position: Point): boolean
```

Determine whether given canvas coordinates are off-screen.

**Parameters:**

- **position**: `Point`  
  The canvas coordinates.

**Returns:** `boolean`  
Is the coordinate outside the screen bounds?

---

### pan

```typescript
pan(position?: Partial<CanvasViewPosition>): void
```

Pan the canvas to a certain position and a certain zoom level.

**Parameters:**

- **position** (optional): `Partial<CanvasViewPosition> = {}`  
  The canvas position to pan to.

**Returns:** `void`

---

### ping

```typescript
ping(origin: Point, options?: PingOptions): Promise<boolean>
```

Displays a Ping both locally and on other connected clients, following these rules:

1. Displays on the current canvas Scene  
2. If ALT is held, becomes an ALERT ping  
3. Else if the user is GM and SHIFT is held, becomes a PULL ping  
4. Else is a PULSE ping

**Parameters:**

- **origin**: `Point`  
  Point to display Ping at.
- **options** (optional): `PingOptions`  
  Additional options to configure how the ping is drawn.

**Returns:** `Promise<boolean>`

---

### recenter

```typescript
recenter(initial: CanvasViewPosition): Promise<void>
```

Recenter the canvas with a pan animation that ends in the center of the canvas rectangle.

**Parameters:**

- **initial**: `CanvasViewPosition`  
  A desired initial position from which to begin the animation.

**Returns:** `Promise<void>`  
A Promise which resolves once the animation has been completed.

---

### registerMouseMoveHandler

```typescript
registerMouseMoveHandler(
    handler: Function,
    priority?: number,
    context?: object,
    strict?: boolean,
): void
```

Register a new `onMouseMove` handler with an optional priority.

**Parameters:**

- **handler**: `Function`  
  The function to call on mouse move.
- **priority** (optional): `number = 0`  
  Optional priority. Higher values are called earlier.
- **context** (optional): `object`  
  The context in which the handler should be executed.
- **strict** (optional): `boolean = false`  
  To know if the handler should be called on real pointer move only (not simulated).

**Returns:** `void`

---

### tearDown

```typescript
tearDown(): Promise<void>
```

When re-drawing the canvas, first tear down or discontinue some existing processes.

**Returns:** `Promise<void>`

---

### updateBlur

```typescript
updateBlur(strength?: number): void
```

Update the blur strength depending on the scale of the canvas stage. This number is zero if "soft shadows" are disabled.

**Parameters:**

- **strength** (optional): `number`  
  Optional blur strength to apply.

**Returns:** `void`

---

### clearContainer (static)

```typescript
static clearContainer(displayObject: DisplayObject, destroy?: boolean): void
```

Remove all children of the display object and call one cleaning method: clean first, then tearDown, and destroy if no cleaning method is found.

**Parameters:**

- **displayObject**: `DisplayObject`  
  The display object to clean.
- **destroy**: `boolean = true`  
  If textures should be destroyed.

**Returns:** `void`

---

### getRenderTexture (static)

```typescript
static getRenderTexture(
    options?: { clearColor?: number[]; textureConfiguration?: object },
): RenderTexture
```

Get a texture with the required configuration and clear color.

**Parameters:**

- **options** (optional):
  - **clearColor?**: `number[]`  
    The clear color to use for this texture. Transparent by default.
  - **textureConfiguration?**: `object`  
    The render texture configuration.

**Returns:** `RenderTexture`