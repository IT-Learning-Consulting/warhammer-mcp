# NumericTerm

A type of RollTerm used to represent static numbers.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [dice](https://foundryvtt.com/api/modules/foundry.dice.html) / [terms](https://foundryvtt.com/api/modules/foundry.dice.terms.html) / [NumericTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.NumericTerm.html)

## Hierarchy

- *[RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html)*
- **NumericTerm**

---

## Properties

### isIntermediate

**Type:** `boolean`  
**Default:** `false`

Is this term intermediate, and should be evaluated first as part of the simplification process?

Inherited from [RollTerm.isIntermediate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isintermediate)

---

### number

**Type:** `number`

The term's numeric value.

---

### options

**Type:** `object`

An object of additional options which describes and modifies the term.

Inherited from [RollTerm.options](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#options)

---

### Static Properties

#### FLAVOR_REGEXP

**Type:** `RegExp`

A regular expression which identifies term-level flavor text

Inherited from [RollTerm.FLAVOR_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp)

---

#### FLAVOR_REGEXP_STRING

**Type:** `string`  
**Value:** `"(?:\\[([^\\]]+)\\])"`

A regular expression pattern which identifies optional term-level flavor text.

Inherited from [RollTerm.FLAVOR_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp_string)

---

#### REGEXP

**Type:** `RegExp`

A regular expression used to match a term of this type.

Overrides [RollTerm.REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#regexp)

---

#### SERIALIZE_ATTRIBUTES

**Type:** `string[]`

An array of additional attributes which should be retained when the term is serialized.

Overrides [RollTerm.SERIALIZE_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#serialize_attributes)

---

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

Inherited from RollTerm.isDeterministic

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
get total(): number
```

A string or numeric representation of the final output for this term, after evaluation.

**Returns:** `number`

Overrides RollTerm.total

---

## Methods

### evaluate

```typescript
evaluate(
    options?: {
        allowStrings?: boolean;
        maximize?: boolean;
        minimize?: boolean;
    },
): RollTerm | Promise<RollTerm>
```

Evaluate the term, processing its inputs and finalizing its total.

**Parameters:**

- **options?**: An optional object containing:
  - **allowStrings?**: `boolean` - If true, string terms will not throw an error when evaluated.
  - **maximize?**: `boolean` - Maximize the result, obtaining the largest possible value.
  - **minimize?**: `boolean` - Minimize the result, obtaining the smallest possible value.

**Returns:** `RollTerm` or a `Promise<RollTerm>` (returns a Promise if the term is non-deterministic).

Inherited from [RollTerm.evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#evaluate)

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

Protected method to evaluate the term.

**Parameters:**

- **options?**: Optional object which modifies how the RollTerm is evaluated, see `RollTerm#evaluate`.

**Returns:** `RollTerm` or `Promise<RollTerm>` (returns a Promise if the term is non-deterministic).

Inherited from [RollTerm._evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_evaluate)

---

### Static Methods

#### fromData

```typescript
static fromData(data: RollTermData): RollTerm
```

Construct a RollTerm from a provided data object.

**Parameters:**

- **data**: [RollTermData](https://foundryvtt.com/api/interfaces/foundry.dice.terms.RollTermData.html) - Provided data from an un-serialized term.

**Returns:** `RollTerm`

Inherited from [RollTerm.fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromdata)

---

#### fromJSON

```typescript
static fromJSON(json: string): RollTerm
```

Reconstruct a RollTerm instance from a provided JSON string.

**Parameters:**

- **json**: `string` - A serialized JSON representation of a DiceTerm.

**Returns:** `RollTerm`

Inherited from [RollTerm.fromJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromjson)

---

#### fromMatch

```typescript
static fromMatch(match: RegExpMatchArray): NumericTerm
```

Construct a term of this type given a matched regular expression array.

**Parameters:**

- **match**: `RegExpMatchArray` - The matched regular expression array.

**Returns:** `NumericTerm`

---

#### fromParseNode

```typescript
static fromParseNode(node: RollParseNode): RollTerm
```

Construct a RollTerm from parser information.

**Parameters:**

- **node**: [RollParseNode](https://foundryvtt.com/api/interfaces/foundry.dice.RollParseNode.html) - The node.

**Returns:** `RollTerm`

Inherited from [RollTerm.fromParseNode](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromparsenode)

---

#### isDeterministic

```typescript
static isDeterministic(
    term: RollTerm,
    options?: { maximize?: boolean; minimize?: boolean },
): boolean
```

Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.

**Parameters:**

- **term**: `RollTerm` - The term.
- **options?**: Optional evaluation options:
  - **maximize?**: `boolean` - Force the result to be maximized.
  - **minimize?**: `boolean` - Force the result to be minimized.

**Returns:** `boolean`

Inherited from [RollTerm.isDeterministic](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isdeterministic-2)

---

#### matchTerm

```typescript
static matchTerm(expression: string): null | RegExpMatchArray
```

Determine whether a string expression matches a NumericTerm.

**Parameters:**

- **expression**: `string` - The expression to parse.

**Returns:** `null` or `RegExpMatchArray`

---

#### _fromData

```typescript
protected static _fromData(data: RollTermData): RollTerm
```

Protected method defining term-specific logic for how a de-serialized data object is restored as a functional RollTerm.

**Parameters:**

- **data**: [RollTermData](https://foundryvtt.com/api/interfaces/foundry.dice.terms.RollTermData.html) - The de-serialized term data.

**Returns:** `RollTerm`

Inherited from [RollTerm._fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_fromdata)