# threadLock | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `threadLock`

```typescript
threadLock(ms: number, debug?: boolean): Promise<void>
```

A debugging function to test latency or timeouts by forcibly locking the thread for an amount of time.

**Parameters**

- **ms**: `number`  
  A number of milliseconds to lock.
- **debug**: `boolean` = `false`  
  Log debugging information?

**Returns**  
`Promise<void>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)