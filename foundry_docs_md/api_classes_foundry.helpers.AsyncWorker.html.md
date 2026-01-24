# AsyncWorker

An asynchronous web Worker which can load user-defined functions and await execution using Promises.

**Parameters**

- **name**  
  The worker name to be initialized

- **options**  
  Worker initialization options

  - **options.debug**  
    Should the worker run in debug mode?

  - **options.loadPrimitives**  
    Should the worker automatically load the primitives library?

  - **options.scripts**  
    Should the worker operate in script modes? Optional scripts.

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.helpers.AsyncWorker))  
*Worker*  
**AsyncWorker**  
[_TextureCompressor_](https://foundryvtt.com/api/classes/foundry.canvas.workers.TextureCompressor.html)

---

## Properties

### name

`name: string`  
The name of this worker.

### Static

#### WORKER_HARNESS_JS

`WORKER_HARNESS_JS: string = "scripts/worker.js"`  
A path reference to the JavaScript file which provides companion worker-side functionality.

---

## Accessors

### ready

```typescript
get ready(): Promise<any>
```

A Promise which resolves once the Worker is ready to accept tasks.

---

## Methods

### executeFunction

```typescript
executeFunction(
    functionName: string,
    args?: any[],
    transfer?: any[],
): Promise<unknown>
```

Execute a task on a specific Worker.

**Parameters**

- **functionName**: `string`  
  The named function to execute on the worker. This function must first have been loaded.

- **args** (optional): `any[] = []`  
  An array of parameters with which to call the requested function.

- **transfer** (optional): `any[] = []`  
  An array of transferable objects which are transferred to the worker thread. See [Transferable objects](https://developer.mozilla.org/en-US/docs/Glossary/Transferable_objects).

**Returns**  
`Promise<unknown>`  
A Promise which resolves with the returned result of the function once complete.

---

### loadFunction

```typescript
loadFunction(functionName: string, functionRef: Function): Promise<unknown>
```

Load a function onto a given Worker. The function must be a pure function with no external dependencies or requirements on global scope.

**Parameters**

- **functionName**: `string`  
  The name of the function to load.

- **functionRef**: `Function`  
  A reference to the function that should be loaded.

**Returns**  
`Promise<unknown>`  
A Promise which resolves once the Worker has loaded the function.

---

### terminate

```typescript
terminate(): void
```

Overrides `Worker.terminate`.

**Returns**  
`void`