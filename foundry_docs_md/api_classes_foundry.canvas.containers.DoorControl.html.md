# DoorControl | Foundry Virtual Tabletop - API Documentation - Version 13

An icon representing a Door Control

## Hierarchy

* Container
* **DoorControl**

## Accessors

### center

```typescript
get center(): Point
```

The center of the wall which contains the door.

**Returns**  
`Point`

### isVisible

```typescript
get isVisible(): boolean
```

Determine whether the DoorControl is visible to the calling user's perspective. The control is always visible if the user is a GM and no Tokens are controlled.

**Returns**  
`boolean`

## Methods

### draw

```typescript
draw(): Promise<DoorControl>
```

Draw the DoorControl icon, displaying its icon texture and border.

**Returns**  
`Promise<DoorControl>`

### _getTexture

```typescript
protected _getTexture(): Texture<Resource>
```

Get the icon texture to use for the Door Control icon based on the door state.

**Returns**  
`Texture<Resource>`

### _onMouseDown

```typescript
protected _onMouseDown(event: FederatedEvent<UIEvent | PixiTouch>): any
```

Handle left mouse down events on a door control icon. This should only toggle between the OPEN and CLOSED states.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The originating interaction event.

**Returns**  
`any`

### _onMouseOut

```typescript
protected _onMouseOut(event: FederatedEvent<UIEvent | PixiTouch>): undefined | false
```

Handle mouse out events on a door control icon.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The originating interaction event.

**Returns**  
`undefined | false`

### _onMouseOver

```typescript
protected _onMouseOver(event: FederatedEvent<UIEvent | PixiTouch>): undefined | false
```

Handle mouse over events on a door control icon.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The originating interaction event.

**Returns**  
`undefined | false`

### _onRightDown

```typescript
protected _onRightDown(event: FederatedEvent<UIEvent | PixiTouch>): any
```

Handle right mouse down events on a door control icon. This should toggle whether the door is LOCKED or CLOSED.

**Parameters**

- **event**: `FederatedEvent<UIEvent | PixiTouch>`  
  The originating interaction event.

**Returns**  
`any`

---

For more details, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).