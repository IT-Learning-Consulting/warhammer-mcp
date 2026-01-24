# FunctionTerm | Foundry Virtual Tabletop - API Documentation - Version 13

A type of RollTerm used to apply a function.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.dice.terms.FunctionTerm)  

- *RollTerm*  
- **FunctionTerm**

---

## Properties

### fn
**fn**: *string*  
The name of the configured function, or one in the Math environment, which should be applied to the term.

---

### isIntermediate
**isIntermediate**: *boolean* = true  
Is this term intermediate, and should be evaluated first as part of the simplification process?  
Overrides [RollTerm.isIntermediate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isintermediate)

---

### options
**options**: *object*  
An object of additional options which describes and modifies the term.  
Inherited from [RollTerm.options](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#options)

---

### result
**result**: *string | number*  
The cached result of evaluating the method arguments.

---

### rolls
**rolls**: [*Roll*](https://foundryvtt.com/api/classes/foundry.dice.Roll.html)[]  
The cached Roll instances for each function argument.

---

### terms
**terms**: *string*[]  
An array of string argument terms for the function.

---

### FLAVOR_REGEXP (static)
**FLAVOR_REGEXP**: *RegExp* = ...  
A regular expression which identifies term-level flavor text.  
Inherited from [RollTerm.FLAVOR_REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp)

---

### FLAVOR_REGEXP_STRING (static)
**FLAVOR_REGEXP_STRING**: *string* = `"(?:\[([^\]]+)\])"`  
A regular expression pattern which identifies optional term-level flavor text.  
Inherited from [RollTerm.FLAVOR_REGEXP_STRING](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#flavor_regexp_string)

---

### REGEXP (static, accessor)
**REGEXP**: *RegExp* = undefined  
A regular expression used to match a term of this type.  
Inherited from [RollTerm.REGEXP](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#regexp)

---

### SERIALIZE_ATTRIBUTES (static, accessor)
**SERIALIZE_ATTRIBUTES**: *string*[] = ...  
An array of additional attributes which should be retained when the term is serialized.  
Overrides [RollTerm.SERIALIZE_ATTRIBUTES](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#serialize_attributes)

---

### dice (accessor)
```typescript
get dice(): DiceTerm[]
```
An array of evaluated DiceTerm instances that should be bubbled up to the parent Roll.  
**Returns:** *DiceTerm[]*

---

### expression (accessor)
```typescript
get expression(): string
```
A string representation of the formula expression for this RollTerm, prior to evaluation.  
Overrides RollTerm.expression  
**Returns:** *string*

---

### flavor (accessor)
```typescript
get flavor(): string
```
Optional flavor text which modifies and describes this term.  
Inherited from RollTerm.flavor  
**Returns:** *string*

---

### formula (accessor)
```typescript
get formula(): string
```
A string representation of the formula, including optional flavor text.  
Inherited from RollTerm.formula  
**Returns:** *string*

---

### function (accessor)
```typescript
get function(): RollFunction
```
The function this term represents.  
**Returns:** *RollFunction*

---

### isDeterministic (accessor)
```typescript
get isDeterministic(): boolean
```
Whether this term is entirely deterministic or contains some randomness.  
Overrides RollTerm.isDeterministic  
**Returns:** *boolean*

---

### resolver (accessor)
```typescript
get resolver(): RollResolver
```
A reference to the RollResolver app being used to externally resolve this term.  
Inherited from RollTerm.resolver  
**Returns:** *RollResolver*

---

### total (accessor)
```typescript
get total(): string | number
```
A string or numeric representation of the final output for this term, after evaluation.  
Overrides RollTerm.total  
**Returns:** *string* | *number*

---

## Methods

### _evaluate
```typescript
_evaluate(options?: {}): RollTerm | Promise<RollTerm>
```
Evaluate the term.

**Parameters**

- **options**: *{}* = {}  
  Options which modify how the RollTerm is evaluated, see RollTerm#evaluate

**Returns:** *RollTerm* | *Promise<RollTerm>*  
Returns a Promise if the term is non-deterministic.  
Overrides [RollTerm._evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_evaluate)

---

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

**Parameters**

- **options?**:  
  - *allowStrings?*: *boolean*  
    If true, string terms will not throw an error when evaluated.  
  - *maximize?*: *boolean*  
    Maximize the result, obtaining the largest possible value.  
  - *minimize?*: *boolean*  
    Minimize the result, obtaining the smallest possible value.

**Returns:** *RollTerm* | *Promise<RollTerm>*  
Returns a Promise if the term is non-deterministic.  
Inherited from [RollTerm.evaluate](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#evaluate)

---

### toJSON
```typescript
toJSON(): RollTermData
```
Serialize the RollTerm to a JSON string which allows it to be saved in the database or embedded in text. This method should return an object suitable for passing to the JSON.stringify function.

**Returns:** *RollTermData*  
Overrides [RollTerm.toJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#tojson)

---

### _evaluateAsync (protected)
```typescript
_evaluateAsync(options?: object): Promise<RollTerm>
```
Evaluate this function when it contains any non-deterministic sub-terms.

**Parameters**

- **options**: *object* = {}

**Returns:** *Promise<RollTerm>*

---

### _evaluateSync (protected)
```typescript
_evaluateSync(options?: object): RollTerm
```
Evaluate this function when it contains only deterministic sub-terms.

**Parameters**

- **options**: *object* = {}

**Returns:** *RollTerm*

---

### _fromData (static)
```typescript
_fromData(data: any): RollTerm
```
Define term-specific logic for how a de-serialized data object is restored as a functional RollTerm.

**Parameters**

- **data**: *any*  
  The de-serialized term data.

**Returns:** *RollTerm*  
Overrides [RollTerm._fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#_fromdata)

---

### fromData (static)
```typescript
fromData(data: RollTermData): RollTerm
```
Construct a RollTerm from a provided data object.

**Parameters**

- **data**: *RollTermData*  
  Provided data from an un-serialized term.

**Returns:** *RollTerm*  
Inherited from [RollTerm.fromData](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromdata)

---

### fromJSON (static)
```typescript
fromJSON(json: string): RollTerm
```
Reconstruct a RollTerm instance from a provided JSON string.

**Parameters**

- **json**: *string*  
  A serialized JSON representation of a DiceTerm.

**Returns:** *RollTerm*  
Inherited from [RollTerm.fromJSON](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromjson)

---

### fromParseNode (static)
```typescript
fromParseNode(node: any): RollTerm
```
Reconstruct a RollTerm from a parse node.

**Parameters**

- **node**: *any*

**Returns:** *RollTerm*  
Overrides [RollTerm.fromParseNode](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#fromparsenode)

---

### isDeterministic (static)
```typescript
isDeterministic(
    term: RollTerm, 
    options?: { maximize?: boolean; minimize?: boolean }
): boolean
```
Determine if evaluating a given RollTerm with certain evaluation options can be done so deterministically.

**Parameters**

- **term**: *RollTerm*  
  The term.

- **options?**:  
  - *maximize?*: *boolean*  
    Force the result to be maximized.  
  - *minimize?*: *boolean*  
    Force the result to be minimized.

**Returns:** *boolean*  
Inherited from [RollTerm.isDeterministic](https://foundryvtt.com/api/classes/foundry.dice.terms.RollTerm.html#isdeterministic-2)

---

For full details and related classes, see:  
[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.dice.terms.FunctionTerm.html)