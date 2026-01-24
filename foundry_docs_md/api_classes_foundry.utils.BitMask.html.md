# BitMask

Create a new BitMask instance.

## Constructor

```typescript
constructor(states?: Record<string, boolean | null>)
```

- **states**: `Record<string, boolean | null>`
  
  An object containing valid states and their corresponding initial boolean values (default is null).

## Hierarchy

- *Number*
- **BitMask**
- **Index**

## Properties

### states

`states: Record<string, string>`

The enum associated with this structure.

---

## Accessors

### isEmpty

```typescript
get isEmpty(): boolean
```

True if this bitmask is empty (no active states).

**Returns:** `boolean`

---

## Methods

### addState

```typescript
addState(state: string): void
```

Add a state to the bitmask.

- **Parameters:**
  - **state**: `string`  
    The state to add.

- **Returns:** `void`

- **Throws:**  
  Throws an error if the provided state is not valid.

---

### clear

```typescript
clear(): void
```

Clear the bitmask, setting all states to inactive.

- **Returns:** `void`

---

### clone

```typescript
clone(): BitMask
```

Creates a clone of this BitMask instance.

- **Returns:** `BitMask`  
  A new BitMask instance with the same value and valid states as this instance.

---

### hasState

```typescript
hasState(state: string): boolean
```

Check if a specific state is active.

- **Parameters:**
  - **state**: `string`  
    The state to check.

- **Returns:** `boolean`  
  True if the state is active, false otherwise.

---

### isCompatible

```typescript
isCompatible(otherBitMask: BitMask): boolean
```

Checks if two bitmask structures are compatible (the same valid states).

- **Parameters:**
  - **otherBitMask**: `BitMask`  
    The bitmask structure to compare with.

- **Returns:** `boolean`  
  True if the two bitmasks have the same structure, false otherwise.

---

### removeState

```typescript
removeState(state: string): void
```

Remove a state from the bitmask.

- **Parameters:**
  - **state**: `string`  
    The state to remove.

- **Returns:** `void`

- **Throws:**  
  Throws an error if the provided state is not valid.

---

### toggleState

```typescript
toggleState(state: string, enabled?: boolean): undefined | number
```

Toggle the state of a specific state in the bitmask.

- **Parameters:**
  - **state**: `string`  
    The state to toggle.
  - **enabled** *(optional)*: `boolean`  
    Toggle on (true) or off (false)? If undefined, the state is switched automatically.

- **Returns:** `undefined | number`

- **Throws:**  
  Throws an error if the provided state is not valid.

---

### toJSON

```typescript
toJSON(): string
```

Serializes the bitmask to a JSON string.

- **Returns:** `string`  
  The JSON string representing the bitmask.

---

### toObject

```typescript
toObject(): Object
```

Convert value of this BitMask to object representation according to structure.

- **Returns:** `Object`  
  The data represented by the bitmask.

---

### toString

```typescript
toString(): string
```

Get a string representation of the bitmask in binary format.

- **Returns:** `string`  
  The string representation of the bitmask.

Overrides Number.toString.

---

### valueOf

```typescript
valueOf(): number
```

Get the current value of the bitmask.

- **Returns:** `number`  
  The current value of the bitmask.

Overrides Number.valueOf.

---

## Static Methods

### fromJSON

```typescript
static fromJSON(jsonString: string): BitMask
```

Creates a new BitMask instance from a JSON string.

- **Parameters:**
  - **jsonString**: `string`  
    The JSON string representing the bitmask.

- **Returns:** `BitMask`  
  A new BitMask instance created from the JSON string.

---

### generateShaderBitMaskConstants

```typescript
static generateShaderBitMaskConstants(states: string[]): string
```

Generates shader constants based on the provided states.

- **Parameters:**
  - **states**: `string[]`  
    An array containing valid states.

- **Returns:** `string`  
  Shader bit mask constants generated from the states.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)