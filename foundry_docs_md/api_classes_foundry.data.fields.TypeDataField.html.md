# TypeDataField | Foundry Virtual Tabletop - API Documentation - Version 13

A subclass of [foundry.data.fields.ObjectField](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html) which supports a type-specific data object.

## Hierarchy
- *[ObjectField](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html)*
- **TypeDataField**

---

# Constructors

### constructor
```typescript
new TypeDataField(
    document: typeof Document,
    options?: DataFieldOptions,
    context?: DataFieldContext,
): TypeDataField
```

**Parameters**

- **document**: `typeof Document`  
  The base document class which belongs in this field  
  *Optional*

- **options**: `DataFieldOptions = {}`  
  Options which configure the behavior of the field  
  *Optional*

- **context**: `DataFieldContext = {}`  
  Additional context which describes the field  
  *Optional*

*Overrides [ObjectField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#constructor)*

---

# Properties

### document
`document: typeof Document`  
The canonical document name of the document type which belongs in this field.

### options
`options: DataFieldOptions`  
The initially provided options which configure the data field  
*Inherited from [ObjectField.options](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#options)*

### hierarchical (static)
`hierarchical: boolean = false`  
Whether this field defines part of a Document/Embedded Document hierarchy.  
*Inherited from [ObjectField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#hierarchical)*

### recursive (static)
`recursive: boolean = true`  
*Overrides [ObjectField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#recursive)*

---

# Accessors

### documentName
```typescript
get documentName(): string
```
A convenience accessor for the name of the document type associated with this TypeDataField

**Returns**: `string`

### fieldPath
```typescript
get fieldPath(): string
```
A dot-separated string representation of the field path within the parent schema.

**Returns**: `string`  
*Inherited from ObjectField.fieldPath*

### _defaults (static)
```typescript
get _defaults(): DataFieldOptions & { nullable: boolean; required: boolean } & { required: boolean; }
```
Default parameters for this field type.

**Returns**: `DataFieldOptions & { nullable: boolean; required: boolean } & { required: boolean; }`  
*Overrides ObjectField._defaults*

### hasFormSupport (static)
```typescript
get hasFormSupport(): boolean
```
Does this form field class have defined form support?

**Returns**: `boolean`  
*Inherited from ObjectField.hasFormSupport*

---

# Methods

### _addTypes
```typescript
_addTypes(source: any, changes: any, options?: {}): void
```

**Parameters**

- **source**: `any`
- **changes**: `any`
- **options**: `{}` = {}  
  Optional configuration

**Returns**: `void`  
*Overrides [ObjectField._addTypes](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_addTypes)*

---

### _cast
```typescript
_cast(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**: `any`  
*Inherited from [ObjectField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_cast)*

---

### _cleanType
```typescript
_cleanType(value: any, options: any): any
```

**Parameters**

- **value**: `any`
- **options**: `any`

**Returns**: `any`  
*Overrides [ObjectField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_cleanType)*

---

### _updateDiff
```typescript
_updateDiff(
    source: any,
    key: any,
    value: any,
    difference: any,
    options: any,
): void
```

**Parameters**

- **source**: `any`
- **key**: `any`
- **value**: `any`
- **difference**: `any`
- **options**: `any`

**Returns**: `void`  
*Overrides [ObjectField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_updateDiff)*

---

### _validateModel
```typescript
_validateModel(changes: any, options?: {}): undefined | void
```

**Parameters**

- **changes**: `any`
- **options**: `{}` = {}  
  Optional configuration

**Returns**: `undefined | void`  
*Overrides [ObjectField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_validateModel)*

---

### _validateType
```typescript
_validateType(data: any, options?: {}): void | DataModelValidationFailure
```

**Parameters**

- **data**: `any`
- **options**: `{}` = {}  
  Optional configuration

**Returns**: `void | DataModelValidationFailure`  
*Overrides [ObjectField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_validateType)*

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

**Returns**: `object`  
*Inherited from [ObjectField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#apply)*

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

**Returns**: `any`  
*Inherited from [ObjectField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#applyChange)*

---

### clean
```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```
Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value

- **options**: `{ partial?: boolean; source?: object } = {}`  
  Additional options for how the field is cleaned  
  - **partial**?: `boolean` (optional) — Whether to perform partial cleaning?  
  - **source**?: `object` (optional) — The root data model being cleaned

**Returns**: `any`  
*Inherited from [ObjectField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#clean)*

---

### getInitialValue
```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`

**Returns**: `any`  
*Overrides [ObjectField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#getInitialValue)*

---

### getModelForType
```typescript
getModelForType(type: string): null | typeof DataModel
```
Get the DataModel definition that should be used for this type of document.

**Parameters**

- **type**: `string`  
  The Document instance type

**Returns**: `null | typeof DataModel`  
The DataModel class or null.

---

### initialize
```typescript
initialize(value: any, model: any, options?: {}): any
```

**Parameters**

- **value**: `any`
- **model**: `any`
- **options**: `{}` = {}  
  Optional configuration

**Returns**: `any`  
*Overrides [ObjectField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#initialize)*

---

### migrateSource
```typescript
migrateSource(sourceData: object, fieldData: any): void
```
Migrate this field's candidate source data.

**Parameters**

- **sourceData**: `object`  
  Candidate source data of the root model

- **fieldData**: `any`  
  The value of this field within the source data

**Returns**: `void`

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

**Returns**: `HTMLDivElement`  
*Inherited from [ObjectField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#toFormGroup)*

---

### toInput
```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```
Render this DataField as an HTML element.

**Parameters**

- **config**: `FormInputConfig = {}`  
  Form element configuration parameters

**Returns**: `HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws**:  
An Error if this DataField subclass does not support input rendering

*Inherited from [ObjectField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#toInput)*

---

### toObject
```typescript
toObject(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**: `any`  
*Overrides [ObjectField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#toObject)*

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

**Returns**: `void | DataModelValidationFailure`  
Returns a DataModelValidationFailure if a validation failure occurred.

*Inherited from [ObjectField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#validate)*

---

# Protected Methods

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

**Returns**: `any`  
*Inherited from [ObjectField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeAdd)*

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

**Returns**: `any`  
*Inherited from [ObjectField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeCustom)*

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

**Returns**: `any`  
*Inherited from [ObjectField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeDowngrade)*

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

**Returns**: `any`  
*Inherited from [ObjectField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeMultiply)*

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

**Returns**: `any`  
*Inherited from [ObjectField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeOverride)*

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

**Returns**: `any`  
*Inherited from [ObjectField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_applyChangeUpgrade)*

---

### _toInput
```typescript
_toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```
Render this DataField as an HTML element. Subclasses should implement this method rather than the public toInput method which wraps it.

**Parameters**

- **config**: `FormInputConfig`  
  Form element configuration parameters

**Returns**: `HTMLElement | HTMLCollection`  
A rendered HTMLElement for the field

**Throws**:  
An Error if this DataField subclass does not support input rendering

*Inherited from [ObjectField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_toInput)*

---

### _validateSpecial
```typescript
_validateSpecial(value: any): boolean | void
```
Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters**

- **value**: `any`  
  The candidate value

**Returns**: `boolean | void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**:  
May throw a specific error if the value is not valid

*Inherited from [ObjectField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.ObjectField.html#_validateSpecial)*

---

# Static Methods

### getModelProvider
```typescript
static getModelProvider(model: DataModel<object, DataModelConstructionContext>): any
```
Return the package that provides the sub-type for the given model.

**Parameters**

- **model**: `DataModel<object, DataModelConstructionContext>`  
  The model instance created for this sub-type.

**Returns**: `any`

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.data.fields.TypeDataField.html).