# BooleanField | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of [foundry.data.fields.DataField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html) which deals with boolean-typed data.

## Hierarchy
- *DataField*  
- **BooleanField**

---

## Constructors

```typescript
new BooleanField(
    options?: DataFieldOptions, 
    context?: DataFieldContext
): BooleanField
```

**Parameters**

- **options**: `DataFieldOptions` = `{}`  
  Options which configure the behavior of the field.
- **context**: `DataFieldContext` = `{}`  
  Additional context which describes the field.

**Returns**  
`BooleanField`

Inherited from [DataField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#constructor).

---

## Properties

### options

The initially provided options which configure the data field.

Type: `DataFieldOptions`  

Inherited from [DataField.options](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#options).

---

## Accessors

### hierarchical

**Type:** `boolean` = false

Whether this field defines part of a Document/Embedded Document hierarchy.

Inherited from [DataField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#hierarchical).

### recursive

**Type:** `boolean` = false

Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField.

Inherited from [DataField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#recursive).

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns**  
`string`

Inherited from DataField.fieldPath.

### _defaults

```typescript
get _defaults(): DataFieldOptions & {
    initial: boolean;
    nullable: boolean;
    required: boolean;
}
```

Default parameters for this field type.

**Returns**  
`DataFieldOptions & { initial: boolean; nullable: boolean; required: boolean; }`

Overrides DataField._defaults.

### hasFormSupport

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns**  
`boolean`

Inherited from DataField.hasFormSupport.

---

## Methods

### _applyChangeAdd

```typescript
_applyChangeAdd(value: any, delta: any, model: any, change: any): any
```

**Parameters**
- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`  

**Returns**  
`any`

Overrides [DataField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeadd).

---

### _applyChangeDowngrade

```typescript
_applyChangeDowngrade(value: any, delta: any, model: any, change: any): any
```

**Parameters**
- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`  

**Returns**  
`any`

Overrides [DataField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangedowngrade).

---

### _applyChangeMultiply

```typescript
_applyChangeMultiply(value: any, delta: any, model: any, change: any): any
```

**Parameters**
- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`  

**Returns**  
`any`

Overrides [DataField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangemultiply).

---

### _applyChangeUpgrade

```typescript
_applyChangeUpgrade(value: any, delta: any, model: any, change: any): any
```

**Parameters**
- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`  

**Returns**  
`any`

Overrides [DataField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeupgrade).

---

### _cast

```typescript
_cast(value: any): boolean
```

**Parameters**
- **value**: `any`

**Returns**  
`boolean`

Overrides [DataField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cast).

---

### _toInput

```typescript
_toInput(config: any): HTMLInputElement
```

**Parameters**
- **config**: `any`

**Returns**  
`HTMLInputElement`

Overrides [DataField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_toinput).

---

### _validateType

```typescript
_validateType(value: any): void
```

**Parameters**
- **value**: `any`

**Returns**  
`void`

Overrides [DataField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatetype).

---

### apply

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

Apply a function to this DataField which propagates through recursively to any contained data schema.

**Parameters**

- **fn**: `string | Function`  
  The function to apply.
- **value**: `any`  
  The current value of this field.
- **options**: `object` = `{}` (Optional)  
  Additional options passed to the applied function.

**Returns**  
`object`

Inherited from [DataField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#apply).

---

### applyChange

```typescript
applyChange(
    value: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply an ActiveEffectChange to this field.

**Parameters**

- **value**: `any`  
  The field's current value.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The change to apply.

**Returns**  
`any`

Inherited from [DataField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#applychange).

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value.
- **options**: `{ partial?: boolean; source?: object }` = `{}` (Optional)  
  Additional options for how the field is cleaned.
  - **partial**?: `boolean` (Optional)  
    Whether to perform partial cleaning?
  - **source**?: `object` (Optional)  
    The root data model being cleaned.

**Returns**  
`any`

Inherited from [DataField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#clean).

---

### getInitialValue

```typescript
getInitialValue(data: object): any
```

Attempt to retrieve a valid initial value for the DataField.

**Parameters**

- **data**: `object`  
  The source data object for which an initial value is required.

**Returns**  
`any`

Inherited from [DataField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#getinitialvalue).

---

### initialize

```typescript
initialize(value: any, model: Object, options?: object): any
```

Initialize the original source data into a mutable copy for the DataModel instance.

**Parameters**

- **value**: `any`  
  The source value of the field.
- **model**: `Object`  
  The DataModel instance that this field belongs to.
- **options**: `object` = `{}` (Optional)  
  Initialization options.

**Returns**  
`any`

Inherited from [DataField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#initialize).

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig, 
    inputConfig?: FormInputConfig
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

**Parameters**

- **groupConfig**: `FormGroupConfig` = `{}` (Optional)  
  Configuration options passed to the wrapping form-group.
- **inputConfig**: `FormInputConfig` = `{}` (Optional)  
  Input element configuration options passed to DataField#toInput.

**Returns**  
`HTMLDivElement`

Inherited from [DataField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toformgroup).

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**: `FormInputConfig` = `{}` (Optional)  
  Form element configuration parameters.

**Returns**  
`HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field.

**Throws**  
An Error if this DataField subclass does not support input rendering.

Inherited from [DataField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toinput).

---

### toObject

```typescript
toObject(value: any): any
```

Export the current value of the field into a serializable object.

**Parameters**

- **value**: `any`  
  The initialized value of the field.

**Returns**  
`any`  
An exported representation of the field.

Inherited from [DataField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toobject).

---

### validate

```typescript
validate(
    value: any, 
    options?: DataFieldValidationOptions
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters**

- **value**: `any`  
  The initial value.
- **options**: `DataFieldValidationOptions` = `{}` (Optional)  
  Options which affect validation behavior.

**Returns**  
`void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

Inherited from [DataField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#validate).

---

### _applyChangeCustom

```typescript
_applyChangeCustom(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

**Protected**

Apply a CUSTOM change to this field.

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns**  
`any`  
The updated value.

Inherited from [DataField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangecustom).

---

### _applyChangeOverride

```typescript
_applyChangeOverride(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

**Protected**

Apply an OVERRIDE change to this field.

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns**  
`any`  
The updated value.

Inherited from [DataField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeoverride).

---

### _cleanType

```typescript
_cleanType(value: any, options?: object): any
```

**Protected**

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **value**: `any`  
  The appropriately coerced value.
- **options**: `object` (Optional)  
  Additional options for how the field is cleaned.

**Returns**  
`any`  
The cleaned value.

Inherited from [DataField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cleantype).

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

**Protected**

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters**

- **value**: `any`  
  The candidate value.

**Returns**  
`boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid.

Inherited from [DataField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatespecial).

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)