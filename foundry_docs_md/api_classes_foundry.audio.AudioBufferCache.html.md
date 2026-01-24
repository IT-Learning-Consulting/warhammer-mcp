# AudioBufferCache

A specialized cache used for audio buffers. This is an LRU cache which expires buffers from the cache once the maximum cache size is exceeded.

**Hierarchy**  
_Map_  
**AudioBufferCache**  

---

## Constructors

### `constructor`

```typescript
new AudioBufferCache(cacheSize?: number): AudioBufferCache
```

Construct an AudioBufferCache providing a maximum disk size beyond which entries are expired.

- **Parameters:**
  - `cacheSize` _(optional, number)_: The maximum cache size in bytes. 1GB by default.

- **Returns:**  
  `AudioBufferCache`

Overrides `Map.constructor`

---

## Accessors

### `usage`

```typescript
get usage(): {
    current: number;
    currentString: string;
    max: number;
    maxString: string;
    pct: number;
    pctString: string;
}
```

A string representation of the current cache utilization.

- **Returns:**

  ```ts
  {
      current: number;
      currentString: string;
      max: number;
      maxString: string;
      pct: number;
      pctString: string;
  }
  ```

---

## Methods

### `delete`

```typescript
delete(src: string): boolean
```

Delete an entry from the cache.

- **Parameters:**
  - `src` (string): The audio buffer source path

- **Returns:**  
  `boolean` - Was the buffer deleted from the cache?

Overrides `Map.delete`

---

### `getBuffer`

```typescript
getBuffer(src: string): AudioBuffer | undefined
```

Retrieve an AudioBuffer from the cache.

- **Parameters:**
  - `src` (string): The audio buffer source path

- **Returns:**  
  `AudioBuffer | undefined` - The cached audio buffer, or undefined if not found

---

### `lock`

```typescript
lock(src: string, locked?: boolean): void
```

Lock a buffer, preventing it from being expired even if it is least-recently-used.

- **Parameters:**
  - `src` (string): The audio buffer source path
  - `locked` _(optional, boolean)_: Lock the buffer, preventing its expiration? Default is `true`.

- **Returns:**  
  `void`

---

### `setBuffer`

```typescript
setBuffer(src: string, buffer: AudioBuffer): AudioBufferCache
```

Insert an AudioBuffer into the buffers cache.

- **Parameters:**
  - `src` (string): The audio buffer source path
  - `buffer` (AudioBuffer): The audio buffer to insert

- **Returns:**  
  `AudioBufferCache`

---

### `toString`

```typescript
toString(): string
```

- **Returns:**  
  `string`