# DocumentSocketResponse

The data structure of a modifyDocument socket response.

## Constructor

```typescript
new DocumentSocketResponse(
    request: DocumentSocketRequest,
): DocumentSocketResponse
```

Prepare a response for an incoming request.

**Parameters**

- **request**: *DocumentSocketRequest*  
  The incoming request that is being responded to.

**Returns**  
*DocumentSocketResponse*

---

## Properties

**action**  
*DatabaseAction*  
The database action that was performed.  
[DatabaseAction](https://foundryvtt.com/api/types/foundry.abstract.types.DatabaseAction.html)

**broadcast**  
*boolean*  
Was this response broadcast to other connected clients?

**error**  
*Error*  
An error that occurred. Present if unsuccessful.

**operation**  
*DatabaseOperation*  
The database operation that was requested.

**result**  
*string[]* | *object[]*  
The result of the request. Present if successful.

**type**  
*string*  
The type of Document being transacted.

**userId**  
*string*  
The identifier of the requesting user.

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).