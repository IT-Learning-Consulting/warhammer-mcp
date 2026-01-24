# StringTerm

A type of `RollTerm` used to represent strings which have not yet been matched.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.dice.terms.StringTerm), Expand

- *RollTerm*  
- **StringTerm**

## Properties

### isIntermediate

**Type:** `boolean` = `false`

Is this term intermediate, and should be evaluated first as part of the simplification process?

Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html).  
[isIntermediate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isintermediate)

---

### options

**Type:** `object`

An object of additional options which describes and modifies the term.

Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html).  
[options](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#options)

---

### term

**Type:** `string`

The term's string value.

---

### FLAVOR_REGEXP

**Type:** `RegExp`

A regular expression which identifies term-level flavor text.

Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html).  
[FLAVOR_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp)

---

### FLAVOR_REGEXP_STRING

**Type:** `string` = `"(?:\\[([^\\]]+)\\])"`

A regular expression pattern which identifies optional term-level flavor text.

Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html).  
[FLAVOR_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp_string)

---

### REGEXP

**Type:** `RegExp` = `undefined`

A regular expression used to match a term of this type.

Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html).  
[REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#regexp)

---

### SERIALIZE_ATTRIBUTES

**Type:** `string[]`

An array of additional attributes which should be retained when the term is serialized.

Overrides [RollTerm.SERIALIZE_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#serialize_attributes)

## Accessors

### expression

```typescript
get expression(): string
```

A string representation of the formula expression for this RollTerm, prior to evaluation.

**Returns:** `string`

Overrides RollTerm.expression

---

### flavor

```typescript
get flavor(): string
```

Optional flavor text which modifies and describes this term.

**Returns:** `string`

Inherited from RollTerm.flavor

---

### formula

```typescript
get formula(): string
```

A string representation of the formula, including optional flavor text.

**Returns:** `string`

Inherited from RollTerm.formula

---

### isDeterministic

```typescript
get isDeterministic(): boolean
```

Whether this term is entirely deterministic or contains some randomness.

**Returns:** `boolean`

Overrides RollTerm.isDeterministic

---

### resolver

```typescript
get resolver(): RollResolver
```

A reference to the RollResolver app being used to externally resolve this term.

**Returns:** [RollResolver](https://foundryvtt.com/api/classes/foundry.applications.dice.RollResolver.html)

Inherited from RollTerm.resolver

---

### total

```typescript
get total(): string
```

A string or numeric representation of the final output for this term, after evaluation.

**Returns:** `string`

Overrides RollTerm.total

## Methods

### evaluate

```typescript
evaluate(__namedParameters?: { allowStrings?: boolean }): StringTerm
```

Evaluate the term, processing its inputs and finalizing its total.

**Parameters:**

- **__namedParameters** (optional):  
  - **allowStrings**?: `boolean`  
    Options which modify how the RollTerm is evaluated  
  Defaults to `{}`

**Returns:** `StringTerm`  
Returns a Promise if the term is non-deterministic.

Overrides [RollTerm.evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#evaluate)

---

### toJSON

```typescript
toJSON(): RollTermData
```

Serialize the RollTerm to a JSON string which allows it to be saved in the database or embedded in text. This method should return an object suitable for passing to the `JSON.stringify` function.

**Returns:** [RollTermData](https://foundryvtt.com/api/interfaces/foundry.dice.terms.RollTermData.html)

Inherited from [RollTerm.toJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#tojson)

---

### _evaluate

```typescript
protected _evaluate(options?: object): RollTerm | Promise<RollTerm>
```

Protected. Evaluate the term.

**Parameters:**

- **options** (optional): `object` = `{}`  
  Options which modify how the RollTerm is evaluated, see RollTerm#evaluate

**Returns:** `RollTerm` or `Promise<RollTerm>`  
Returns a Promise if the term is non-deterministic.

Inherited from [RollTerm._evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_evaluate)

---

### fromData

```typescript
static fromData(data: RollTermData): RollTerm
```

Construct a RollTerm from a provided data object.

**Parameters:**

- **data**: [RollTermData](https://foundryvtt.com/api/interfaces/foundry.dice.terms.RollTermData.html)  
  Provided data from an un-serialized term

**Returns:** `RollTerm`  
The constructed RollTerm

Inherited from [RollTerm.fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromdata)

---

### fromJSON

```typescript
static fromJSON(json: string): RollTerm
```

Reconstruct a RollTerm instance from a provided JSON string.

**Parameters:**

- **json**: `string`  
  A serialized JSON representation of a DiceTerm

**Returns:** `RollTerm`  
A reconstructed RollTerm from the provided JSON

Inherited from [RollTerm.fromJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromjson)

---

### fromParseNode

```typescript
static fromParseNode(node: RollParseNode): RollTerm
```

Construct a RollTerm from parser information.

**Parameters:**

- **node**: [RollParseNode](https://foundryvtt.com/api/interfaces/foundry.dice.RollParseNode.html)  
  The node.

**Returns:** `RollTerm`

Inherited from [RollTerm.fromParseNode](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromparsenode)

---

### isDeterministic

```typescript
static isDeterministic(
  term: RollTerm,
  options?: { maximize?: boolean; minimize?: boolean }
): boolean
```

Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.

**Parameters:**

- **term**: `RollTerm`  
  The term.

- **options** (optional):  
  - **maximize**?: `boolean`  
    Force the result to be maximized.
  - **minimize**?: `boolean`  
    Force the result to be minimized.

Defaults to `{}`

**Returns:** `boolean`

Inherited from [RollTerm.isDeterministic](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isdeterministic-2)

---

### _fromData

```typescript
protected static _fromData(data: RollTermData): RollTerm
```

Protected. Define term-specific logic for how a de-serialized data object is restored as a functional RollTerm.

**Parameters:**

- **data**: [RollTermData](https://foundryvtt.com/api/interfaces/foundry.dice.terms.RollTermData.html)  
  The de-serialized term data

**Returns:** `RollTerm`  
The re-constructed RollTerm object

Inherited from [RollTerm._fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_fromdata)