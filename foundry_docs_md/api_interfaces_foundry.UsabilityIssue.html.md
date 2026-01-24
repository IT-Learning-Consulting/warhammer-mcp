# UsabilityIssue | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface UsabilityIssue {
    message: string;
    params?: object;
    severity: string;
}
```

## Properties

- **message**: *string*  
  The pre-localized message to display in relation to the usability issue.

- **params** *(optional)*: *object*  
  Parameters to supply to the localization.

- **severity**: *string*  
  The severity of the issue, either `"error"`, `"warning"`, or `"info"`.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)