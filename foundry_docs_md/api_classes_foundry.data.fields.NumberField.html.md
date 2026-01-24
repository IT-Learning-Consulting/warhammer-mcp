# NumberField | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of [foundry.data.fields.DataField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html) which deals with number-typed data.

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.NumberField), Expand)  
* _DataField_  
* **NumberField**  
  * [AlphaField](https://foundryvtt.com/api/classes/foundry.data.fields.AlphaField.html)  
  * [AngleField](https://foundryvtt.com/api/classes/foundry.data.fields.AngleField.html)  
  * [HueField](https://foundryvtt.com/api/classes/foundry.data.fields.HueField.html)  
  * [IntegerSortField](https://foundryvtt.com/api/classes/foundry.data.fields.IntegerSortField.html)  

---

## Constructors

### constructor

```typescript
new NumberField(
    options?: NumberFieldOptions,
    context?: DataFieldContext,
): NumberField
```

**Parameters**

- **options**: `NumberFieldOptions` = `{}`  
  Options which configure the behavior of the field (Optional)

- **context**: `DataFieldContext` = `{}`  
  Additional context which describes the field (Optional)

**Returns:**  
`NumberField`

Overrides [DataField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#constructor)

---

## Accessors

### options

`options: DataFieldOptions`

The initially provided options which configure the data field  
Inherited from [DataField.options](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#options)

### hierarchical

`static hierarchical: boolean = false`

Whether this field defines part of a Document/Embedded Document hierarchy.  
Inherited from [DataField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#hierarchical)

### recursive

`static recursive: boolean = false`

Does this field type contain other fields in a recursive structure?  
Examples of recursive fields are SchemaField, ArrayField, or TypeDataField  
Examples of non-recursive fields are StringField, NumberField, or ObjectField  
Inherited from [DataField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#recursive)

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.  
Inherited from DataField.fieldPath

---

## Methods

### _defaults

```typescript
get _defaults(): DataFieldOptions & {
    choices: undefined;
    integer: boolean;
    max: undefined;
    min: undefined;
    nullable: boolean;
    positive: boolean;
    step: undefined;
}
```

Default parameters for this field type  
Overrides DataField._defaults

---

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?  
Inherited from DataField.hasFormSupport

---

### _applyChangeDowngrade

```typescript
_applyChangeDowngrade(value: any, delta: any, model: any, change: any): any
```

Overrides [DataField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangedowngrade)

**Parameters**

- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`

**Returns:**  
`any`

---

### _applyChangeMultiply

```typescript
_applyChangeMultiply(value: any, delta: any, model: any, change: any): number
```

Overrides [DataField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangemultiply)

**Parameters**

- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`

**Returns:**  
`number`

---

### _applyChangeUpgrade

```typescript
_applyChangeUpgrade(value: any, delta: any, model: any, change: any): any
```

Overrides [DataField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeupgrade)

**Parameters**

- **value**: `any`  
- **delta**: `any`  
- **model**: `any`  
- **change**: `any`

**Returns:**  
`any`

---

### _cast

```typescript
_cast(value: any): null | number
```

Overrides [DataField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cast)

**Parameters**

- **value**: `any`

**Returns:**  
`null | number`

---

### _cleanType

```typescript
_cleanType(value: any, options: any): any
```

Apply any cleaning logic specific to this DataField type.  
Overrides [DataField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_cleantype)

**Parameters**

- **value**: `any`  
  The appropriately coerced value.

- **options**: `any`  
  Additional options for how the field is cleaned.

**Returns:**  
`any`  
The cleaned value.

---

### _toInput

```typescript
_toInput(
    config: any,
): HTMLInputElement | HTMLSelectElement | HTMLRangePickerElement
```

Overrides [DataField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_toinput)

**Parameters**

- **config**: `any`

**Returns:**  
`HTMLInputElement | HTMLSelectElement | HTMLRangePickerElement`

---

### _validateType

```typescript
_validateType(value: any): void
```

Overrides [DataField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatetype)

**Parameters**

- **value**: `any`

**Returns:**  
`void`

---

### apply

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

Apply a function to this DataField which propagates through recursively to any contained data schema.  
Inherited from [DataField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#apply)

**Parameters**

- **fn**: `string | Function`  
  The function to apply

- **value**: `any`  
  The current value of this field

- **options**: `object` = `{}` (Optional)  
  Additional options passed to the applied function

**Returns:**  
`object`  
The results object

---

### applyChange

```typescript
applyChange(
    value: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an ActiveEffectChange to this field.  
Inherited from [DataField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#applychange)

**Parameters**

- **value**: `any`  
  The field's current value.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The change to apply.

**Returns:**  
`any`  
The updated value.

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.  
Inherited from [DataField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#clean)

**Parameters**

- **value**: `any`  
  An initial requested value

- **options**: `{ partial?: boolean; source?: object }` = `{}` (Optional)  
  Additional options for how the field is cleaned

  - **partial?**: `boolean`  
    Whether to perform partial cleaning?

  - **source?**: `object`  
    The root data model being cleaned

**Returns:**  
`any`  
The cast value

---

### getInitialValue

```typescript
getInitialValue(data: object): any
```

Attempt to retrieve a valid initial value for the DataField.  
Inherited from [DataField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#getinitialvalue)

**Parameters**

- **data**: `object`  
  The source data object for which an initial value is required

**Returns:**  
`any`  
A proposed initial value

---

### initialize

```typescript
initialize(value: any, model: Object, options?: object): any
```

Initialize the original source data into a mutable copy for the DataModel instance.  
Inherited from [DataField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#initialize)

**Parameters**

- **value**: `any`  
  The source value of the field

- **model**: `Object`  
  The DataModel instance that this field belongs to

- **options**: `object` = `{}` (Optional)  
  Initialization options

**Returns:**  
`any`  
An initialized copy of the source data

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.  
Inherited from [DataField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toformgroup)

**Parameters**

- **groupConfig**: `FormGroupConfig` = `{}`  
  Configuration options passed to the wrapping form-group

- **inputConfig**: `FormInputConfig` = `{}`  
  Input element configuration options passed to DataField#toInput

**Returns:**  
`HTMLDivElement`  
The rendered form group element

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.  
Inherited from [DataField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toinput)

**Parameters**

- **config**: `FormInputConfig` = `{}`  
  Form element configuration parameters

**Returns:**  
`HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws:**  
An Error if this DataField subclass does not support input rendering

---

### toObject

```typescript
toObject(value: any): any
```

Export the current value of the field into a serializable object.  
Inherited from [DataField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#toobject)

**Parameters**

- **value**: `any`  
  The initialized value of the field

**Returns:**  
`any`  
An exported representation of the field

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.  
Inherited from [DataField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#validate)

**Parameters**

- **value**: `any`  
  The initial value

- **options**: `DataFieldValidationOptions` = `{}` (Optional)  
  Options which affect validation behavior

**Returns:**  
`void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

---

### _applyChangeAdd

```typescript
protected _applyChangeAdd(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an ADD change to this field.  
Inherited from [DataField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeadd)

**Parameters**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The original change data.

**Returns:**  
`any`  
The updated value.

---

### _applyChangeCustom

```typescript
protected _applyChangeCustom(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply a CUSTOM change to this field.  
Inherited from [DataField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangecustom)

**Parameters**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The original change data.

**Returns:**  
`any`  
The updated value.

---

### _applyChangeOverride

```typescript
protected _applyChangeOverride(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an OVERRIDE change to this field.  
Inherited from [DataField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_applychangeoverride)

**Parameters**

- **value**: `any`  
  The field's current value.

- **delta**: `any`  
  The change delta.

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.

- **change**: `EffectChangeData`  
  The original change data.

**Returns:**  
`any`  
The updated value.

---

### _validateSpecial

```typescript
protected _validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.  
Inherited from [DataField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html#_validatespecial)

**Parameters**

- **value**: `any`  
  The candidate value

**Returns:**  
`boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws:**  
May throw a specific error if the value is not valid.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)