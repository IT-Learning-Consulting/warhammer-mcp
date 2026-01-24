# SocketResponse

```typescript
interface SocketResponse {
    data?: RequestData;
    error?: Error;
    request: SocketRequest;
    status?: string;
    userId?: string;
}
```

## Properties

- **data?**  
  *Type:* [RequestData](https://foundryvtt.com/api/types/foundry.types.RequestData.html)  
  Data returned as a result of the request.

- **error?**  
  *Type:* `Error`  
  An error, if one occurred.

- **request**  
  *Type:* [SocketRequest](https://foundryvtt.com/api/interfaces/foundry.types.SocketRequest.html)  
  The initial request.

- **status?**  
  *Type:* `string`  
  The status of the request.

- **userId?**  
  *Type:* `string`  
  The ID of the requesting User.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)