# timeSince | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `timeSince`

```typescript
timeSince(timeStamp: string | Date): string
```

Express a timestamp as a relative string. This helper internally uses `GameTime#format` using the relative formatter and the Earth calendar.

**Parameters**

- **timeStamp**: `string | Date`  
  A timestamp string or Date object to be formatted as a relative time

**Returns**  
`string`  
A string expression for the relative time

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)