# ifThen | Foundry Virtual Tabletop - API Documentation - Version 13

### Function ifThen

```typescript
ifThen(criteria: boolean, ifTrue: string, ifFalse: string): string
```

A ternary expression that allows inserting A or B depending on the value of C.

**Parameters**

- **criteria**: *boolean*  
  The test criteria

- **ifTrue**: *string*  
  The string to output if true

- **ifFalse**: *string*  
  The string to output if false

**Returns** *string*  
The ternary result

**Example: Ternary if-then template usage**

```
{{ifThen true "It is true" "It is false"}}
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)