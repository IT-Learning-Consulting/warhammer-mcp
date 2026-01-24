# EmbeddedCollectionDeltaField

A subclass of [foundry.data.fields.EmbeddedCollectionField](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html) which manages a collection of delta objects relative to another collection.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.data.fields.EmbeddedCollectionDeltaField)  
- *EmbeddedCollectionField*  
- **EmbeddedCollectionDeltaField**

---

## Constructors

### constructor

```typescript
new EmbeddedCollectionDeltaField(
    element: typeof Document,
    options?: DataFieldOptions,
    context?: DataFieldContext
): EmbeddedCollectionDeltaField
```

**Parameters:**  
- **element**: *typeof [Document](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)*  
  The type of Document which belongs to this embedded collection  
  *Optional*  
- **options**: *[DataFieldOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldOptions.html)* = {}  
  Options which configure the behavior of the field  
  *Optional*  
- **context**: *[DataFieldContext](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldContext.html)* = {}  
  Additional context which describes the field

**Returns:**  
- *EmbeddedCollectionDeltaField*  

Inherited from [EmbeddedCollectionField.constructor](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#constructor)

---

## Properties

### element

```typescript
element: typeof Document
```

The data type of each element in this array.  
Inherited from [EmbeddedCollectionField.element](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#element)

### options

```typescript
options: DataFieldOptions = {}
```

The initially provided options which configure the data field.  
Inherited from [EmbeddedCollectionField.options](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#options)

### hierarchical

```typescript
static hierarchical: boolean = true
```

Inherited from [EmbeddedCollectionField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#hierarchical)

### recursive

```typescript
static recursive: boolean = true
```

Inherited from [EmbeddedCollectionField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#recursive)

---

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

A dot-separated string representation of the field path within the parent schema.

**Returns:**  
- *string*  

Inherited from EmbeddedCollectionField.fieldPath

### model

```typescript
get model(): typeof Document
```

A reference to the DataModel subclass of the embedded document element

**Returns:**  
- *typeof Document*  

Inherited from EmbeddedCollectionField.model

### schema

```typescript
get schema(): SchemaField
```

The DataSchema of the contained Document model.

**Returns:**  
- *SchemaField*  

Inherited from EmbeddedCollectionField.schema

### _defaults

```typescript
get _defaults(): DataFieldOptions & {
    empty: boolean;
    exact: undefined;
    max: number;
    min: number;
    nullable: boolean;
    required: boolean;
}
```

Default parameters for this field type.

**Returns:**  
- *DataFieldOptions & { empty: boolean; exact: undefined; max: number; min: number; nullable: boolean; required: boolean; }*  

Inherited from EmbeddedCollectionField._defaults

### hasFormSupport

```typescript
static get hasFormSupport(): boolean
```

Does this form field class have defined form support?

**Returns:**  
- *boolean*  

Inherited from EmbeddedCollectionField.hasFormSupport

### implementation

```typescript
static get implementation(): typeof EmbeddedCollectionDelta
```

Overrides EmbeddedCollectionField.implementation

**Returns:**  
- *typeof EmbeddedCollectionDelta*

---

## Methods

### _applyChangeAdd

```typescript
_applyChangeAdd(value: any, delta: any, model: any, change: any): any
```

**Parameters:**  
- **value**: *any*  
- **delta**: *any*  
- **model**: *any*  
- **change**: *any*

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_applychangeadd)

---

### _cast

```typescript
_cast(value: any): any[]
```

**Parameters:**  
- **value**: *any*

**Returns:**  
- *any[]*

Inherited from [EmbeddedCollectionField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_cast)

---

### _castChangeDelta

```typescript
_castChangeDelta(raw: any): any[]
```

**Parameters:**  
- **raw**: *any*

**Returns:**  
- *any[]*

Inherited from [EmbeddedCollectionField._castChangeDelta](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_castchangedelta)

---

### _cleanElement

```typescript
_cleanElement(value: any, options?: {}): any
```

**Parameters:**  
- **value**: *any*  
- **options**: *{}* = {}

**Returns:**  
- *any*

Overrides [EmbeddedCollectionField._cleanElement](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_cleanelement)

---

### _cleanType

```typescript
_cleanType(value: any, options?: {}): any
```

**Parameters:**  
- **value**: *any*  
- **options**: *{}* = {}

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_cleantype)

---

### _getField

```typescript
_getField(path: any): any
```

**Parameters:**  
- **path**: *any*

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField._getField](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_getfield)

---

### _updateCommit

```typescript
_updateCommit(source: any, key: any, value: any, diff: any, options: any): void
```

**Parameters:**  
- **source**: *any*  
- **key**: *any*  
- **value**: *any*  
- **diff**: *any*  
- **options**: *any*

**Returns:**  
- *void*

Inherited from [EmbeddedCollectionField._updateCommit](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_updatecommit)

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

**Parameters:**  
- **source**: *any*  
- **key**: *any*  
- **value**: *any*  
- **difference**: *any*  
- **options**: *any*

**Returns:**  
- *void*

Inherited from [EmbeddedCollectionField._updateDiff](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_updatediff)

---

### _validateElements

```typescript
_validateElements(
    value: any,
    options: any,
): undefined | DataModelValidationFailure
```

**Parameters:**  
- **value**: *any*  
- **options**: *any*

**Returns:**  
- *undefined* | *[DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)*

Overrides [EmbeddedCollectionField._validateElements](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_validateelements)

---

### _validateModel

```typescript
_validateModel(changes: any, options: any): void
```

**Parameters:**  
- **changes**: *any*  
- **options**: *any*

**Returns:**  
- *void*

Inherited from [EmbeddedCollectionField._validateModel](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_validatemodel)

---

### _validateType

```typescript
_validateType(value: any, options?: {}): void | DataModelValidationFailure
```

**Parameters:**  
- **value**: *any*  
- **options**: *{}* = {}

**Returns:**  
- *void* | *[DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)*

Inherited from [EmbeddedCollectionField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_validatetype)

---

### apply

```typescript
apply(fn: any, value?: any[], options?: {}): {}[]
```

**Parameters:**  
- **fn**: *any*  
- **value**: *any[]* = []  
- **options**: *{}* = {}

**Returns:**  
- *{}[]*

Inherited from [EmbeddedCollectionField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#apply)

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

**Parameters:**  
- **value**: *any*  
  The field's current value.  
- **model**: *DataModel<object, DataModelConstructionContext>*  
  The model instance.  
- **change**: *[EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)*  
  The change to apply.

**Returns:**  
- *any*  
  The updated value.

Inherited from [EmbeddedCollectionField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#applychange)

---

### clean

```typescript
clean(value: any, options?: { partial?: boolean; source?: object }): any
```

Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.

**Parameters:**  
- **value**: *any*  
  An initial requested value  
  *Optional*  
- **options**: *{ partial?: boolean; source?: object }* = {}  
  Additional options for how the field is cleaned  
  *Optional*  
- **partial**?: *boolean*  
  Whether to perform partial cleaning?  
  *Optional*  
- **source**?: *object*  
  The root data model being cleaned

**Returns:**  
- *any*  
  The cast value  

Inherited from [EmbeddedCollectionField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#clean)

---

### getCollection

```typescript
getCollection(
    parent: Document<object, DocumentConstructionContext>
): DocumentCollection
```

Return the embedded document(s) as a Collection.

**Parameters:**  
- **parent**: *Document<object, DocumentConstructionContext>*  
  The parent document.

**Returns:**  
- *DocumentCollection*

Inherited from [EmbeddedCollectionField.getCollection](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#getcollection)

---

### getInitialValue

```typescript
getInitialValue(data: any): any
```

**Parameters:**  
- **data**: *any*

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#getinitialvalue)

---

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

**Parameters:**  
- **value**: *any*  
- **model**: *any*  
- **options**: *{}* = {}

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#initialize)

---

### migrateSource

```typescript
migrateSource(sourceData: object, fieldData: any): void
```

Migrate this field's candidate source data.

**Parameters:**  
- **sourceData**: *object*  
  Candidate source data of the root model  
- **fieldData**: *any*  
  The value of this field within the source data

**Returns:**  
- *void*

Inherited from [EmbeddedCollectionField.migrateSource](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#migratesource)

---

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

Render this DataField as a standardized form-group element.

**Parameters:**  
- **groupConfig**: *FormGroupConfig* = {}  
  Configuration options passed to the wrapping form-group  
- **inputConfig**: *FormInputConfig* = {}  
  Input element configuration options passed to DataField#toInput

**Returns:**  
- *HTMLDivElement*  
  The rendered form group element

Inherited from [EmbeddedCollectionField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#toformgroup)

---

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element.

**Parameters:**  
- **config**: *FormInputConfig* = {}  
  Form element configuration parameters

**Returns:**  
- *HTMLElement* | *HTMLCollection*  
  A rendered HTMLElement for the field

**Throws:**  
- An Error if this DataField subclass does not support input rendering

Inherited from [EmbeddedCollectionField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#toinput)

---

### toObject

```typescript
toObject(value: any): any
```

**Parameters:**  
- **value**: *any*

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#toobject)

---

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions
): void | DataModelValidationFailure
```

Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.

**Parameters:**  
- **value**: *any*  
  The initial value  
  *Optional*  
- **options**: *DataFieldValidationOptions* = {}  
  Options which affect validation behavior

**Returns:**  
- *void* | *DataModelValidationFailure*  
  Returns a DataModelValidationFailure if a validation failure occurred.

Inherited from [EmbeddedCollectionField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#validate)

---

### _applyChangeCustom (protected)

```typescript
_applyChangeCustom(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply a CUSTOM change to this field.

**Parameters:**  
- **value**: *any*  
  The field's current value.  
- **delta**: *any*  
  The change delta.  
- **model**: *DataModel<object, DataModelConstructionContext>*  
  The model instance.  
- **change**: *EffectChangeData*  
  The original change data.

**Returns:**  
- *any*  
  The updated value.

Inherited from [EmbeddedCollectionField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_applychangecustom)

---

### _applyChangeDowngrade (protected)

```typescript
_applyChangeDowngrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply a DOWNGRADE change to this field.

**Parameters:**  
- **value**: *any*  
- **delta**: *any*  
- **model**: *DataModel<object, DataModelConstructionContext>*  
- **change**: *EffectChangeData*

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_applychangedowngrade)

---

### _applyChangeMultiply (protected)

```typescript
_applyChangeMultiply(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply a MULTIPLY change to this field.

**Parameters:**  
- **value**: *any*  
- **delta**: *any*  
- **model**: *DataModel<object, DataModelConstructionContext>*  
- **change**: *EffectChangeData*

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_applychangemultiply)

---

### _applyChangeOverride (protected)

```typescript
_applyChangeOverride(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply an OVERRIDE change to this field.

**Parameters:**  
- **value**: *any*  
- **delta**: *any*  
- **model**: *DataModel<object, DataModelConstructionContext>*  
- **change**: *EffectChangeData*

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_applychangeoverride)

---

### _applyChangeUpgrade (protected)

```typescript
_applyChangeUpgrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData
): any
```

Apply an UPGRADE change to this field.

**Parameters:**  
- **value**: *any*  
- **delta**: *any*  
- **model**: *DataModel<object, DataModelConstructionContext>*  
- **change**: *EffectChangeData*

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_applychangeupgrade)

---

### _toInput (protected)

```typescript
_toInput(config: FormInputConfig): HTMLElement | HTMLCollection
```

Render this DataField as an HTML element. Subclasses should implement this method rather than the public toInput method which wraps it.

**Parameters:**  
- **config**: *FormInputConfig*  
  Form element configuration parameters

**Returns:**  
- *HTMLElement* | *HTMLCollection*  
  A rendered HTMLElement for the field

**Throws:**  
- An Error if this DataField subclass does not support input rendering

Inherited from [EmbeddedCollectionField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_toinput)

---

### _validateElement (protected)

```typescript
_validateElement(
    value: any,
    options: DataFieldValidationOptions,
): DataModelValidationFailure
```

Validate a single element of the ArrayField.

**Parameters:**  
- **value**: *any*  
  The value of the array element  
- **options**: *DataFieldValidationOptions*  
  Validation options

**Returns:**  
- *DataModelValidationFailure*  
  A validation failure if the element failed validation

Inherited from [EmbeddedCollectionField._validateElement](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_validateelement)

---

### _validateSpecial (protected)

```typescript
_validateSpecial(value: any): boolean | void
```

Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like null or undefined.

**Parameters:**  
- **value**: *any*  
  The candidate value

**Returns:**  
- *boolean* | *void*  
  A boolean to indicate with certainty whether the value is valid. Otherwise, return void.

**Throws:**  
- May throw a specific error if the value is not valid

Inherited from [EmbeddedCollectionField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_validatespecial)

---

### _validateElementType (static)

```typescript
static _validateElementType(element: any): any
```

**Parameters:**  
- **element**: *any*

**Returns:**  
- *any*

Inherited from [EmbeddedCollectionField._validateElementType](https://foundryvtt.com/api/classes/foundry.data.fields.EmbeddedCollectionField.html#_validateelementtype)