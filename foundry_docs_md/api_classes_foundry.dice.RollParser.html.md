# RollParser

A class for transforming events from the Peggy grammar lexer into various formats.

---

## Constructors

### constructor

```typescript
new RollParser(formula: string): RollParser
```
**Parameters:**

- **formula**: `string`  
  The full formula.

**Returns:**  
`RollParser`

---

## Properties

### formula

- **formula**: `string`  
  The full formula.

---

## Methods

### _collapseOperators

```typescript
protected _collapseOperators(operators: string[]): string
```

Collapse multiple additive operators into a single one.

**Parameters:**

- **operators**: `string[]`  
  A sequence of additive operators.

**Returns:**  
`string`

---

### _onDiceTerm

```typescript
protected _onDiceTerm(
  number: null | RollParseNode,
  faces: null | string | RollParseNode,
  modifiers: null | string,
  flavor: null | string,
  formula: string,
): RollParseNode
```

Handle a dice term.

**Parameters:**

- **number**: `null | RollParseNode`  
  The number of dice.

- **faces**: `null | string | RollParseNode`  
  The number of die faces or a string denomination like "c" or "f".

- **modifiers**: `null | string`  
  The matched modifiers string.

- **flavor**: `null | string`  
  Associated flavor text.

- **formula**: `string`  
  The original matched text.

**Returns:**  
`RollParseNode`

---

### _onExpression

```typescript
protected _onExpression(
  head: RollParseNode,
  tail: [string[], RollParseNode][],
  leading?: string,
  formula: string,
  error: Function,
): RollParseNode
```

Handle a base roll expression.

**Parameters:**

- **head**: `RollParseNode`  
  The first operand.

- **tail**: `[string[], RollParseNode][]`  
  Zero or more subsequent (operators, operand) tuples.

- **leading** (optional): `string`  
  A leading operator.

- **formula**: `string`  
  The original matched text.

- **error**: `Function`  
  The Peggy error callback to invoke on a parse error.

**Returns:**  
`RollParseNode`

---

### _onFunctionTerm

```typescript
protected _onFunctionTerm(
  fn: string,
  head: RollParseNode,
  tail: RollParseNode[],
  flavor: string,
  formula: string,
): RollParseNode
```

Handle a math term.

**Parameters:**

- **fn**: `string`  
  The Math function.

- **head**: `RollParseNode`  
  The first term.

- **tail**: `RollParseNode[]`  
  Zero or more additional terms.

- **flavor**: `string`  
  Associated flavor text.

- **formula**: `string`  
  The original matched text.

**Returns:**  
`RollParseNode`

---

### _onNumericTerm

```typescript
protected _onNumericTerm(number: number, flavor: string): RollParseNode
```

Handle a numeric term.

**Parameters:**

- **number**: `number`  
  The number.

- **flavor**: `string`  
  Associated flavor text.

**Returns:**  
`RollParseNode`

---

### _onParenthetical

```typescript
protected _onParenthetical(
  term: RollParseNode,
  flavor: null | string,
  formula: string,
): RollParseNode
```

Handle a parenthetical.

**Parameters:**

- **term**: `RollParseNode`  
  The inner term.

- **flavor**: `null | string`  
  Associated flavor text.

- **formula**: `string`  
  The original matched text.

**Returns:**  
`RollParseNode`

---

### _onPoolTerm

```typescript
protected _onPoolTerm(
  head: RollParseNode,
  tail: RollParseNode[],
  modifiers: null | string,
  flavor: null | string,
  formula: string,
): RollParseNode
```

Handle a pool term.

**Parameters:**

- **head**: `RollParseNode`  
  The first term.

- **tail**: `RollParseNode[]`  
  Zero or more additional terms.

- **modifiers**: `null | string`  
  The matched modifiers string.

- **flavor**: `null | string`  
  Associated flavor text.

- **formula**: `string`  
  The original matched text.

**Returns:**  
`RollParseNode`

---

### _onStringTerm

```typescript
protected _onStringTerm(term: string, flavor?: null | string): StringParseNode
```

Handle some string that failed to be classified.

**Parameters:**

- **term**: `string`  
  The term.

- **flavor** (optional): `null | string`  
  Associated flavor text.

**Returns:**  
`StringParseNode`

---

### _wrapNegativeTerm

```typescript
protected _wrapNegativeTerm(term: RollParseNode): RollParseNode
```

Wrap a term with a leading minus.

**Parameters:**

- **term**: `RollParseNode`  
  The term to wrap.

**Returns:**  
`RollParseNode`

---

### flattenTree

```typescript
static flattenTree(root: RollParseNode): RollParseNode[]
```

Flatten a tree structure (either a parse tree or AST) into an array with operators in infix notation.

**Parameters:**

- **root**: `RollParseNode`  
  The root of the tree.

**Returns:**  
`RollParseNode[]`

---

### formatArg

```typescript
static formatArg(arg: any): string
```

Format a parser argument.

**Parameters:**

- **arg**: `any`  
  The argument.

**Returns:**  
`string`

---

### formatDebug

```typescript
static formatDebug(method: string, ...args: any[]): string
```

Format arguments for debugging.

**Parameters:**

- **method**: `string`  
  The method name.

- **...args**: `any[]`  
  The arguments.

**Returns:**  
`string`

---

### formatList

```typescript
static formatList(list: any[]): string
```

Format a list argument.

**Parameters:**

- **list**: `any[]`  
  The list to format.

**Returns:**  
`string`

---

### isOperatorTerm

```typescript
static isOperatorTerm(node: any): boolean
```

Determine if a given node is an operator term.

**Parameters:**

- **node**: `any`

**Returns:**  
`boolean`

---

### toAST

```typescript
static toAST(root: RollParseNode | RollTerm[]): RollParseNode
```

Use the [Shunting Yard algorithm](https://en.wikipedia.org/wiki/Shunting_yard_algorithm) to convert a parse tree or list of terms into an AST with correct operator precedence.

**Parameters:**

- **root**: `RollParseNode | RollTerm[]`  
  The root of the parse tree or a list of terms.

**Returns:**  
`RollParseNode`  
The root of the AST.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.dice.RollParser.html)