# `__proto__`, `[[Prototype]]` and `prototype`

> One of the biggest sources of confusion in JavaScript is the difference between:
>
> - `[[Prototype]]`
> - `__proto__`
> - `prototype`
>
> Although their names are similar, they are **three completely different things**.
>
> This chapter builds the mental model you need before learning constructor functions and `F.prototype`.

---

# Why is This Confusing?

Many beginners think these are the same thing.

```javascript
prototype;

__proto__[[Prototype]];
```

They are **not**.

They all have different purposes.

Understanding this difference is one of the most important JavaScript interview topics.

---

# The Three Terms

| Name            | What is it?                             | Exists On             |
| --------------- | --------------------------------------- | --------------------- |
| `[[Prototype]]` | Internal hidden prototype link          | Every object          |
| `__proto__`     | Getter/Setter to access `[[Prototype]]` | Every object (legacy) |
| `prototype`     | Property of constructor functions       | Functions only        |

Always remember:

```text
Object

↓

[[Prototype]]

NOT

prototype
```

---

# Big Picture

```text
                Function
                  │
                  │ has
                  ▼
          prototype property
                  │
                  │ used by new
                  ▼
Object ----------------------------+
│                                  │
│ internal hidden link             │
▼                                  │
[[Prototype]]                      │
│                                  │
│ accessed by                      │
▼                                  │
__proto__ -------------------------+
```

---

# What is `[[Prototype]]`?

`[[Prototype]]` is an **internal hidden property** that exists inside every JavaScript object.

It stores a reference to another object.

Example

```text
rabbit

↓

animal

↓

Object.prototype

↓

null
```

Here,

```text
rabbit
```

contains

```text
[[Prototype]]

↓

animal
```

---

# Why is it Hidden?

It is part of JavaScript's internal implementation.

You cannot access it directly.

This is **invalid**:

```javascript
obj.[[Prototype]]
```

because

```text
[[Prototype]]
```

is **not actual JavaScript syntax**.

It is notation used in the ECMAScript specification.

---

# Purpose of `[[Prototype]]`

Whenever JavaScript cannot find a property,

it follows

```text
[[Prototype]]
```

to continue searching.

Example

```javascript
rabbit.eats;
```

Search process

```text
rabbit

↓

Not Found

↓

[[Prototype]]

↓

animal

↓

Found
```

---

# What is `__proto__`?

`__proto__` is **not** the prototype itself.

It is a special **getter/setter property** that allows us to read or change an object's internal `[[Prototype]]`.

Example

```javascript
const animal = {
  eats: true,
};

const rabbit = {};

rabbit.__proto__ = animal;

console.log(rabbit.eats);
```

Output

```text
true
```

---

Internally

```text
rabbit

↓

[[Prototype]]

↓

animal
```

---

# Important

```text
__proto__

≠

[[Prototype]]
```

Instead

```text
__proto__

↓

accesses

↓

[[Prototype]]
```

Think of it like this:

```text
Door Handle

↓

Door
```

The handle is **not** the door.

It only allows you to open it.

Similarly,

```text
__proto__

↓

accesses

↓

[[Prototype]]
```

---

# Why is `__proto__` Considered Legacy?

Early versions of JavaScript had no official way to read or modify an object's prototype.

Browsers introduced

```javascript
__proto__;
```

to solve this problem.

Later,

ECMAScript standardized better APIs.

Today,

use

```javascript
Object.getPrototypeOf();
```

and

```javascript
Object.setPrototypeOf();
```

instead.

---

# Modern Alternative

Get prototype

```javascript
Object.getPrototypeOf(obj);
```

Set prototype

```javascript
Object.setPrototypeOf(obj, anotherObject);
```

Example

```javascript
const animal = {
  eats: true,
};

const rabbit = {};

Object.setPrototypeOf(rabbit, animal);

console.log(Object.getPrototypeOf(rabbit));
```

---

# Why Prefer Modern APIs?

Because they are

- Standardized
- Clear
- Portable
- Recommended by ECMAScript

Instead of

```javascript
obj.__proto__;
```

prefer

```javascript
Object.getPrototypeOf(obj);
```

---

# What is `prototype`?

Unlike `[[Prototype]]`,

this is **a normal property**.

It exists only on

```text
Constructor Functions
```

Example

```javascript
function Rabbit() {}
```

This function automatically has

```javascript
Rabbit.prototype;
```

Notice

```text
prototype

↓

Function Property
```

It is **not** inside objects.

---

# Purpose of `prototype`

Its only special job is:

```text
When

new Rabbit()

is executed

↓

The newly created object's

[[Prototype]]

becomes

Rabbit.prototype
```

---

Visualization

