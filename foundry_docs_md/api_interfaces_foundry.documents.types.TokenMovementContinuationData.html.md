# TokenMovementContinuationData

```typescript
interface TokenMovementContinuationData {
    continueCounter: number;
    continued: boolean;
    continuePromise: null | Promise<boolean>;
    movementId: string;
    postWorkflowPromise: Promise<void>;
    resolveWaitPromise: () => undefined | {};
    states: {
        [movementId: string]: {
            callbacks: (continued: boolean) => void[];
            handles: Map<string | symbol, TokenMovementContinuationHandle>;
            pending: Set<string>;
        };
    };
    waitPromise: Promise<void>;
}
```

## Properties

- **continueCounter**: `number`  
  The number of continuations

- **continued**: `boolean`  
  Was continued?

- **continuePromise**: `null` \| `Promise<boolean>`  
  The continuation promise

- **movementId**: `string`  
  The movement ID

- **postWorkflowPromise**: `Promise<void>`  
  The promise that resolves after the update workflow

- **resolveWaitPromise**: `() => undefined | {}`  
  Resolve function of the wait promise

- **states**:  
  ```typescript
  {
      [movementId: string]: {
          callbacks: (continued: boolean) => void[];
          handles: Map<string | symbol, TokenMovementContinuationHandle>;
          pending: Set<string>;
      };
  }
  ```  
  The movement continuation states

- **waitPromise**: `Promise<void>`  
  The promise to wait for before continuing movement

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)