# RollTerm

An abstract class which represents a single token that can be used as part of a Roll formula.  
Every portion of a Roll formula is parsed into a subclass of RollTerm in order for the Roll to be fully evaluated.

---

## Hierarchy

- [RollTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html)  
  Subclasses:  
  - [DiceTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.DiceTerm.html)  
  - [FunctionTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.FunctionTerm.html)  
  - [NumericTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.NumericTerm.html)  
  - [OperatorTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.OperatorTerm.html)  
  - [ParentheticalTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.ParentheticalTerm.html)  
  - [PoolTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.PoolTerm.html)  
  - [StringTerm](https://foundryvtt.com/api/classes/foundry.dice.terms.StringTerm.html)  

---

## Constructors

### constructor

```typescript
new RollTerm(termData?: { options?: object }): RollTerm
```

**Parameters**

- **termData?**:  
  - **options?**: `object`  
    An object of additional options which describes and modifies the term.

**Returns**  
`RollTerm`

---

## Properties

### isIntermediate

```typescript
isIntermediate: boolean = false
```

Is this term intermediate, and should be evaluated first as part of the simplification process?

### options

```typescript
options: object
```

An object of additional options which describes and modifies the term.

---

## Static Properties

### FLAVOR_REGEXP

```typescript
FLAVOR_REGEXP: RegExp = ...
```

A regular expression which identifies term-level flavor text.

### FLAVOR_REGEXP_STRING

```typescript
FLAVOR_REGEXP_STRING: string = "(?:\\[([^\\]]+)\\])"
```

A regular expression pattern which identifies optional term-level flavor text.

### REGEXP

```typescript
REGEXP: RegExp = undefined
```

A regular expression used to match a term of this type.

### SERIALIZE_ATTRIBUTES

```typescript
SERIALIZE_ATTRIBUTES: string[] = []
```

An array of additional attributes which should be retained when the term is serialized.

---

## Accessors

### expression

```typescript
get expression(): string
```

A string representation of the formula expression for this RollTerm, prior to evaluation.

**Returns**  
`string`

### flavor

```typescript
get flavor(): string
```

Optional flavor text which modifies and describes this term.

**Returns**  
`string`

### formula

```typescript
get formula(): string
```

A string representation of the formula, including optional flavor text.

**Returns**  
`string`

### isDeterministic

```typescript
get isDeterministic(): boolean
```

Whether this term is entirely deterministic or contains some randomness.

**Returns**  
`boolean`

### resolver

```typescript
get resolver(): RollResolver
```

A reference to the [RollResolver](https://foundryvtt.com/api/classes/foundry.applications.dice.RollResolver.html) app being used to externally resolve this term.

**Returns**  
`RollResolver`

### total

```typescript
get total(): string | number | void
```

A string or numeric representation of the final output for this term, after evaluation.

**Returns**  
`string | number | void`

---

## Methods

### evaluate

```typescript
evaluate(
  options?: {
    allowStrings?: boolean;
    maximize?: boolean;
    minimize?: boolean;
  }
): RollTerm | Promise<RollTerm>
```

Evaluate the term, processing its inputs and finalizing its total.

**Parameters**

- **options?**:  
  - **allowStrings?**: `boolean`  
    If true, string terms will not throw an error when evaluated.  
  - **maximize?**: `boolean`  
    Maximize the result, obtaining the largest possible value.  
  - **minimize?**: `boolean`  
    Minimize the result, obtaining the smallest possible value.

**Returns**  
`RollTerm` or `Promise<RollTerm>`  
Returns a Promise if the term is non-deterministic.

### toJSON

```typescript
toJSON(): RollTermData
```

Serialize the RollTerm to a JSON string which allows it to be saved in the database or embedded in text. This method should return an object suitable for passing to the `JSON.stringify` function.

**Returns**  
`RollTermData`

### _evaluate

```typescript
protected _evaluate(options?: object): RollTerm | Promise<RollTerm>
```

Protected method to evaluate the term.

**Parameters**

- **options?**: `object` = `{}`  
  Options which modify how the RollTerm is evaluated, see `RollTerm#evaluate`.

**Returns**  
`RollTerm` or `Promise<RollTerm>`  
Returns a Promise if the term is non-deterministic.

---

## Static Methods

### fromData

```typescript
static fromData(data: RollTermData): RollTerm
```

Construct a RollTerm from a provided data object.

**Parameters**

- **data**: `RollTermData`  
  Provided data from an un-serialized term.

**Returns**  
`RollTerm`  
The constructed RollTerm.

### fromJSON

```typescript
static fromJSON(json: string): RollTerm
```

Reconstruct a RollTerm instance from a provided JSON string.

**Parameters**

- **json**: `string`  
  A serialized JSON representation of a DiceTerm.

**Returns**  
`RollTerm`  
A reconstructed RollTerm from the provided JSON.

### fromParseNode

```typescript
static fromParseNode(node: RollParseNode): RollTerm
```

Construct a RollTerm from parser information.

**Parameters**

- **node**: `RollParseNode`  
  The node.

**Returns**  
`RollTerm`

### isDeterministic

```typescript
static isDeterministic(
  term: RollTerm,
  options?: {
    maximize?: boolean;
    minimize?: boolean;
  }
): boolean
```

Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.

**Parameters**

- **term**: `RollTerm`  
  The term.

- **options?**:  
  - **maximize?**: `boolean`  
    Force the result to be maximized.  
  - **minimize?**: `boolean`  
    Force the result to be minimized.

**Returns**  
`boolean`

### _fromData

```typescript
protected static _fromData(data: RollTermData): RollTerm
```

Protected method defining term-specific logic for how a de-serialized data object is restored as a functional RollTerm.

**Parameters**

- **data**: `RollTermData`  
  The de-serialized term data.

**Returns**  
`RollTerm`  
The re-constructed RollTerm object.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)