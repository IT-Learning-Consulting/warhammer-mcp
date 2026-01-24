# EmbeddedCollectionField

A subclass of [foundry.data.fields.ArrayField](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html) which supports an embedded Document collection. Invalid elements will be dropped from the collection during validation rather than failing for the field entirely.

---

## Hierarchy

- *ArrayField*  
- **EmbeddedCollectionField**  
- *EmbeddedCollectionDeltaField*

---

## Constructors

### constructor

```typescript
new EmbeddedCollectionField(
    element: typeof Document, 
    options?: DataFieldOptions, 
    context?: DataFieldContext
): EmbeddedCollectionField
```

**Parameters**

- **element**: `typeof Document`  
  The type of Document which belongs to this embedded collection.  
  _Optional_

- **options**: `DataFieldOptions = {}`  
  Options which configure the behavior of the field.  
  _Optional_

- **context**: `DataFieldContext = {}`  
  Additional context which describes the field.  
  _Optional_

**Returns**  
`EmbeddedCollectionField`

Overrides [ArrayField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#constructor).

---

## Properties

### element

`element: typeof Document`  
The data type of each element in this array.  
Inherited from [ArrayField.element](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#element).

### options

`options: DataFieldOptions`  
The initially provided options which configure the data field.  
Inherited from [ArrayField.options](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#options).

### hierarchical

`static hierarchical: boolean = true`  
Overrides [ArrayField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#hierarchical).

---

## Accessors

### recursive

`static recursive: boolean = true`  
Inherited from [ArrayField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#recursive).

### fieldPath

```typescript
get fieldPath(): string
```
A dot-separated string representation of the field path within the parent schema.  
Inherited from [ArrayField.fieldPath](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#fieldPath).

### model

```typescript
get model(): typeof Document
```
A reference to the DataModel subclass of the embedded document element.  
**Returns:** `typeof Document`

### schema

```typescript
get schema(): SchemaField
```
The DataSchema of the contained Document model.  
**Returns:** [SchemaField](https://foundryvtt.com/api/classes/foundry.data.fields.SchemaField.html)

### _defaults

```typescript
static get _defaults(): DataFieldOptions & {
    empty: boolean;
    exact: undefined;
    max: number;
    min: number;
    nullable: boolean;
    required: boolean;
}
```

Default parameters for this field type.  
Inherited from [ArrayField._defaults](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_defaults).

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?  
Inherited from [ArrayField.hasFormSupport](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#hasFormSupport).

### implementation

```typescript
static get implementation(): typeof EmbeddedCollection
```

The Collection implementation to use when initializing the collection.  
**Returns:** typeof [EmbeddedCollection](https://foundryvtt.com/api/classes/foundry.abstract.EmbeddedCollection.html)

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
Inherited from [ArrayField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangeadd).

---

### _cast

```typescript
_cast(value: any): any[]
```

**Parameters**

- **value**: `any`  

**Returns**  
`any[]`  
Overrides [ArrayField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_cast).

---

### _castChangeDelta

```typescript
_castChangeDelta(raw: any): any[]
```

**Parameters**

- **raw**: `any`  

**Returns**  
`any[]`  
Inherited from [ArrayField._castChangeDelta](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_castchangedelta).

---

### _cleanType

```typescript
_cleanType(value: any, options?: {}): any
```

**Parameters**

- **value**: `any`  
- **options**: `{}` = {}  

**Returns**  
`any`  
Overrides [ArrayField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_cleantype).

---

### _getField

```typescript
_getField(path: any): any
```

**Parameters**

- **path**: `any`  

**Returns**  
`any`  
Inherited from [ArrayField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_getfield).

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

**Parameters**

- **source**: `any`  
- **key**: `any`  
- **value**: `any`  
- **diff**: `any`  
- **options**: `any`  

**Returns**  
`void`  
Overrides [ArrayField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_updatecommit).

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

Dry-run an update of an EmbeddedCollection, modifying the contents of the safe copy of the source data.

**Parameters**

- **source**: `any`
- **key**: `any`
- **value**: `any`
- **difference**: `any`
- **options**: `any`

**Returns**  
`void`  
Overrides [ArrayField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_updatediff).

---

### _validateElements

```typescript
_validateElements(
    value: any,
    options: any,
): undefined | DataModelValidationFailure
```

**Parameters**

- **value**: `any`
- **options**: `any`

**Returns**  
`undefined` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)  
Overrides [ArrayField._validateElements](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validateelements).

---

### _validateModel

```typescript
_validateModel(changes: any, options: any): void
```

**Parameters**

- **changes**: `any`
- **options**: `any`

**Returns** `void`  
Inherited from [ArrayField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validatemodel).

---

### _validateType

```typescript
_validateType(value: any, options?: {}): void | DataModelValidationFailure
```

**Parameters**

- **value**: `any`
- **options**: `{}` = {}

**Returns**  
`void` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)  
Inherited from [ArrayField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validatetype).

---

### apply

```typescript
apply(fn: any, value?: any[], options?: {}): {}[]
```

**Parameters**

- **fn**: `any`  
- **value**: `any[]` = []  
- **options**: `{}` = {}

**Returns**  
`{ }[]`  
Overrides [ArrayField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#apply).

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

- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)>  
  The model instance.

- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)  
  The change to apply.

**Returns**  
`any`  
Inherited from [ArrayField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#applychange).

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters**

- **value**: `any`  
  An initial requested value.  
  _Optional_

- **options**: `{ partial?: boolean; source?: object } = {}`  
  Additional options for how the field is cleaned.  
  _Optional_

  - **partial?**: `boolean`  
    Whether to perform partial cleaning?  
  - **source?**: `object`  
    The root data model being cleaned.

**Returns**  
`any`  
Inherited from [ArrayField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#clean).

---

### getCollection

```typescript
getCollection(
    parent: Document<object, DocumentConstructionContext>
): DocumentCollection
```

Return the embedded document(s) as a Collection.

**Parameters**

- **parent**: [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)<object, [DocumentConstructionContext](https://foundryvtt.com/api/interfaces/foundry.abstract.types.DocumentConstructionContext.html)>  
  The parent document.

**Returns**  
`DocumentCollection`

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters**

- **data**: `any`

**Returns**  
`any`  
Inherited from [ArrayField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#getinitialvalue).

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

**Parameters**

- **value**: `any`  
- **model**: `any`  
- **options**: `{}` = {}

**Returns**  
`any`  
Overrides [ArrayField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#initialize).

---

### migrateSource

```typescript
migrateSource(sourceData: object, fieldData: any): void
```

Migrate this field's candidate source data.

**Parameters**

- **sourceData**: `object`  
  Candidate source data of the root model.

- **fieldData**: `any`  
  The value of this field within the source data.

**Returns**  
`void`  
Overrides [ArrayField.migrateSource](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#migratesource).

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

- **groupConfig**: [FormGroupConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormGroupConfig.html) = {}  
  Configuration options passed to the wrapping form-group.

- **inputConfig**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = {}  
  Input element configuration options passed to DataField#toInput.

**Returns**  
`HTMLDivElement`  
Inherited from [ArrayField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#toformgroup).

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters**

- **config**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = {}  
  Form element configuration parameters.

**Returns**  
`HTMLElement` | `HTMLCollection`  
A rendered HTMLElement for the field.

**Throws**  
An Error if this DataField subclass does not support input rendering.

Inherited from [ArrayField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#toinput).

---

### toObject

```typescript
toObject(value: any): any
```

**Parameters**

- **value**: `any`

**Returns**  
`any`  
Overrides [ArrayField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#toobject).

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
  _Optional_

- **options**: [DataFieldValidationOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldValidationOptions.html) = {}  
  Options which affect validation behavior.  
  _Optional_

**Returns**  
`void` | [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)  
Inherited from [ArrayField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#validate).

---

## Protected Methods

### _applyChangeCustom

```typescript
_applyChangeCustom(
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
- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.

**Returns**  
`any`  
Inherited from [ArrayField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangecustom).

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

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.

**Returns**  
`any`  
Inherited from [ArrayField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangedowngrade).

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

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.

**Returns**  
`any`  
Inherited from [ArrayField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangemultiply).

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

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.

**Returns**  
`any`  
Inherited from [ArrayField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangeoverride).

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

- **value**: `any` — The field's current value.  
- **delta**: `any` — The change delta.  
- **model**: [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
- **change**: [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.

**Returns**  
`any`  
Inherited from [ArrayField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_applychangeupgrade).

---

### _cleanElement

```typescript
_cleanElement(value: object, options?: object): object
```

Clean data for an individual element in the collection.

**Parameters**

- **value**: `object`  
  Unclean data for the candidate embedded record.

- **options**: `object = {}`  
  Options which control how data is cleaned.

**Returns**  
`object`  
Cleaned data for the candidate embedded record.

---

### _toInput

```typescript
_toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public toInput method which wraps it.

**Parameters**

- **config**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html)  
  Form element configuration parameters.

**Returns**  
`HTMLElement` | `HTMLCollection`  
A rendered HTMLElement for the field.

**Throws**  
An Error if this DataField subclass does not support input rendering.

Inherited from [ArrayField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_toinput).

---

### _validateElement

```typescript
_validateElement(
    value: any,
    options: DataFieldValidationOptions,
): DataModelValidationFailure
```

Validate a single element of the ArrayField.

**Parameters**

- **value**: `any`  
  The value of the array element.

- **options**: [DataFieldValidationOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldValidationOptions.html)  
  Validation options.

**Returns**  
[DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)  
A validation failure if the element failed validation.

Inherited from [ArrayField._validateElement](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validateelement).

---

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters**

- **value**: `any`  
  The candidate value.

**Returns**  
`boolean` | `void`  
A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws**  
May throw a specific error if the value is not valid.

Inherited from [ArrayField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validatespecial).

---

### _validateElementType

```typescript
static _validateElementType(element: any): any
```

**Parameters**

- **element**: `any`

**Returns**  
`any`  
Overrides [ArrayField._validateElementType](https://foundryvtt.com/api/classes/foundry.data.fields.ArrayField.html#_validateelementtype).

---

[Back to Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)