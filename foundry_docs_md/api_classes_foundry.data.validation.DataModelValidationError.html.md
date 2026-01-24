# DataModelValidationError

A specialised Error to indicate a model validation failure.

## Hierarchy

* _Error_
* **DataModelValidationError**

---

## Constructors

### constructor

```typescript
new DataModelValidationError(
  failure: string | DataModelValidationFailure,
  ...params?: any[],
): DataModelValidationError
```

**Parameters**

- **failure**: `string` | [`DataModelValidationFailure`](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)  
  The failure that triggered this error or an error message

- **...params**: `any[]`  
  Additional Error constructor parameters

---

## Methods

### asHTML

```typescript
asHTML(): string
```

Generate a nested tree view of the error as an HTML string.

**Returns**  
`string`

---

### getAllFailures

```typescript
getAllFailures(): Record<string, DataModelValidationFailure>
```

Retrieve a flattened object of all the properties that failed validation as part of this error.

**Returns**  
`Record<string, DataModelValidationFailure>`

**Example: Removing invalid changes from an update delta.**

```typescript
const changes = {
  "foo.bar": "validValue",
  "foo.baz": "invalidValue"
};

try {
  doc.validate(expandObject(changes));
} catch (err) {
  const failures = err.getAllFailures();
  if (failures) {
    for (const prop in failures) delete changes[prop];
    doc.validate(expandObject(changes));
  }
}
```

---

### getFailure

```typescript
getFailure(path?: string): DataModelValidationFailure
```

Retrieve the root failure that caused this error, or a specific sub-failure via a path.

**Parameters**

- **path** (optional): `string`  
  The property path to the failure.

**Returns**  
[`DataModelValidationFailure`](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)

**Example: Retrieving a failure.**

```typescript
const changes = {
  "foo.bar": "validValue",
  "foo.baz": "invalidValue"
};

try {
  doc.validate(expandObject(changes));
} catch (err) {
  const failure = err.getFailure("foo.baz");
  console.log(failure.invalidValue); // "invalidValue"
}
```

---

### logAsTable

```typescript
logAsTable(): void
```

Log the validation error as a table.

**Returns**  
`void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)