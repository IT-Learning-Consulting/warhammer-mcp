# throttle | Foundry Virtual Tabletop - API Documentation - Version 13

### Function throttle

```typescript
throttle(callback: Function, delay: number): Function
```

Wrap a callback in a throttled timeout. Delay execution of the callback function when the last time the function was called was **delay** milliseconds ago.

**Parameters**

- **callback**: `Function`  
  A function to execute once the throttled threshold has been passed

- **delay**: `number`  
  A maximum amount of time in milliseconds between two executions

**Returns**: `Function`  
A wrapped function which can be called to throttle execution

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)