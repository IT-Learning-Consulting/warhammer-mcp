# EventEmitterMixin | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `EventEmitterMixin`

```typescript
EventEmitterMixin<
  TBaseClass extends Function
>(
  BaseClass?: TBaseClass,
): typeof EventEmitter
```

Augment a base class with EventEmitter behavior.

**Type Parameters**

- `TBaseClass` extends `Function`

**Parameters**

- **BaseClass**?: `TBaseClass`  
  Some base class to be augmented with event emitter functionality: defaults to an anonymous empty class.

**Returns**

- `typeof EventEmitter`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)