# modifyTokenAttribute | Foundry Virtual Tabletop - API Documentation - Version 13

### Function Signature

```typescript
modifyTokenAttribute(
    data: {
        attribute: string;
        isBar: boolean;
        isDelta: boolean;
        value: number;
    },
    updates: objects,
    actor: documents.Actor,
): void
```

A hook event that fires when a token's resource bar attribute has been modified.

### Parameters

- **data**:  
  An object describing the modification
  - **attribute**: _string_  
    The attribute path
  - **isBar**: _boolean_  
    Whether the new value is part of an attribute bar, or just a direct value
  - **isDelta**: _boolean_  
    Does number represent a relative change (`true`) or an absolute change (`false`)
  - **value**: _number_  
    The target attribute value

- **updates**: _objects_  
  The update delta that will be applied to the Token's actor

- **actor**: [_documents.Actor_](https://foundryvtt.com/api/classes/foundry.documents.Actor.html)  
  The Actor associated with the Token

### Returns

_void_

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)