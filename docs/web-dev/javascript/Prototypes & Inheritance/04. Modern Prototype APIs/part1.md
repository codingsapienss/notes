# Object.create()

> Until now, we've learned that JavaScript automatically assigns a prototype when using:
>
> - Object literals (`{}`)
> - Constructor functions (`new`)
> - ES6 classes (`new`)
>
> But what if we want complete control over an object's prototype?
>
> JavaScript provides a dedicated API for this:
>
> ```javascript
> Object.create();
> ```
>
> This chapter explains everything about `Object.create()`, including how it works internally, why it exists, when to use it, and how it differs from constructors and classes.

---

# Prerequisites

Before reading this chapter, you should understand:

- Prototype Chain
- `__proto__`
- `[[Prototype]]`
- Constructor Functions
- `F.prototype`
- Object Literals

---

# Why Does Object.create() Exist?

Before ES5,

the primary ways to create objects were:

```javascript
{
}
```

or

```javascript
new Constructor();
```

Both automatically determine the object's prototype.

Sometimes we want to decide the prototype ourselves.

`Object.create()` gives us complete control over the prototype chain.

---

# Syntax

```javascript
Object.create(proto);
```

or

```javascript
Object.create(proto, propertiesObject);
```

Parameters:

- `proto`
- `propertiesObject` (optional)

---

# Return Value

Returns a **new object** whose internal `[[Prototype]]` is set to the specified `proto`.

---

# Simplest Example

```javascript
const animal = {
  eats: true,
};

const rabbit = Object.create(animal);

console.log(rabbit.eats);
```

---

Explain internally.

Memory diagram.

Prototype diagram.

---

# What Actually Happens Internally?

Show engine steps.

```
Create Empty Object
↓

Set [[Prototype]]
↓

animal
↓

Return Object
```

---

# Visual Memory Diagram

```
rabbit

↓

animal

↓

Object.prototype

↓

null
```

---

# Verifying the Prototype

Explain

```javascript
Object.getPrototypeOf();
```

Example

```javascript
const animal = {};

const rabbit = Object.create(animal);

console.log(Object.getPrototypeOf(rabbit) === animal);
```

---

# Object.create(null)

Introduce briefly.

(Deep explanation reserved for Part 4C.)

Example

```javascript
const obj = Object.create(null);
```

Explain:

- no Object.prototype
- no toString()
- no hasOwnProperty()

---

# Object.create() vs {}

Comparison table

| `{}`                        | `Object.create()`         |
| --------------------------- | ------------------------- |
| Prototype automatically set | Prototype chosen manually |
| Uses Object.prototype       | Can use any object        |
| Less flexible               | More flexible             |

---

# Object.create() vs Constructor Functions

Comparison

```javascript
new User();
```

vs

```javascript
Object.create(proto);
```

Discuss:

- constructor execution
- prototype assignment
- property initialization

---

# Object.create() vs Classes

Comparison table.

---

# Creating Objects Without Constructors

Example

```javascript
const personMethods = {
  greet() {
    console.log("Hello");
  },
};

const person = Object.create(personMethods);

person.name = "John";
```

Explain why this works.

---

# Creating Multiple Objects

Example

Reuse one prototype.

Show memory diagram.

---

# Object.create() with Property Descriptors

Explain second parameter.

Example

```javascript
const obj = Object.create(
  {},
  {
    name: {
      value: "John",

      writable: true,

      enumerable: true,

      configurable: true,
    },
  },
);
```

Explain every descriptor.

---

# Property Descriptor Review

Explain

- value
- writable
- enumerable
- configurable

(with diagrams)

---

# Why Use Property Descriptors?

Real-world example.

Read-only configuration object.

---

# Creating Immutable Objects

Example using

```javascript
writable: false;
```

---

# Using Object.create() for Inheritance

Example

```javascript
const animal = {
  eat() {},
};

const rabbit = Object.create(animal);

rabbit.jump = function () {};
```

Memory diagram.

---

# Deep Prototype Chains

Example

```
animal

↓

rabbit

↓

whiteRabbit
```

using only

```javascript
Object.create();
```

---

# Manual Prototype Inheritance

Build inheritance manually without

- classes
- constructor functions

---

# Real-World Use Cases

Discuss:

- Dictionary objects
- Shared methods
- Lightweight inheritance
- Object composition
- Framework internals

---

# Performance Considerations

Explain:

- Prototype lookup
- Shared methods
- Memory savings
- Why changing prototypes later is slower

---

# Common Misconceptions

Examples.

---

# Common Mistakes

Examples.

---

# Best Practices

Guidelines.

---

# Interview Questions

15–20 interview questions.

---

# Summary

Key takeaways.

---
