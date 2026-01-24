# SearchFilter | Foundry Virtual Tabletop - API Documentation - Version 13

A controller class for managing a text input widget that filters the contents of some other UI element.

## Constructors

### constructor

```typescript
new SearchFilter(config?: SearchFilterConfiguration): SearchFilter
```

**Parameters**

- **config**: `SearchFilterConfiguration = {}`  
  Configuration object for initializing the SearchFilter.

## Properties

### callback

- Type: `null | SearchFilterCallback`  
- Returns: `SearchFilter`  

A callback function to trigger when the tab is changed.

### query

- Type: `string`  

The value of the current query string.

### rgx

- Type: `RegExp`  

The regular expression corresponding to the query that should be matched against.

### OPERATORS (Static)

- Type: `Readonly<{`
  - `BETWEEN: "between";`
  - `CONTAINS: "contains";`
  - `ENDS_WITH: "ends_with";`
  - `EQUALS: "equals";`
  - `GREATER_THAN: "gt";`
  - `GREATER_THAN_EQUAL: "gte";`
  - `IS_EMPTY: "is_empty";`
  - `LESS_THAN: "lt";`
  - `LESS_THAN_EQUAL: "lte";`
  - `STARTS_WITH: "starts_with";`
  - `}>`

The allowed Filter Operators which can be used to define a search filter.

## Methods

### bind

```typescript
bind(html: HTMLElement): void
```

Bind the SearchFilter controller to an HTML application.

**Parameters**

- **html**: `HTMLElement`

**Returns**

- `void`

### filter

```typescript
filter(event: null | KeyboardEvent, query: string): void
```

Perform a filtering of the content by invoking the callback function.

**Parameters**

- **event**: `null | KeyboardEvent`  
  The triggering keyboard event
- **query**: `string`  
  The input search string

**Returns**

- `void`

### unbind

```typescript
unbind(): void
```

Release all bound HTML elements and reset the query.

**Returns**

- `void`

### cleanQuery (Static)

```typescript
cleanQuery(query: string): string
```

Clean a query term to standardize it for matching.  
See [String.prototype.normalize() - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)

**Parameters**

- **query**: `string`  
  An input string which may contain leading/trailing spaces or diacritics

**Returns**

- `string`  
  A cleaned string of ASCII characters for comparison

### evaluateFilter (Static)

```typescript
evaluateFilter(obj: object, filter: FieldFilter): boolean
```

Test whether a given object matches a provided filter.

**Parameters**

- **obj**: `object`  
  An object to test against
- **filter**: `FieldFilter`  
  The filter to test

**Returns**

- `boolean`  
  Whether the object matches the filter

### testQuery (Static)

```typescript
testQuery(rgx: RegExp, value: string): boolean
```

A helper method to test a value against a precomposed regex pattern.

**Parameters**

- **rgx**: `RegExp`  
  The regular expression to test
- **value**: `string`  
  The value to test against

**Returns**

- `boolean`  
  Does the query match?