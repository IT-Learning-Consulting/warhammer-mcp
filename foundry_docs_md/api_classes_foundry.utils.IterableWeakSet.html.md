# IterableWeakSet | Foundry Virtual Tabletop - API Documentation - Version 13

Stores a set of objects with weak references to them, allowing them to be garbage collected. Can be iterated over, unlike a WeakSet.

## Hierarchy

* _WeakSet_
* **IterableWeakSet**

---

## Constructors

### constructor

```typescript
new IterableWeakSet(entries?: Iterable<any, any, any>): IterableWeakSet
```

**Parameters**

- **entries**: *Iterable<any, any, any>* = []  
  The initial entries.

**Returns**  
*IterableWeakSet*

---

## Methods

Overrides WeakSet methods.

### [iterator]

```typescript
[iterator](): Generator<any, void, any>
```

Enumerate the values.

**Returns**  
*Generator<any, void, any>*

---

### add

```typescript
add(value: any): IterableWeakSet
```

Add a value to the set.

**Parameters**

- **value**: *any*  
  The value to add.

**Returns**  
*IterableWeakSet*

Overrides WeakSet.add

---

### clear

```typescript
clear(): void
```

Clear all values from the set.

**Returns**  
*void*

---

### delete

```typescript
delete(value: any): boolean
```

Delete a value from the set.

**Parameters**

- **value**: *any*  
  The value to delete.

**Returns**  
*boolean*

Overrides WeakSet.delete

---

### has

```typescript
has(value: any): boolean
```

Whether this set contains the given value.

**Parameters**

- **value**: *any*  
  The value to test.

**Returns**  
*boolean*

Overrides WeakSet.has

---

### values

```typescript
values(): Generator<any, void, any>
```

Enumerate the collection.

**Returns**  
*Generator<any, void, any>*

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[foundry](https://foundryvtt.com/api/modules/foundry.html) / [utils](https://foundryvtt.com/api/modules/foundry.utils.html) / [IterableWeakSet](https://foundryvtt.com/api/classes/foundry.utils.IterableWeakSet.html)