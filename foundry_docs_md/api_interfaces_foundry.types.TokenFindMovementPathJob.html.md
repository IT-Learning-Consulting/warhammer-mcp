# TokenFindMovementPathJob | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenFindMovementPathJob {
    cancel: () => void;
    promise: Promise<null | TokenMovementWaypoint[]>;
    result: undefined | null | TokenMovementWaypoint[];
}
```

## Properties

### cancel

**Type:** `() => void`

If this function is called and the job hasn't completed yet, the job is cancelled.

### promise

**Type:** `Promise<null | [TokenMovementWaypoint](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementWaypoint.html)[]>`

The promise returning the (partial) path that was found, or `null` if cancelled.

### result

**Type:** `undefined | null | [TokenMovementWaypoint](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementWaypoint.html)[]`

The result of the pathfinding job.  
- `undefined` while the search is in progress,  
- `null` if the job was cancelled, and  
- the (partial) path if the job completed.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)