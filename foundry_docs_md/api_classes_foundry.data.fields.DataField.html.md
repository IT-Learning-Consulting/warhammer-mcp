# DataField

An abstract class that defines the base pattern for a data field within a data schema.

Mixes:  
- DataFieldOptions

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.DataField), Expand):  
- **DataField**  
- [AnyField](https://foundryvtt.com/api/classes/foundry.data.fields.AnyField.html)  
- [ArrayField](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html)  
- [BooleanField](https://foundryvtt.com/api/classes/foundry.data.fields.BooleanField.html)  
- [NumberField](https://foundryvtt.com/api/classes/foundry.data.fields.NumberField.html)  
- [ObjectField](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html)  
- [TypedSchemaField](https://foundryvtt.com/api/classes/foundry.data.fields.TypedSchemaField.html)  
- [SchemaField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)  
- [StringField](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html)  

---

## Constructors

### constructor

```typescript
new DataField(options?: DataFieldOptions, context?: DataFieldContext): DataField
```

**Parameters**

- **options**: `DataFieldOptions` = `{}`  
  Options which configure the behavior of the field.

- **context**: `DataFieldContext` = `{}`  
  Additional context which describes the field.

**Returns**  
`DataField`

---

## Properties

### name

`name: undefined | string`  
The name of this data field within the schema that contains it.

### options

`options: DataFieldOptions`  
The initially provided options which configure the data field.

---

### Static Properties

#### hierarchical

`hierarchical: boolean = false`  
Whether this field defines part of a Document/Embedded Document hierarchy.

#### recursive

`recursive: boolean = false`  
Does this field type contain other fields in a recursive structure? Examples of recursive fields are `SchemaField`, `ArrayField`, or `TypedSchemaField`. Examples of non-recursive fields are `StringField`, `NumberField`, or `ObjectField`.

---

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

---

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?

---

### _defaults

```typescript
protected static get _defaults(): DataFieldOptions
```

Default parameters for this field type.

---

## Methods

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

- **options**: `object` = `{}`  
  Additional options passed to the applied function.

**Returns**  
`object` — The results object.

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
`any` — The updated value.

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a `DataModel` is constructed. For one-off cleaning of user-provided input the `sanitize` method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value.

- **options**:  
  - **partial?**: `boolean`  
    Whether to perform partial cleaning?  
  - **source?**: `object`  
    The root data model being cleaned.

**Returns**  
`any` — The cast value.

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
`any` — A proposed initial value.

---

### initialize

```typescript
initialize(value: any, model: Object, options?: object): any
```

Initialize the original source data into a mutable copy for the `DataModel` instance.

**Parameters**

- **value**: `any`  
  The source value of the field.

- **model**: `Object`  
  The `DataModel` instance that this field belongs to.

- **options**: `object` = `{}`  
  Initialization options.

**Returns**  
`any` — An initialized copy of the source data.

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

**Parameters**

- **groupConfig**: `FormGroupConfig` = `{}`  
  Configuration options passed to the wrapping form-group.

- **inputConfig**: `FormInputConfig` = `{}`  
  Input element configuration options passed to `DataField#toInput`.

**Returns**  
`HTMLDivElement` — The rendered form group element.

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**: `FormInputConfig` = `{}`  
  Form element configuration parameters.

**Returns**  
`HTMLElement | HTMLCollection` — A rendered HTMLElement for the field.

**Throws**  
An Error if this DataField subclass does not support input rendering.

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
`any` — An exported representation of the field.

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a `DataModelValidationFailure` instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters**

- **value**: `any`  
  The initial value.

- **options**: `DataFieldValidationOptions` = `{}`  
  Options which affect validation behavior.

**Returns**  
`void | DataModelValidationFailure` — Returns a `DataModelValidationFailure` if a validation failure occurred.

---

## Protected Methods

### _applyChangeAdd

```typescript
protected _applyChangeAdd(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply an ADD change to this field.

**Parameters**

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: `DataModel<object, DataModelConstructionContext>` — The model instance.  
- **change**: `EffectChangeData` — The original change data.

**Returns**  
`any` — The updated value.

---

### _applyChangeCustom

```typescript
protected _applyChangeCustom(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply a CUSTOM change to this field.

**Parameters**

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: `DataModel<object, DataModelConstructionContext>` — The model instance.  
- **change**: `EffectChangeData` — The original change data.

**Returns**  
`any` — The updated value.

---

### _applyChangeDowngrade

```typescript
protected _applyChangeDowngrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply a DOWNGRADE change to this field.

**Parameters**

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: `DataModel<object, DataModelConstructionContext>` — The model instance.  
- **change**: `EffectChangeData` — The original change data.

**Returns**  
`any` — The updated value.

---

### _applyChangeMultiply

```typescript
protected _applyChangeMultiply(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply a MULTIPLY change to this field.

**Parameters**

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: `DataModel<object, DataModelConstructionContext>` — The model instance.  
- **change**: `EffectChangeData` — The original change data.

**Returns**  
`any` — The updated value.

---

### _applyChangeOverride

```typescript
protected _applyChangeOverride(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply an OVERRIDE change to this field.

**Parameters**

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: `DataModel<object, DataModelConstructionContext>` — The model instance.  
- **change**: `EffectChangeData` — The original change data.

**Returns**  
`any` — The updated value.

---

### _applyChangeUpgrade

```typescript
protected _applyChangeUpgrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply an UPGRADE change to this field.

**Parameters**

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: `DataModel<object, DataModelConstructionContext>` — The model instance.  
- **change**: `EffectChangeData` — The original change data.

**Returns**  
`any` — The updated value.

---

### _cast

```typescript
protected _cast(value: any): any
```

Cast a non-default value to ensure it is the correct type for the field.

**Parameters**

- **value**: `any`  
  The provided non-default value.

**Returns**  
`any` — The standardized value.

---

### _cleanType

```typescript
protected _cleanType(value: any, options?: object): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **value**: `any`  
  The appropriately coerced value.

- **options**: `object` (optional)  
  Additional options for how the field is cleaned.

**Returns**  
`any` — The cleaned value.

---

### _toInput

```typescript
protected _toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public `toInput` method which wraps it.

**Parameters**

- **config**: `FormInputConfig`  
  Form element configuration parameters.

**Returns**  
`HTMLElement | HTMLCollection` — A rendered HTMLElement for the field.

**Throws**  
An Error if this DataField subclass does not support input rendering.

---

### _validateSpecial

```typescript
protected _validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like `null` or `undefined`.

**Parameters**

- **value**: `any`  
  The candidate value.

**Returns**  
`boolean | void` — A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid.

---

### _validateType

```typescript
protected _validateType(
    value: any,
    options?: DataFieldValidationOptions,
): boolean | void | DataModelValidationFailure
```

A default type-specific validator that can be overridden by child classes.

**Parameters**

- **value**: `any`  
  The candidate value.

- **options**: `DataFieldValidationOptions` = `{}`  
  Options which affect validation behavior.

**Returns**  
`boolean | void | DataModelValidationFailure` — A boolean to indicate with certainty whether the value is valid, or specific `DataModelValidationFailure` information, otherwise void.

**Throws**  
May throw a specific error if the value is not valid.

---

For more detailed information, visit the [Foundry Virtual Tabletop API Documentation](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html).