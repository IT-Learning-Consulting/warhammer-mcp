# ForeignDocumentField | Foundry Virtual Tabletop - API Documentation - Version 13

A special class of `foundry.data.fields.StringField` field which references another DataModel by its id. This field may also be null to indicate that no foreign model is linked.

## Hierarchy
- _[DocumentIdField](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html)_
- **ForeignDocumentField**
- _[DocumentAuthorField](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentAuthorField.html)_

---

## Constructors

### constructor

```typescript
new ForeignDocumentField(
    model: typeof Document,
    options?: StringFieldOptions,
    context?: DataFieldContext,
): ForeignDocumentField
```

**Parameters**

- **model**: `typeof Document`  
  The foreign DataModel class definition which this field links to  
  _Optional_

- **options**: `StringFieldOptions = {}`  
  Options which configure the behavior of the field  
  _Optional_

- **context**: `DataFieldContext = {}`  
  Additional context which describes the field

---

## Properties

### blank

- **Type:** `boolean`  
Is the string allowed to be blank (empty)?  
Inherited from [DocumentIdField.blank](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#blank)

### choices

- **Type:** `object | Function | string[] = ...`  
An array of values or an object of values/labels which represent allowed choices for the field. A function may be provided which dynamically returns the array of choices.  
Inherited from [DocumentIdField.choices](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#choices)

### model

- **Type:** `typeof Document`  
A reference to the model class which is stored in this field

### options

- **Type:** `DataFieldOptions`  
The initially provided options which configure the data field  
Inherited from [DocumentIdField.options](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#options)

---

## Accessors

### textSearch

- **Type:** `boolean = ...`  
Is this string field a target for text search?  
Inherited from [DocumentIdField.textSearch](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#textsearch)

### trim

- **Type:** `boolean = ...`  
Should any provided string be trimmed as part of cleaning?  
Inherited from [DocumentIdField.trim](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#trim)

### hierarchical (static)

- **Type:** `boolean = false`  
Whether this field defines part of a Document/Embedded Document hierarchy.  
Inherited from [DocumentIdField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#hierarchical)

### recursive (static)

- **Type:** `boolean = false`  
Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField.  
Inherited from [DocumentIdField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#recursive)

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.  
Inherited from DocumentIdField.fieldPath

### _defaults (static)

```typescript
get _defaults(): DataFieldOptions & {
    blank: boolean;
    choices: undefined;
    textSearch: boolean;
    trim: boolean;
} & {
    blank: boolean;
    nullable: boolean;
    readonly: boolean;
    required: boolean;
    validationError: string;
} & { idOnly: boolean; nullable: boolean; readonly: boolean }
```

Default parameters for this field type  
Overrides DocumentIdField._defaults

### hasFormSupport (static)

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?  
Inherited from DocumentIdField.hasFormSupport

---

## Methods

### _cast

```typescript
_cast(value: any): any
```

**Parameters**

- **value**: `any`

**Returns:** `any`  

Overrides [DocumentIdField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_cast)

---

### _toInput

```typescript
_toInput(config: any): HTMLSelectElement
```

**Parameters**

- **config**: `any`

**Returns:** `HTMLSelectElement`  

Overrides [DocumentIdField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_toinput)

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters**

- **value**: `any`  
  The candidate value

**Returns:** `boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws:** May throw a specific error if the value is not valid  
Inherited from [DocumentIdField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_validatespecial)

---

### _validateType

```typescript
_validateType(value: any, options: any): void
```

**Parameters**

- **value**: `any`
- **options**: `any`

**Returns:** `void`  
Inherited from [DocumentIdField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_validatetype)

---

### apply

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

Apply a function to this DataField which propagates through recursively to any contained data schema.

**Parameters**

- **fn**: `string | Function`  
  The function to apply
- **value**: `any`  
  The current value of this field
- **options**: `object = {}`  
  Additional options passed to the applied function

**Returns:** `object`  
The results object  
Inherited from [DocumentIdField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#apply)

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

**Parameters**

- **value**: `any`  
  The field's current value.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The change to apply.

**Returns:** `any`  
The updated value.  
Inherited from [DocumentIdField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#applychange)

---

### clean

```typescript
clean(value: any, options: any): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value
- **options**: `any`  
  Additional options for how the field is cleaned

**Returns:** `any`  
The cast value  
Inherited from [DocumentIdField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#clean)

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`

**Returns:** `any`  
Inherited from [DocumentIdField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#getinitialvalue)

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

Initialize the original source data into a mutable copy for the DataModel instance.

**Parameters**

- **value**: `any`  
  The source value of the field
- **model**: `any`  
  The DataModel instance that this field belongs to
- **options**: `{}` = {}  
  Initialization options

**Returns:** `any`  
An initialized copy of the source data  
Overrides [DocumentIdField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#initialize)

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

- **groupConfig**: `FormGroupConfig = {}`  
  Configuration options passed to the wrapping form-group
- **inputConfig**: `FormInputConfig = {}`  
  Input element configuration options passed to DataField#toInput

**Returns:** `HTMLDivElement`  
The rendered form group element  
Inherited from [DocumentIdField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#toformgroup)

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**: `FormInputConfig = {}`  
  Form element configuration parameters

**Returns:** `HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws:** An Error if this DataField subclass does not support input rendering  
Inherited from [DocumentIdField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#toinput)

---

### toObject

```typescript
toObject(value: any): any
```

Export the current value of the field into a serializable object.

**Parameters**

- **value**: `any`  
  The initialized value of the field

**Returns:** `any`  
An exported representation of the field  
Overrides [DocumentIdField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#toobject)

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters**

- **value**: `any`  
  The initial value
- **options**: `DataFieldValidationOptions = {}`  
  Options which affect validation behavior

**Returns:** `void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.  
Inherited from [DocumentIdField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#validate)

---

## Protected Methods

### _applyChangeAdd

```typescript
_applyChangeAdd(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an ADD change to this field.

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns:** `any`  
The updated value.  
Inherited from [DocumentIdField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_applychangeadd)

---

### _applyChangeCustom

```typescript
_applyChangeCustom(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

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

**Returns:** `any`  
The updated value.  
Inherited from [DocumentIdField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_applychangecustom)

---

### _applyChangeDowngrade

```typescript
_applyChangeDowngrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply a DOWNGRADE change to this field.

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns:** `any`  
The updated value.  
Inherited from [DocumentIdField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_applychangedowngrade)

---

### _applyChangeMultiply

```typescript
_applyChangeMultiply(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply a MULTIPLY change to this field.

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns:** `any`  
The updated value.  
Inherited from [DocumentIdField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_applychangemultiply)

---

### _applyChangeOverride

```typescript
_applyChangeOverride(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

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

**Returns:** `any`  
The updated value.  
Inherited from [DocumentIdField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_applychangeoverride)

---

### _applyChangeUpgrade

```typescript
_applyChangeUpgrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

Apply an UPGRADE change to this field.

**Parameters**

- **value**: `any`  
  The field's current value.
- **delta**: `any`  
  The change delta.
- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance.
- **change**: `EffectChangeData`  
  The original change data.

**Returns:** `any`  
The updated value.  
Inherited from [DocumentIdField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_applychangeupgrade)

---

### _cleanType

```typescript
_cleanType(value: any, options?: object): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **value**: `any`  
  The appropriately coerced value.
- **options**: `object` (optional)  
  Additional options for how the field is cleaned.

**Returns:** `any`  
The cleaned value.  
Inherited from [DocumentIdField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_cleantype)

---

### _isValidChoice

```typescript
_isValidChoice(value: string): boolean
```

Test whether a provided value is a valid choice from the allowed choice set.

**Parameters**

- **value**: `string`  
  The provided value

**Returns:** `boolean`  
Is the choice valid?  
Inherited from [DocumentIdField._isValidChoice](https://foundryvtt.com/api/classes/foundry.data.fields.DocumentIdField.html#_isvalidchoice)

---

For complete documentation, see [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.data.fields.ForeignDocumentField.html).