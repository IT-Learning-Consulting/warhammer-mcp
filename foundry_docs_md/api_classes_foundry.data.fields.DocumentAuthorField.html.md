# DocumentAuthorField | Foundry Virtual Tabletop - API Documentation - Version 13

A special [foundry.data.fields.ForeignDocumentField](https://foundryvtt.com/api/classes/foundry.data.fields.ForeignDocumentField.html) which defines the original author of a document. This can only be changed later by GM users.

## Hierarchy  
(View Summary, Expand)  
- *ForeignDocumentField*  
- **DocumentAuthorField**

---

## Constructors

```typescript
new DocumentAuthorField(
    model: typeof Document,
    options?: StringFieldOptions,
    context?: DataFieldContext,
): DocumentAuthorField
```

**Parameters**

- **model**: `typeof Document`  
  The foreign DataModel class definition which this field links to

- **options**?: `StringFieldOptions = {}`  
  Options which configure the behavior of the field

- **context**?: `DataFieldContext = {}`  
  Additional context which describes the field

**Returns**  
`DocumentAuthorField`

---

## Properties

### Inherited from [ForeignDocumentField](https://foundryvtt.com/api/classes/foundry.data.fields.ForeignDocumentField.html)

#### blank

`blank: boolean`  
Is the string allowed to be blank (empty)?

#### choices

`choices: object | Function | string[] = ...`  
An array of values or an object of values/labels which represent allowed choices for the field.  
A function may be provided which dynamically returns the array of choices.

#### model

`model: typeof Document`  
A reference to the model class which is stored in this field

#### options

`options: DataFieldOptions`  
The initially provided options which configure the data field

#### textSearch

`textSearch: boolean = ...`  
Is this string field a target for text search?

#### trim

`trim: boolean = ...`  
Should any provided string be trimmed as part of cleaning?

#### hierarchical (Static)

`hierarchical: boolean = false`  
Whether this field defines part of a Document/Embedded Document hierarchy.

#### recursive (Static)

`recursive: boolean = false`  
Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField.

---

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

### _defaults (Static)

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
} & { idOnly: boolean; nullable: boolean; readonly: boolean } & {
    gmOnly: boolean;
    initial: () => undefined | null | string;
    label: string;
    nullable: boolean;
}
```

Default parameters for this field type.

### hasFormSupport

```typescript
get hasFormSupport(): boolean
```

Does this form field class have defined form support?

---

## Methods

### _cast

```typescript
_cast(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`

---

### _toInput

```typescript
_toInput(config: any): HTMLSelectElement
```

**Parameters**

- **config**: `any`

**Returns**  
`HTMLSelectElement`

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like `null` or `undefined`.

**Parameters**

- **value**: `any`  
  The candidate value

**Returns**  
`boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid.

---

### _validateType

```typescript
_validateType(value: any, options: any): void
```

**Parameters**

- **value**: `any`  
- **options**: `any`

**Returns**  
`void`

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

- **options**?: `object = {}`  
  Additional options passed to the applied function

**Returns**  
`object`  
The results object.

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

**Returns**  
`any`  
The updated value.

---

### clean

```typescript
clean(value: any, options: any): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input, the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value

- **options**: `any`  
  Additional options for how the field is cleaned

**Returns**  
`any`  
The cast value.

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`  

**Returns**  
`any`

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

- **options**?: `{}`  
  Initialization options

**Returns**  
`any`  
An initialized copy of the source data.

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

- **groupConfig**?: `FormGroupConfig = {}`  
  Configuration options passed to the wrapping form-group

- **inputConfig**?: `FormInputConfig = {}`  
  Input element configuration options passed to DataField#toInput

**Returns**  
`HTMLDivElement`  
The rendered form group element.

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**?: `FormInputConfig = {}`  
  Form element configuration parameters

**Returns**  
`HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field.

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
  The initialized value of the field

**Returns**  
`any`  
An exported representation of the field.

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

- **options**?: `DataFieldValidationOptions = {}`  
  Options which affect validation behavior

**Returns**  
`void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

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

**Returns**  
`any`  
The updated value.

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

**Returns**  
`any`  
The updated value.

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

**Returns**  
`any`  
The updated value.

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

**Returns**  
`any`  
The updated value.

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

**Returns**  
`any`  
The updated value.

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

**Returns**  
`any`  
The updated value.

---

### _cleanType

```typescript
_cleanType(value: any, options?: object): any
```

Apply any cleaning logic specific to this DataField type.

**Parameters**

- **value**: `any`  
  The appropriately coerced value.

- **options**?: `object`  
  Additional options for how the field is cleaned.

**Returns**  
`any`  
The cleaned value.

---

### _isValidChoice

```typescript
_isValidChoice(value: string): boolean
```

Test whether a provided value is a valid choice from the allowed choice set.

**Parameters**

- **value**: `string`  
  The provided value.

**Returns**  
`boolean`  
Is the choice valid?