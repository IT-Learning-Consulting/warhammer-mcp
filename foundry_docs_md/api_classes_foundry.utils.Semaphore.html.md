# Semaphore

A simple Semaphore implementation which provides a limited queue for ensuring proper concurrency.

**Param: max**  
The maximum number of tasks which are allowed concurrently.

## Example: Using a Semaphore

```typescript
// Some async function that takes time to execute
function fn(x) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(x);
      resolve(x);
    }, 1000);
  });
}

// Create a Semaphore and add many concurrent tasks
const semaphore = new Semaphore(1);
for (let i of Array.fromRange(100)) {
  semaphore.add(fn, i);
}
```

---

## Properties

### max

```typescript
max: number
```

The maximum number of tasks which can be simultaneously attempted.

---

## Accessors

### active

```typescript
get active(): number
```

The number of actively executing tasks.

Returns: `number`

### remaining

```typescript
get remaining(): number
```

The number of pending tasks remaining in the queue.

Returns: `number`

---

## Methods

### add

```typescript
add(fn: Function, ...args?: any[]): Promise<any>
```

Add a new task to the managed queue.

**Parameters:**

- **fn**: `Function`  
  A callable function.

- **...args** *(optional)*: `any[]`  
  Function arguments.

**Returns:**  
`Promise<any>` — A promise that resolves once the added function is executed.

### clear

```typescript
clear(): void
```

Abandon any tasks which have not yet concluded.

**Returns:**  
`void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[Foundry Virtual Tabletop - API Documentation - Version 13 / foundry](https://foundryvtt.com/api/modules/foundry.html) / [utils](https://foundryvtt.com/api/modules/foundry.utils.html) / [Semaphore](https://foundryvtt.com/api/classes/foundry.utils.Semaphore.html)