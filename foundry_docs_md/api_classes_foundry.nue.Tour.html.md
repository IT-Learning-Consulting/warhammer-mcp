# Tour | Foundry Virtual Tabletop - API Documentation - Version 13

A Tour that shows a series of guided steps.

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.nue.Tour))

**Tour**  
- [CanvasTour](https://foundryvtt.com/api/classes/foundry.nue.tours.CanvasTour.html)  
- [SetupTour](https://foundryvtt.com/api/classes/foundry.nue.tours.SetupTour.html)  
- [SidebarTour](https://foundryvtt.com/api/classes/foundry.nue.tours.SidebarTour.html)  

---

## Constructors

```typescript
new Tour(
    config: TourConfig,
    options?: { id?: string; namespace?: string },
): Tour
```

Construct a Tour by providing a configuration.

**Parameters**

- **config**: [TourConfig](https://foundryvtt.com/api/interfaces/foundry.TourConfig.html)  
  The configuration of the Tour

- **options?**:  
  - **id?**: `string`  
    A tour ID that supercedes `TourConfig#id`  
  - **namespace?**: `string`  
    A tour namespace that supercedes `TourConfig#namespace`  

**Returns**  
`Tour`

---

## Properties

**config**  
Type: [TourConfig](https://foundryvtt.com/api/interfaces/foundry.TourConfig.html)  
Configuration of the tour. This object is cloned to avoid mutating the original configuration.

**fadeElement**  
Type: `HTMLElement`  
The HTMLElement that fades out the rest of the screen.

**overlayElement**  
Type: `any`  
The HTMLElement that blocks input while a Tour is active.

**targetElement**  
Type: `HTMLElement`  
The HTMLElement which is the focus of the current tour step.

**Static**

**HIGHLIGHT_PADDING**  
Type: `number` = 10  
Padding around a Highlighted Element.

---

## Accessors

**canStart**  
```typescript
get canStart(): boolean
```
Return whether this Tour is currently eligible to be started. This is useful for tours which can only be used in certain circumstances, like if the canvas is active.

**Returns**: `boolean`

---

**currentStep**  
```typescript
get currentStep(): null | TourStep
```
Return the current Step, or null if the tour has not yet started.

**Returns**: `null | [TourStep](https://foundryvtt.com/api/interfaces/foundry.TourStep.html)`

---

**description**  
```typescript
get description(): string
```
The human-readable description of the tour.

**Returns**: `string`

---

**hasNext**  
```typescript
get hasNext(): boolean
```
Returns True if there is a next TourStep.

**Returns**: `boolean`

---

**hasPrevious**  
```typescript
get hasPrevious(): boolean
```
Returns True if there is a previous TourStep.

**Returns**: `boolean`

---

**id**  
```typescript
get id(): string
```
The unique identifier of the tour.

**Returns**: `string`

---

**key**  
```typescript
get key(): string
```
The key the Tour is stored under in `game.tours`, of the form `${namespace}.${id}`.

**Returns**: `string`

---

**namespace**  
```typescript
get namespace(): string
```
The package namespace for the tour.

**Returns**: `string`

---

**status**  
```typescript
get status(): TourStatus
```
The current status of the Tour.

**Returns**: [TourStatus](https://foundryvtt.com/api/types/foundry.TourStatus.html)

---

**stepIndex**  
```typescript
get stepIndex(): null | number
```
The index of the current step; -1 if the tour has not yet started, or null if the tour is finished.

**Returns**: `null | number`

---

**steps**  
```typescript
get steps(): TourStep[]
```
The configuration of tour steps.

**Returns**: `[TourStep](https://foundryvtt.com/api/interfaces/foundry.TourStep.html)[]`

---

**title**  
```typescript
get title(): string
```
The human-readable title for the tour.

**Returns**: `string`

---

**Static Accessors**

**activeTour**  
```typescript
static get activeTour(): null | Tour
```
Returns the active Tour, if any.

**Returns**: `null | Tour`

---

**tourInProgress**  
```typescript
static get tourInProgress(): boolean
```
Indicates if a Tour is currently in progress.

**Returns**: `boolean`

---

## Methods

**complete**  
```typescript
complete(): Promise<any>
```
Advance the tour to a completed state.

**Returns**: `Promise<any>`

---

**exit**  
```typescript
exit(): void
```
Exit the tour at the current step.

**Returns**: `void`

---

**next**  
```typescript
next(): Promise<any>
```
Progress the Tour to the next step.

**Returns**: `Promise<any>`

---

**previous**  
```typescript
previous(): Promise<any>
```
Rewind the Tour to the previous step.

**Returns**: `Promise<any>`

---

**progress**  
```typescript
progress(stepIndex: number): Promise<any>
```
Progresses to a given Step.

**Parameters**

- **stepIndex**: `number`  
  The step to progress to.

**Returns**: `Promise<any>`

---

**reset**  
```typescript
reset(): Promise<any>
```
Reset the Tour to an un-started state.

**Returns**: `Promise<any>`

---

**start**  
```typescript
start(): Promise<any>
```
Start the Tour at its current step, or at the beginning if the tour has not yet been started.

**Returns**: `Promise<any>`

---

### Protected Methods

**_getTargetElement**  
```typescript
protected _getTargetElement(selector: string): null | Element
```
Query the DOM for the target element using the provided selector.

**Parameters**

- **selector**: `string`  
  A CSS selector.

**Returns**: `null | Element`  
The target element, or null if not found.

---

**_postStep**  
```typescript
protected async _postStep(): Promise<void>
```
Clean-up operations performed after a step is completed.

**Returns**: `Promise<void>`

---

**_preStep**  
```typescript
protected async _preStep(): Promise<void>
```
Set-up operations performed before a step is shown.

**Returns**: `Promise<void>`

---

**_renderStep**  
```typescript
protected async _renderStep(): Promise<void>
```
Renders the current Step of the Tour.

**Returns**: `Promise<void>`

---

## Static Methods

**fromJSON**  
```typescript
static fromJSON(filepath: string): Promise<Tour>
```
Creates and returns a Tour by loading a JSON file.

**Parameters**

- **filepath**: `string`  
  The path to the JSON file.

**Returns**: `Promise<Tour>`

---

**onMovementAction**  
```typescript
static onMovementAction(movementDirections: string[]): true | void
```
Handle a movement action to either progress or regress the Tour.

**Parameters**

- **movementDirections**: `string[]`  
  The Directions being moved in.

**Returns**: `true | void`