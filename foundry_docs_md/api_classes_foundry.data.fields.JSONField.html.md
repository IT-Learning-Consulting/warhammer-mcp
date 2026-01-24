# JSONField | Foundry Virtual Tabletop - API Documentation - Version 13

A special [foundry.data.fields.StringField which contains serialized JSON data.](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html)

## Hierarchy

- _StringField_
- **JSONField**

---

## Properties

### options

- **Type:** [DataFieldOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldOptions.html)  
- **Description:** The initially provided options which configure the data field  
- **Inherited from:** [StringField.options](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#options)

### textSearch

- **Type:** `boolean` = ...  
- **Description:** Is this string field a target for text search?  
- **Inherited from:** [StringField.textSearch](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#textsearch)

### hierarchical

- **Type:** `boolean` = false (Static)  
- **Description:** Whether this field defines part of a Document/Embedded Document hierarchy.  
- **Inherited from:** [StringField.hierarchical](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#hierarchical)  

### recursive

- **Type:** `boolean` = false (Static)  
- **Description:** Does this field type contain other fields in a recursive structure? Examples of recursive fields are SchemaField, ArrayField, or TypeDataField. Examples of non-recursive fields are StringField, NumberField, or ObjectField.  
- **Inherited from:** [StringField.recursive](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#recursive)

---

## Accessors

### fieldPath

```typescript
get fieldPath(): string
```

- **Description:** A dot-separated string representation of the field path within the parent schema.  
- **Returns:** `string`  
- **Inherited from:** StringField.fieldPath

### _defaults

```typescript
get _defaults(): DataFieldOptions & {
    blank: boolean;
    choices: undefined;
    textSearch: boolean;
    trim: boolean;
} & {
    blank: boolean;
    initial: undefined;
    trim: boolean;
    validationError: string;
}
```

- **Description:** Default parameters for this field type  
- **Returns:** DataFieldOptions with additional properties  
- **Overrides:** StringField._defaults

### hasFormSupport

```typescript
get hasFormSupport(): boolean
```

- **Description:** Does this form field class have defined form support?  
- **Returns:** `boolean`  
- **Inherited from:** StringField.hasFormSupport

---

## Methods

### _cast

```typescript
_cast(value: any): string
```

- **Parameters:**  
  - **value:** `any`  
- **Returns:** `string`  
- **Description:** Overrides [StringField._cast](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_cast)

### _toInput

```typescript
_toInput(config: FormInputConfig & CodeMirrorInputConfig): HTMLCodeMirrorElement
```

- **Parameters:**  
  - **config:** [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) & [CodeMirrorInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.CodeMirrorInputConfig.html)  
- **Returns:** [HTMLCodeMirrorElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLCodeMirrorElement.html)  
- **Description:** Overrides [StringField._toInput](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_toinput)

### _validateSpecial

```typescript
_validateSpecial(value: any): boolean | void
```

- **Parameters:**  
  - **value:** `any` — The candidate value  
- **Returns:** `boolean` or `void`  
- **Description:**  
  Special validation rules which supersede regular field validation. This validator screens for certain values which are otherwise incompatible with this field like `null` or `undefined`.  
- **Throws:** May throw a specific error if the value is not valid.  
- **Inherited from:** [StringField._validateSpecial](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_validatespecial)

### _validateType

```typescript
_validateType(value: any, options: any): void
```

- **Parameters:**  
  - **value:** `any`  
  - **options:** `any`  
- **Returns:** `void`  
- **Description:** Overrides [StringField._validateType](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_validatetype)

### apply

```typescript
apply(fn: string | Function, value: any, options?: object): object
```

- **Parameters:**  
  - **fn:** `string` | `Function` — The function to apply  
  - **value:** `any` — The current value of this field  
  - **options:** `object` = {} — Additional options passed to the applied function  
- **Returns:** `object` — The results object  
- **Description:** Apply a function to this DataField which propagates through recursively to any contained data schema.  
- **Inherited from:** [StringField.apply](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#apply)

### applyChange

```typescript
applyChange(
    value: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

- **Parameters:**  
  - **value:** `any` — The field's current value.  
  - **model:** [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
  - **change:** [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The change to apply.  
- **Returns:** `any` — The updated value.  
- **Description:** Apply an ActiveEffectChange to this field.  
- **Inherited from:** [StringField.applyChange](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#applychange)

### clean

```typescript
clean(value: any, options: any): any
```

- **Parameters:**  
  - **value:** `any` — An initial requested value  
  - **options:** `any` — Additional options for how the field is cleaned  
- **Returns:** `any` — The cast value  
- **Description:**  
  Coerce source data to ensure that it conforms to the correct data type for the field. Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed. For one-off cleaning of user-provided input the sanitize method should be used.  
- **Overrides:** [StringField.clean](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#clean)

### getInitialValue

```typescript
getInitialValue(data: any): any
```

- **Parameters:**  
  - **data:** `any`  
- **Returns:** `any`  
- **Inherited from:** [StringField.getInitialValue](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#getinitialvalue)

### initialize

```typescript
initialize(value: any, model: any, options?: {}): any
```

- **Parameters:**  
  - **value:** `any`  
  - **model:** `any`  
  - **options:** `{}` = {}  
- **Returns:** `any`  
- **Overrides:** [StringField.initialize](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#initialize)

### toFormGroup

```typescript
toFormGroup(
    groupConfig?: FormGroupConfig,
    inputConfig?: FormInputConfig,
): HTMLDivElement
```

- **Parameters:**  
  - **groupConfig:** [FormGroupConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormGroupConfig.html) = {} — Configuration options passed to the wrapping form-group  
  - **inputConfig:** [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = {} — Input element configuration options passed to DataField#toInput  
- **Returns:** `HTMLDivElement` — The rendered form group element  
- **Inherited from:** [StringField.toFormGroup](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#toformgroup)

### toInput

```typescript
toInput(config?: FormInputConfig): HTMLElement | HTMLCollection
```

- **Parameters:**  
  - **config:** [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) = {} — Form element configuration parameters  
- **Returns:** `HTMLElement | HTMLCollection` — A rendered HTMLElement for the field  
- **Throws:** An Error if this DataField subclass does not support input rendering  
- **Inherited from:** [StringField.toInput](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#toinput)

### toObject

```typescript
toObject(value: any): any
```

- **Parameters:**  
  - **value:** `any`  
- **Returns:** `any`  
- **Overrides:** [StringField.toObject](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#toobject)

### validate

```typescript
validate(
    value: any,
    options?: DataFieldValidationOptions,
): void | DataModelValidationFailure
```

- **Parameters:**  
  - **value:** `any` — The initial value  
  - **options:** [DataFieldValidationOptions](https://foundryvtt.com/api/interfaces/foundry.data.types.DataFieldValidationOptions.html) = {} — Options which affect validation behavior  
- **Returns:** `void` or [DataModelValidationFailure](https://foundryvtt.com/api/classes/foundry.data.validation.DataModelValidationFailure.html)  
- **Description:**  
  Validate a candidate input for this field, ensuring it meets the field requirements. A validation failure can be provided as a raised Error (with a string message), by returning false, or by returning a DataModelValidationFailure instance. A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.  
- **Inherited from:** [StringField.validate](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#validate)

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

- **Description:** Apply an ADD change to this field.  
- **Parameters:**  
  - **value:** `any` — The field's current value.  
  - **delta:** `any` — The change delta.  
  - **model:** [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
  - **change:** [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.  
- **Returns:** `any` — The updated value.  
- **Inherited from:** [StringField._applyChangeAdd](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangeadd)

### _applyChangeCustom

```typescript
_applyChangeCustom(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

- **Description:** Apply a CUSTOM change to this field.  
- **Parameters:**  
  - **value:** `any` — The field's current value.  
  - **delta:** `any` — The change delta.  
  - **model:** [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
  - **change:** [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.  
- **Returns:** `any` — The updated value.  
- **Inherited from:** [StringField._applyChangeCustom](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangecustom)

### _applyChangeDowngrade

```typescript
_applyChangeDowngrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

- **Description:** Apply a DOWNGRADE change to this field.  
- **Parameters:**  
  - **value:** `any` — The field's current value.  
  - **delta:** `any` — The change delta.  
  - **model:** [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
  - **change:** [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.  
- **Returns:** `any` — The updated value.  
- **Inherited from:** [StringField._applyChangeDowngrade](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangedowngrade)

### _applyChangeMultiply

```typescript
_applyChangeMultiply(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

- **Description:** Apply a MULTIPLY change to this field.  
- **Parameters:**  
  - **value:** `any` — The field's current value.  
  - **delta:** `any` — The change delta.  
  - **model:** [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
  - **change:** [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.  
- **Returns:** `any` — The updated value.  
- **Inherited from:** [StringField._applyChangeMultiply](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangemultiply)

### _applyChangeOverride

```typescript
_applyChangeOverride(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

- **Description:** Apply an OVERRIDE change to this field.  
- **Parameters:**  
  - **value:** `any` — The field's current value.  
  - **delta:** `any` — The change delta.  
  - **model:** [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
  - **change:** [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.  
- **Returns:** `any` — The updated value.  
- **Inherited from:** [StringField._applyChangeOverride](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangeoverride)

### _applyChangeUpgrade

```typescript
_applyChangeUpgrade(
    value: any,
    delta: any,
    model: DataModel<object, DataModelConstructionContext>,
    change: EffectChangeData,
): any
```

- **Description:** Apply an UPGRADE change to this field.  
- **Parameters:**  
  - **value:** `any` — The field's current value.  
  - **delta:** `any` — The change delta.  
  - **model:** [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)<object, [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)> — The model instance.  
  - **change:** [EffectChangeData](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html) — The original change data.  
- **Returns:** `any` — The updated value.  
- **Inherited from:** [StringField._applyChangeUpgrade](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_applychangeupgrade)

### _cleanType

```typescript
_cleanType(value: any, options?: object): any
```

- **Description:** Apply any cleaning logic specific to this DataField type.  
- **Parameters:**  
  - **value:** `any` — The appropriately coerced value.  
  - **options:** `object` (optional) — Additional options for how the field is cleaned.  
- **Returns:** `any` — The cleaned value.  
- **Inherited from:** [StringField._cleanType](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_cleantype)

### _isValidChoice

```typescript
_isValidChoice(value: string): boolean
```

- **Description:** Test whether a provided value is a valid choice from the allowed choice set.  
- **Parameters:**  
  - **value:** `string` — The provided value.  
- **Returns:** `boolean` — Is the choice valid?  
- **Inherited from:** [StringField._isValidChoice](https://foundryvtt.com/api/classes/foundry.data.fields.StringField.html#_isvalidchoice)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)