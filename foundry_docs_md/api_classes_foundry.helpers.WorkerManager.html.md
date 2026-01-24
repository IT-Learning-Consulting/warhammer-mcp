# WorkerManager

A client-side class responsible for managing a set of web workers. This interface is accessed as a singleton instance via `game.workers`.

**See:**  
[foundry.Game#workers](https://foundryvtt.com/api/classes/foundry.Game.html#workers)

**Hierarchy:**  
_Map_  
**WorkerManager**

---

## Static Properties

### WORKER_TASK_ACTIONS

```typescript
WORKER_TASK_ACTIONS: Readonly<{
    EXECUTE: "execute";
    INIT: "init";
    LOAD: "load";
}> = ...
```

Supported worker task actions.

---

## Methods

### createWorker

```typescript
createWorker(name: string, config?: object): Promise<AsyncWorker>
```

Create a new named Worker.

**Parameters**

- **name**: `string`  
  The named Worker to create

- **config**: `object` = `{}` (Optional)  
  Worker configuration parameters passed to the AsyncWorker constructor

**Returns**  
`Promise<AsyncWorker>`  
The created AsyncWorker which is ready to accept tasks.

---

### retireWorker

```typescript
retireWorker(name: string): void
```

Retire a current Worker, terminating it immediately.

**Parameters**

- **name**: `string`  
  The named worker to terminate

**Returns**  
`void`

**See**  
Worker#terminate