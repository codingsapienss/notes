# Modern Prototype APIs (Complete Guide)

> JavaScript originally exposed prototype manipulation through the non-standard `__proto__` property.
>
> As the language evolved, ECMAScript introduced official APIs for working with prototypes and object properties.
>
> These APIs are:
>
> - Safer
> - Standardized
> - More readable
> - Better optimized
>
> Modern JavaScript code should prefer these APIs over legacy approaches whenever possible.

---

### Prerequisites

Before reading this chapter, you should understand:

- Prototype Chain
- [[Prototype]]
- **proto**
- Object.create()
- Constructor Functions

---

### Why Were Modern Prototype APIs Introduced?

Originally developers used

```javascript
obj.__proto__;
```

to read or modify prototypes.

Example

```javascript
const user = {};

console.log(user.__proto__);
```

Although this worked,

it had several problems:

- Non-standard for many years
- Difficult for JavaScript engines to optimize
- Encouraged runtime prototype mutation
- Poor readability

ES5 and later introduced official APIs.

---

### Overview of Modern Prototype APIs

| API                                | Purpose                       |
| ---------------------------------- | ----------------------------- |
| Object.getPrototypeOf()            | Read prototype                |
| Object.setPrototypeOf()            | Change prototype              |
| Object.hasOwn()                    | Check own property            |
| Object.getOwnPropertyNames()       | Get all string property names |
| Object.getOwnPropertySymbols()     | Get Symbol properties         |
| Object.getOwnPropertyDescriptors() | Get property descriptors      |
| Reflect.getPrototypeOf()           | Reflect API equivalent        |
| Reflect.setPrototypeOf()           | Reflect API equivalent        |

---

### Object.getPrototypeOf()

#### Syntax

```javascript
Object.getPrototypeOf(object);
```

Returns

```text
The object's [[Prototype]]
```

---

#### Example

```javascript
const animal = {
  eats: true,
};

const rabbit = Object.create(animal);

console.log(Object.getPrototypeOf(rabbit));
```

Output

```javascript
{
  eats: true;
}
```

---

#### Internal Working

JavaScript internally performs

```text
Read object's

↓

[[Prototype]]

↓

Return Reference
```

No property lookup occurs.

---

#### Memory Diagram

```text
rabbit

↓

animal

↓

Object.prototype

↓

null
```

---

#### Why Prefer It Over **proto**?

Instead of

```javascript
rabbit.__proto__;
```

Prefer

```javascript
Object.getPrototypeOf(rabbit);
```

Reasons:

- Official API
- Standardized
- Clear intent
- Better compatibility

---

### Reflect.getPrototypeOf()

The Reflect API provides an equivalent operation.

```javascript
Reflect.getPrototypeOf(rabbit);
```

Returns exactly the same prototype.

---

### Object.setPrototypeOf()

#### Syntax

```javascript
Object.setPrototypeOf(obj, prototype);
```

Changes an existing object's prototype.

---

#### Example

```javascript
const animal = {
  eats: true,
};

const rabbit = {};

Object.setPrototypeOf(rabbit, animal);

console.log(rabbit.eats);
```

Output

```text
true
```

---

#### Internal Working

```
rabbit

↓

Old Prototype

↓

Object.prototype

-----------------

becomes

rabbit

↓

animal

↓

Object.prototype
```

---

#### Why Is It Discouraged?

Changing an object's prototype after creation forces JavaScript engines to discard internal optimizations.

This can significantly reduce performance in performance-critical code.

Instead,

prefer

```javascript
Object.create();
```

when creating the object.

---

### Reflect.setPrototypeOf()

Equivalent API

```javascript
Reflect.setPrototypeOf(rabbit, animal);
```

Difference:

Returns

```text
true

or

false
```

instead of throwing in some failure cases.

---

### Object.hasOwn()

Introduced as a modern replacement for

```javascript
hasOwnProperty();
```

---

#### Syntax

```javascript
Object.hasOwn(object, property);
```

---

#### Example

```javascript
const animal = {
  eats: true,
};

const rabbit = Object.create(animal);

rabbit.jump = true;

console.log(Object.hasOwn(rabbit, "jump"));

console.log(Object.hasOwn(rabbit, "eats"));
```

Output

```text
true

false
```

---

#### Why Was It Added?

Objects created with

```javascript
Object.create(null);
```

do not inherit

```javascript
hasOwnProperty();
```

Therefore

```javascript
obj.hasOwnProperty(...)
```

may fail.

`Object.hasOwn()` works regardless of the object's prototype.

---

### Object.getOwnPropertyNames()

Returns all own string property names,

including non-enumerable properties.

---

Example

```javascript
const user = {
  name: "John",
  age: 25,
};

console.log(Object.getOwnPropertyNames(user));
```

Output

```javascript
["name", "age"];
```

---

Unlike

```javascript
Object.keys();
```

this also includes non-enumerable string properties.

---

### Object.getOwnPropertySymbols()

Objects may have Symbol keys.

Example