```text
function Rabbit()

↓

Rabbit.prototype

↓

(new)

↓

rabbit

↓

rabbit.[[Prototype]]

↓

Rabbit.prototype
```

This is exactly how constructor-based inheritance works.

We'll study it in detail in Part 2.

---

# Comparing the Three

Suppose

```javascript
function Rabbit() {}
```

Now

```javascript
Rabbit.prototype;
```

exists.

When

```javascript
const rabbit = new Rabbit();
```

internally JavaScript creates

```text
rabbit

↓

[[Prototype]]

↓

Rabbit.prototype
```

and

```javascript
rabbit.__proto__;
```

simply returns

```javascript
Rabbit.prototype;
```

---

Visualization

```text
function Rabbit

│

├── prototype
│
▼
{}

▲

│

[[Prototype]]

│

rabbit
```

---

# Example

```javascript
function Rabbit() {}

const rabbit = new Rabbit();

console.log(rabbit.__proto__ === Rabbit.prototype);
```

Output

```text
true
```

---

Also

```javascript
console.log(Object.getPrototypeOf(rabbit) === Rabbit.prototype);
```

Output

```text
true
```

---

# Common Misconceptions

## Misconception 1

> `prototype` and `__proto__` are the same.

Wrong.

One belongs to functions.

One belongs to objects.

---

## Misconception 2

> Every object has a `prototype`.

Wrong.

Objects have

```text
[[Prototype]]
```

Functions have

```text
prototype
```

---

## Misconception 3

> `__proto__` is the real prototype.

Wrong.

It simply exposes the hidden

```text
[[Prototype]]
```

---

# Interview Memory Trick

Remember this sentence:

```text
Functions have

prototype

Objects have

[[Prototype]]

__proto__

is only a way to access

[[Prototype]]
```

---

# Comparison Table

| Feature                  | `prototype` | `[[Prototype]]`           | `__proto__`                    |
| ------------------------ | ----------- | ------------------------- | ------------------------------ |
| Exists On                | Functions   | Every Object              | Every Object (legacy accessor) |
| Visible                  | Yes         | No                        | Yes                            |
| Internal Property        | ❌          | ✅                        | ❌                             |
| Used by `new`            | ✅          | Indirectly                | ❌                             |
| Can be accessed directly | Yes         | No                        | Yes                            |
| Modern Alternative       | —           | `Object.getPrototypeOf()` | Avoid using                    |

---

# Real-World Flow

```javascript
function Person() {}

const p = new Person();
```

Internally

```text
Step 1

Create object

↓

Step 2

Set

p.[[Prototype]]

↓

Person.prototype

↓

Step 3

Return object
```

---

# Advantages of Understanding This

- Easier to understand inheritance.
- Easier to debug prototype issues.
- Essential for constructor functions.
- Required for understanding JavaScript classes.
- Frequently asked in interviews.

---

# Common Mistakes

### Mistake 1

Using

```javascript
obj.prototype;
```

Normal objects do **not** have a meaningful `prototype` property.

---

### Mistake 2

Thinking

```javascript
__proto__;
```

creates inheritance.

It only reads or changes an existing prototype link.

---

### Mistake 3

Using

```javascript
__proto__;
```

in production code.

Prefer

```javascript
Object.getPrototypeOf();

Object.setPrototypeOf();
```

---

# Interview Questions

## Q1. What is `[[Prototype]]`?

**Answer**

It is the internal hidden reference that points to another object and is used for prototype-based inheritance.

---

## Q2. What is `__proto__`?

**Answer**

It is a legacy getter/setter that provides access to an object's internal `[[Prototype]]`.

---

## Q3. What is `prototype`?

**Answer**

It is a property that exists on constructor functions. When `new` is used, the created object's `[[Prototype]]` is set to this property.

---

## Q4. Which one should you use today?

**Answer**

Use:

- `Object.getPrototypeOf()`
- `Object.setPrototypeOf()`

Avoid relying on `__proto__` in application code.

---

## Q5. Does every object have a `prototype` property?

**Answer**

No. Ordinary objects have an internal `[[Prototype]]`. The `prototype` property is associated with constructor functions.

---

# Key Takeaways

- `[[Prototype]]` is the hidden internal link used for inheritance.
- `__proto__` is a legacy accessor for reading or changing `[[Prototype]]`.
- `prototype` is a property of constructor functions, used by the `new` operator.
- Functions have `prototype`; objects have `[[Prototype]]`.
- When `new Constructor()` is called, the new object's `[[Prototype]]` is set to `Constructor.prototype`.
- Prefer `Object.getPrototypeOf()` and `Object.setPrototypeOf()` over `__proto__`.
- Confusing these three concepts is one of the most common JavaScript mistakes.

---
