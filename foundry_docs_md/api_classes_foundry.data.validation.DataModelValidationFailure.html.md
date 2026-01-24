# DataModelValidationFailure

A class responsible for recording information about a validation failure.

## Constructor

```typescript
new DataModelValidationFailure(
  options?: {
    dropped?: boolean;
    fallback?: any;
    invalidValue?: any;
    message?: string;
    unresolved?: boolean;
  },
): DataModelValidationFailure
```

### Parameters

- **options** *(optional)*: Object containing initialization properties.
  - **dropped**?: `boolean`  
    Whether the value was dropped from some parent collection.
  - **fallback**?: `any`  
    The value it was replaced by, if any.
  - **invalidValue**?: `any`  
    The value that failed validation for this field.
  - **message**?: `string`  
    The validation error message.
  - **unresolved**?: `boolean`  
    Whether this failure was unresolved.

## Properties

- **dropped**: `boolean`  
  Whether the value was dropped from some parent collection.

- **elements**: [`ElementValidationFailure`[]](https://foundryvtt.com/api/interfaces/foundry.data.types.ElementValidationFailure.html) = []  
  If this field contains a list of elements that are validated as part of its validation, their results are recorded here.

- **fallback**: `any`  
  The value it was replaced by, if any.

- **fields**: `Record<string, DataModelValidationFailure>` = {}  
  If this field contains other fields that are validated as part of its validation, their results are recorded here.

- **invalidValue**: `any`  
  The value that failed validation for this field.

- **message**: `string`  
  The validation error message.

- **unresolved**: `boolean`  
  Record whether a validation failure is unresolved. This reports as true if validation for this field or any hierarchically contained field is unresolved. A failure is unresolved if the value was invalid and there was no valid fallback value available.

## Methods

### asError

```typescript
asError(): DataModelValidationError
```

Return this validation failure as an Error object.

**Returns**  
`DataModelValidationError`

### isEmpty

```typescript
isEmpty(): boolean
```

Whether this failure contains other sub-failures.

**Returns**  
`boolean`

### toObject

```typescript
toObject(): {
  dropped: boolean;
  fallback: any;
  invalidValue: any;
  message: string;
}
```

Return the base properties of this failure, omitting any nested failures.

**Returns**  
An object with the properties:  
- `dropped: boolean`  
- `fallback: any`  
- `invalidValue: any`  
- `message: string`

### toString

```typescript
toString(): string
```

Represent the DataModelValidationFailure as a string.

**Returns**  
`string`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)