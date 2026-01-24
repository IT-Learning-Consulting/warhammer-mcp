# debounce | Foundry Virtual Tabletop - API Documentation - Version 13

### Function debounce

```typescript
debounce(callback: Function, delay: number): Function
```

Wrap a callback in a debounced timeout. Delay execution of the callback function until the function has not been called for `delay` milliseconds.

**Parameters**

- **callback**: `Function`  
  A function to execute once the debounced threshold has been passed
- **delay**: `number`  
  An amount of time in milliseconds to delay

**Returns**  
`Function`  
A wrapped function which can be called to debounce execution

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)