```javascript
const id = Symbol();

const user = {
  [id]: 100,
};

console.log(Object.getOwnPropertySymbols(user));
```

Output

```javascript
[Symbol()];
```

---

### Object.getOwnPropertyDescriptors()

Returns the complete descriptor of every own property.

Example

```javascript
const user = {
  name: "John",
};

console.log(Object.getOwnPropertyDescriptors(user));
```

Output

```javascript
{
  name: {
      value: "John",
      writable: true,
      enumerable: true,
      configurable: true
  }
}
```

---

### Why Is This Useful?

Useful when:

- cloning objects while preserving descriptors
- implementing libraries
- decorators
- serialization utilities

---

### Object.keys() vs Object.getOwnPropertyNames()

| API                          | Enumerable | Non-enumerable |
| ---------------------------- | ---------- | -------------- |
| Object.keys()                | ✓          | ✗              |
| Object.getOwnPropertyNames() | ✓          | ✓              |

---

### hasOwnProperty() vs Object.hasOwn()

| Feature                        | hasOwnProperty() | Object.hasOwn() |
| ------------------------------ | ---------------- | --------------- |
| Requires Object.prototype      | Yes              | No              |
| Works with Object.create(null) | No               | Yes             |
| Modern Recommendation          | No               | Yes             |

---

### **proto** vs Modern APIs

| Task               | Legacy                 | Modern                          |
| ------------------ | ---------------------- | ------------------------------- |
| Read prototype     | `obj.__proto__`        | `Object.getPrototypeOf(obj)`    |
| Set prototype      | `obj.__proto__ = x`    | `Object.setPrototypeOf(obj, x)` |
| Check own property | `obj.hasOwnProperty()` | `Object.hasOwn()`               |

---

### Real-World Example

Suppose a framework wants to verify inheritance.

```javascript
const animal = {};

const rabbit = Object.create(animal);

if (Object.getPrototypeOf(rabbit) === animal) {
  console.log("Correct");
}
```

---

### Performance Considerations

Good

```javascript
Object.create(proto);
```

Prototype assigned during creation.

---

Bad

```javascript
const obj = {};

Object.setPrototypeOf(obj, proto);
```

Prototype changes after creation.

Modern engines optimize the first approach much better.

---

### Common Misconceptions

#### Misconception 1

`__proto__`

and

```javascript
prototype;
```

are the same.

Wrong.

One is an object's internal prototype.

The other is a property of constructor functions.

---

#### Misconception 2

`Object.setPrototypeOf()`

copies properties.

Wrong.

It only changes the prototype link.

---

#### Misconception 3

`Object.hasOwn()`

checks inherited properties.

Wrong.

It checks only own properties.

---

### Common Mistakes

#### Mistake 1

Using

```javascript
obj.__proto__;
```

in modern code.

Prefer

```javascript
Object.getPrototypeOf();
```

---

#### Mistake 2

Frequently changing prototypes.

Prototype mutation is slow.

---

#### Mistake 3

Using

```javascript
hasOwnProperty();
```

on objects created with

```javascript
Object.create(null);
```

It throws because the method doesn't exist.

---

### Best Practices

- Prefer `Object.getPrototypeOf()` over `__proto__`.
- Prefer `Object.setPrototypeOf()` only when absolutely necessary.
- Create objects with the correct prototype using `Object.create()` instead of changing it later.
- Use `Object.hasOwn()` in modern JavaScript instead of `hasOwnProperty()`.
- Avoid runtime prototype mutation in performance-sensitive code.
- Use descriptor APIs only when you need fine-grained control over property metadata.

---

### Interview Questions

#### Q1. Why is `__proto__` discouraged?

#### Q2. Difference between `Object.create()` and `Object.setPrototypeOf()`?

#### Q3. Why is `Object.setPrototypeOf()` considered slow?

#### Q4. Difference between `Object.hasOwn()` and `hasOwnProperty()`?

#### Q5. Difference between `Object.keys()` and `Object.getOwnPropertyNames()`?

#### Q6. What does `Object.getOwnPropertyDescriptors()` return?

#### Q7. Why does `Object.hasOwn()` work with `Object.create(null)`?

#### Q8. What is the Reflect API, and why does it provide prototype methods?

#### Q9. Does `Object.setPrototypeOf()` copy properties?

#### Q10. Which API should modern JavaScript use to read an object's prototype?

---

### Key Takeaways

- Modern JavaScript provides standardized APIs for working with prototypes and property metadata.
- `Object.getPrototypeOf()` and `Reflect.getPrototypeOf()` are preferred over `__proto__` for reading prototypes.
- `Object.setPrototypeOf()` changes an existing object's prototype but should be avoided in performance-critical code.
- `Object.hasOwn()` is the modern replacement for `hasOwnProperty()` and works even for prototype-less objects.
- Property introspection APIs (`Object.getOwnPropertyNames()`, `Object.getOwnPropertySymbols()`, and `Object.getOwnPropertyDescriptors()`) provide fine-grained information about an object's own properties.
- Choosing the correct API improves code clarity, compatibility, and performance.

---

### Next Part
