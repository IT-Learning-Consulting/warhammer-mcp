# OperatorTerm

A type of RollTerm used to denote and perform an arithmetic operation.

## Hierarchy
- [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html)  
- **OperatorTerm**

---

## Properties

### isIntermediate
**Type:** `boolean` = `false`

Is this term intermediate, and should be evaluated first as part of the simplification process?

Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isintermediate).

---

### operator
**Type:** `string`

The term's operator value.

---

### options
**Type:** `object`

An object of additional options which describes and modifies the term.

Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#options).

---

### FLAVOR_REGEXP (static)
**Type:** `RegExp`

A regular expression which identifies term-level flavor text.

Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp).

---

### FLAVOR_REGEXP_STRING (static)
**Type:** `string` = `"(?:\\[([^\\]]+)\\])"`

A regular expression pattern which identifies optional term-level flavor text.

Inherited from [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp_string).

---

### OPERATORS (static)
**Type:** `string[]`

An array of operators which represent arithmetic operations.

---

### PRECEDENCE (static)
**Type:** `Readonly<Record<string, number>>`

An object of operators with their precedence values.

---

### REGEXP (static)
**Type:** `RegExp`

Overrides [RollTerm.REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#regexp).

---

### SERIALIZE_ATTRIBUTES (static)
**Type:** `string[]`

Overrides [RollTerm.SERIALIZE_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#serialize_attributes).

---

## Accessors

### get expression(): string
Overrides RollTerm.expression

---

### get flavor(): string
Overrides RollTerm.flavor

---

### get formula(): string
A string representation of the formula, including optional flavor text.

Inherited from RollTerm.formula

---

### get isDeterministic(): boolean
Whether this term is entirely deterministic or contains some randomness.

Inherited from RollTerm.isDeterministic

---

### get resolver(): [RollResolver](https://foundryvtt.com/api/classes/foundry.applications.dice.RollResolver.html)
A reference to the RollResolver app being used to externally resolve this term.

Inherited from RollTerm.resolver

---

### get total(): string
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

- **Parameters**
  - **options?**: An object with evaluation options (default `{}`):
    - **allowStrings?**: `boolean` - If true, string terms will not throw an error when evaluated.
    - **maximize?**: `boolean` - Maximize the result, obtaining the largest possible value.
    - **minimize?**: `boolean` - Minimize the result, obtaining the smallest possible value.

- **Returns:** `RollTerm` or `Promise<RollTerm>`  
  Returns a Promise if the term is non-deterministic.

Inherited from [RollTerm.evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#evaluate).

---

### toJSON
```typescript
toJSON(): RollTermData
```
Serialize the RollTerm to a JSON string which allows it to be saved in the database or embedded in text.  
This method should return an object suitable for passing to the `JSON.stringify` function.

- **Returns:** `RollTermData`

Inherited from [RollTerm.toJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#tojson).

---

### _evaluate (protected)
```typescript
_protected _evaluate(options?: object): RollTerm | Promise<RollTerm>
```
Evaluate the term.

- **Parameters**
  - **options?**: `object` - Options which modify how the RollTerm is evaluated, see `RollTerm#evaluate`.

- **Returns:** `RollTerm` or `Promise<RollTerm>`  
  Returns a Promise if the term is non-deterministic.

Inherited from [RollTerm._evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_evaluate).

---

### _fromData (static, protected)
```typescript
_fromData(data: any): OperatorTerm
```
Overrides [RollTerm._fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_fromdata).

- **Parameters**
  - **data**: `any`

- **Returns:** `OperatorTerm`

---

### fromData (static)
```typescript
fromData(data: RollTermData): RollTerm
```
Construct a RollTerm from a provided data object.

- **Parameters**
  - **data**: [RollTermData](https://foundryvtt.com/api/interfaces/foundry.dice.terms.RollTermData.html) - Provided data from an un-serialized term.

- **Returns:** `RollTerm`

Inherited from [RollTerm.fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromdata).

---

### fromJSON (static)
```typescript
fromJSON(json: string): RollTerm
```
Reconstruct a RollTerm instance from a provided JSON string.

- **Parameters**
  - **json**: `string` - A serialized JSON representation of a DiceTerm.

- **Returns:** `RollTerm`

Inherited from [RollTerm.fromJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromjson).

---

### fromParseNode (static)
```typescript
fromParseNode(node: RollParseNode): RollTerm
```
Construct a RollTerm from parser information.

- **Parameters**
  - **node**: [RollParseNode](https://foundryvtt.com/api/interfaces/foundry.dice.RollParseNode.html) - The node.

- **Returns:** `RollTerm`

Inherited from [RollTerm.fromParseNode](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromparsenode).

---

### isDeterministic (static)
```typescript
isDeterministic(
    term: RollTerm,
    options?: { maximize?: boolean; minimize?: boolean },
): boolean
```
Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.

- **Parameters:**
  - **term**: [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html) - The term.
  - **options?**: Optional evaluation options (default `{}`):
    - **maximize?**: `boolean` - Force the result to be maximized.
    - **minimize?**: `boolean` - Force the result to be minimized.

- **Returns:** `boolean`

Inherited from [RollTerm.isDeterministic](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isdeterministic-2).