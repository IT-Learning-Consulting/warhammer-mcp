# TextureCompressor | Foundry Virtual Tabletop - API Documentation - Version 13

Wrapper for a web worker meant to convert a pixel buffer to the specified image format and quality and return a base64 image.

## Hierarchy [(View Summary)](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.workers.TextureCompressor)

- _AsyncWorker_
- **TextureCompressor**

---

## Constructors

```typescript
new TextureCompressor(
    name?: string,
    config?: { controlHash?: boolean; debug?: boolean },
): TextureCompressor
```

### Parameters

- **name** _string_ = `"TextureCompressor"`  
  The worker name to be initialized (Optional).

- **config** _{ controlHash?: boolean; debug?: boolean }_ = `{}`  
  Worker initialization options (Optional).
  - **controlHash** _boolean_ (Optional)  
    Should use control hash?
  - **debug** _boolean_ (Optional)  
    Should the worker run in debug mode?

### Returns

_TextureCompressor_

Overrides AsyncWorker.constructor

---

## Properties

### name

- **name** _string_  
  The name of this worker.

Inherited from [AsyncWorker.name](https://foundryvtt.com/api/classes/foundry.helpers.AsyncWorker.html#name)

### WORKER_HARNESS_JS (static)

- **WORKER_HARNESS_JS** _string_ = `"scripts/worker.js"`  
  A path reference to the JavaScript file which provides companion worker-side functionality.

Inherited from [AsyncWorker.WORKER_HARNESS_JS](https://foundryvtt.com/api/classes/foundry.helpers.AsyncWorker.html#worker_harness_js)

---

## Accessors

### ready

```typescript
get ready(): Promise<any>
```

A Promise which resolves once the Worker is ready to accept tasks.

Returns: _Promise<any>_

Inherited from [AsyncWorker.ready](https://foundryvtt.com/api/classes/foundry.helpers.AsyncWorker.html)

---

## Methods

### compressBufferBase64

```typescript
compressBufferBase64(
    buffer: Uint8ClampedArray,
    width: number,
    height: number,
    options?: {
        debug?: boolean;
        hash?: string;
        quality?: number;
        type?: string;
    },
): Promise<any>
```

Process the non-blocking image compression to a base64 string.

#### Parameters

- **buffer** _Uint8ClampedArray_  
  Buffer used to create the image data.
- **width** _number_  
  Buffered image width.
- **height** _number_  
  Buffered image height.
- **options** _{ debug?: boolean; hash?: string; quality?: number; type?: string }_ = `{}` (Optional)
  - **debug** _boolean_ (Optional)  
    The debug option.
  - **hash** _string_ (Optional)  
    The precomputed hash.
  - **quality** _number_ (Optional)  
    The required image quality.
  - **type** _string_ (Optional)  
    The required image type.

#### Returns

_Promise<any>_

---

### copyBuffer

```typescript
copyBuffer(
    buffer: Uint8ClampedArray,
    options?: { debug?: boolean; hash?: string; out?: ArrayBuffer },
): Promise<any>
```

Copy a buffer.

#### Parameters

- **buffer** _Uint8ClampedArray_  
  Buffer used to create the image data.
- **options** _{ debug?: boolean; hash?: string; out?: ArrayBuffer }_ = `{}` (Optional)
  - **debug** _boolean_ (Optional)  
    The debug option.
  - **hash** _string_ (Optional)  
    The precomputed hash.
  - **out** _ArrayBuffer_ (Optional)  
    The output buffer to copy the pixels to. May be detached.

#### Returns

_Promise<any>_

---

### executeFunction

```typescript
executeFunction(
    functionName: string,
    args?: any[],
    transfer?: any[],
): Promise<unknown>
```

Execute a task on a specific Worker.

#### Parameters

- **functionName** _string_  
  The named function to execute on the worker. This function must first have been loaded.
- **args** _any[]_ = `[]` (Optional)  
  An array of parameters with which to call the requested function.
- **transfer** _any[]_ = `[]` (Optional)  
  An array of transferable objects which are transferred to the worker thread. See [Transferable objects](https://developer.mozilla.org/en-US/docs/Glossary/Transferable_objects).

#### Returns

_Promise<unknown>_

Inherited from [AsyncWorker.executeFunction](https://foundryvtt.com/api/classes/foundry.helpers.AsyncWorker.html#executefunction)

---

### expandBufferRedToBufferRGBA

```typescript
expandBufferRedToBufferRGBA(
    buffer: Uint8ClampedArray,
    width: number,
    height: number,
    options?: { debug?: boolean; hash?: string; out?: ArrayBuffer },
): Promise<any>
```

Expand a buffer in RED format to a buffer in RGBA format.

#### Parameters

- **buffer** _Uint8ClampedArray_  
  Buffer used to create the image data.
- **width** _number_  
  Buffered image width.
- **height** _number_  
  Buffered image height.
- **options** _{ debug?: boolean; hash?: string; out?: ArrayBuffer }_ = `{}` (Optional)
  - **debug** _boolean_ (Optional)  
    The debug option.
  - **hash** _string_ (Optional)  
    The precomputed hash.
  - **out** _ArrayBuffer_ (Optional)  
    The output buffer to write the expanded pixels to. May be detached.

#### Returns

_Promise<any>_

---

### loadFunction

```typescript
loadFunction(functionName: string, functionRef: Function): Promise<unknown>
```

Load a function onto a given Worker. The function must be a pure function with no external dependencies or requirements on global scope.

#### Parameters

- **functionName** _string_  
  The name of the function to load.
- **functionRef** _Function_  
  A reference to the function that should be loaded.

#### Returns

_Promise<unknown>_

Inherited from [AsyncWorker.loadFunction](https://foundryvtt.com/api/classes/foundry.helpers.AsyncWorker.html#loadfunction)

---

### reduceBufferRGBAToBufferRED

```typescript
reduceBufferRGBAToBufferRED(
    buffer: Uint8ClampedArray,
    width: number,
    height: number,
    options?: { debug?: boolean; hash?: string; out?: ArrayBuffer },
): Promise<any>
```

Reduce a buffer in RGBA format to a buffer in RED format.

#### Parameters

- **buffer** _Uint8ClampedArray_  
  Buffer used to create the image data.
- **width** _number_  
  Buffered image width.
- **height** _number_  
  Buffered image height.
- **options** _{ debug?: boolean; hash?: string; out?: ArrayBuffer }_ = `{}` (Optional)
  - **debug** _boolean_ (Optional)  
    The debug option.
  - **hash** _string_ (Optional)  
    The precomputed hash.
  - **out** _ArrayBuffer_ (Optional)  
    The output buffer to write the reduced pixels to. May be detached.

#### Returns

_Promise<any>_

---

### terminate

```typescript
terminate(): void
```

Terminate the worker.

#### Returns

_void_

Inherited from [AsyncWorker.terminate](https://foundryvtt.com/api/classes/foundry.helpers.AsyncWorker.html#terminate)