# SocketInterface

A standardized way socket messages are dispatched and their responses are handled.

## Static Methods

### dispatch

```typescript
dispatch(
    eventName: string,
    request: object | DocumentSocketRequest,
): Promise<SocketResponse>
```

Send a socket request to all other clients and handle their responses.

**Parameters**

- **eventName**: `string`  
  The socket event name being handled
- **request**: `object` | [DocumentSocketRequest](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentSocketRequest.html)  
  Request data provided to the Socket event

**Returns**  
`Promise<SocketResponse>`  
A Promise which resolves to the `SocketResponse`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)