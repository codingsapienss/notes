# Borrowing Methods from Native Prototypes (Method Borrowing)

> One of JavaScript's most powerful features is that **methods are not permanently tied to the objects they belong to.**
>
> In many cases, we can take a method from one object and use it with another completely different object.
>
> This technique is called:
>
> ```text
> Method Borrowing
> ```
>
> It is widely used inside JavaScript libraries and frameworks and demonstrates how flexible JavaScript's object model really is.

---

# Prerequisites

Before reading this chapter, you should understand:

- Objects
- Functions
- `this`
- Prototype Chain
- Native Prototypes
- `call()`
- `apply()`
- `bind()`

---

# The Problem

Consider this object.

```javascript
const obj = {
  0: "Hello",

  1: "World",

  length: 2,
};
```

Question

```text
Can we join these values
like an array?
```

Normally,

```javascript
join();
```

belongs to arrays.

```javascript
const arr = ["Hello", "World"];

console.log(arr.join(" "));
```

Output

```text
Hello World
```

But

```javascript
obj;
```

is **not** an array.

---

# Surprisingly...

This works.

```javascript
const obj = {
  0: "Hello",

  1: "World",

  length: 2,
};

obj.join = Array.prototype.join;

console.log(obj.join(" "));
```

Output

```text
Hello World
```

Question

```text
How?

obj is NOT an array.
```

---

# The Secret

JavaScript methods usually don't care

```text
Who owns them.
```

They only care about

```text
this
```

If

```text
this
```

contains the required properties,

the method works.

---

# What Does `join()` Need?

Internally,

`Array.prototype.join()` mainly uses

```text
this.length

this[0]

this[1]

this[2]

...
```

It does **not** ask

```text
Are you really an Array?
```

Instead,

it simply accesses indexed properties and the `length` property.

---

# Memory Diagram

```text
obj

│

├── 0 : "Hello"

├── 1 : "World"

├── length : 2

├── join

│

▼

Array.prototype.join()
```

When

```javascript
obj.join(" ");
```

runs,

```text
this

↓

obj
```

---

# Internal Execution

Conceptually

```javascript
join.call(obj, " ");
```

Inside

```javascript
join();
```

JavaScript sees

```javascript
this[0]

↓

"Hello"

this[1]

↓

"World"

length

↓

2
```

Everything needed exists.

So it works.

---

# Method Borrowing Using `call()`

Instead of copying the method,

we can directly borrow it.

```javascript
const obj = {
  0: "JavaScript",

  1: "Prototype",

  length: 2,
};

console.log(Array.prototype.join.call(obj, " "));
```

Output

```text
JavaScript Prototype
```

---

# Why Does This Work?

Because

```javascript
call();
```

changes

```text
this
```

Inside

```javascript
join();
```

```text
this

↓

obj
```

---

Visualization

```text
Array.prototype.join

↓

call()

↓

this = obj

↓

join()

↓

Result
```

---

# Array-Like Objects

Objects like this

```javascript
const obj = {
  0: "A",

  1: "B",

  length: 2,
};
```

are called

```text
Array-Like Objects
```

---

# Definition

An **array-like object** is any object that has:

- Numeric indexes
- A `length` property

Example

```javascript
const obj = {
  0: "A",

  1: "B",

  2: "C",

  length: 3,
};
```

Although

```javascript
Array.isArray(obj);
```

returns

```text
false
```

many array methods still work.

---

# Borrowing Other Methods

## `slice()`

```javascript
const obj = {
  0: "A",

  1: "B",

  2: "C",

  length: 3,
};

const result = Array.prototype.slice.call(obj);

console.log(result);
```

Output

```javascript
["A", "B", "C"];
```

---

## `forEach()`

```javascript
Array.prototype.forEach.call(
  obj,

  (value) => console.log(value),
);
```

Output

```text
A

B

C
```

---

## `map()`

```javascript
const result = Array.prototype.map.call(
  obj,

  (value) => value.toLowerCase(),
);

console.log(result);
```

Output

```javascript
["a", "b", "c"];
```

---

## `filter()`

```javascript
const numbers = {
  0: 10,

  1: 20,

  2: 30,

  length: 3,
};

const result = Array.prototype.filter.call(
  numbers,

  (value) => value > 15,
);

console.log(result);
```

Output

```javascript
[20, 30];
```

---

# Method Borrowing Isn't Limited to Arrays

Suppose

```javascript
const user = {
  name: "John",
};
```

Borrow

```javascript
Object.prototype.hasOwnProperty.call(
  user,

  "name",
);
```

Output

```text
true
```

Notice

We're borrowing

```javascript
hasOwnProperty();
```

without attaching it to the object.

---

# Why Is This Useful?

Suppose

```javascript
const obj = Object.create(null);
```

This object has

```text
No Object.prototype
```

Therefore

```javascript
obj.hasOwnProperty;
```

doesn't exist.

Instead,

```javascript
Object.prototype.hasOwnProperty.call(
  obj,

  "name",
);
```

works.

This pattern is common in older JavaScript code, although `Object.hasOwn()` is now the preferred modern alternative.

---

# Why Doesn't Every Method Work?

Some methods require

special internal data.

Example

```javascript
const obj = {};

Map.prototype.get.call(obj);
```

Output

```text
TypeError
```

Why?

Because

```javascript
Map.prototype.get();
```

expects

```text
Internal Map Data
```

not just

```text
length

indexes
```

Many built-in methods perform internal brand checks to ensure they are operating on the correct kind of object.

---

# Generic Methods

Some methods are

```text
Generic
```

Meaning

they only require

```text
this
```

to contain certain properties.

Examples

```javascript
join();

slice();

map();

filter();

forEach();
```

These methods work with many array-like objects.

---

# Non-Generic Methods

Some methods require

special internal structures.

Examples

```javascript
Map.prototype.get();

Set.prototype.add();

Date.prototype.getTime();
```

These cannot usually be borrowed for unrelated objects.

---

# Borrowing vs Copying

Copying

```javascript
obj.join = Array.prototype.join;
```

Method becomes

```text
Permanent
```

inside the object.

---

Borrowing

```javascript
Array.prototype.join.call(obj);
```

Method stays inside

```javascript
Array.prototype;
```

No modification to

```javascript
obj;
```

---

# Visual Comparison

Copy

```text
obj

├── join

↓

Array.prototype.join
```

---

Borrow

```text
Array.prototype.join

↓

call(obj)

↓

Execute

↓

Done
```

---

# Why Is This Possible?

Remember

Functions are objects.

Methods are simply

```text
Function Values
```

stored inside objects.

Example

```javascript
Array.prototype.join;
```

is simply

```text
A Function
```

Functions can therefore be

- Stored
- Copied
- Passed
- Borrowed
- Returned

just like any other value.

---

# Real-World Example

Older browser APIs often returned

```javascript
arguments;

NodeList;

HTMLCollection;
```

These are array-like,

not real arrays.

Developers frequently wrote

```javascript
const arr = Array.prototype.slice.call(arguments);
```

to convert them into real arrays.

Today, `Array.from(arguments)` or the spread operator (`[...arguments]`) is generally preferred.

---

# Common Misconceptions

## Misconception 1

Methods belong permanently to their objects.

Wrong.

Methods are simply function values.

---

## Misconception 2

Only arrays can use array methods.

Wrong.

Many array methods are generic.

---

## Misconception 3

Every native method can be borrowed.

Wrong.

Some require internal engine data.

---

# Common Mistakes

## Mistake 1

Trying to borrow

```javascript
Map.prototype.get();
```

for ordinary objects.

It throws a

```text
TypeError
```

---

## Mistake 2

Confusing

array-like objects

with

arrays.

Array-like objects don't inherit from

```javascript
Array.prototype;
```

unless you explicitly set their prototype.

---

## Mistake 3

Thinking

```javascript
call();
```

copies the function.

It doesn't.

It simply changes

```text
this
```

for that invocation.

---

# Best Practices

- Use method borrowing only when it makes the code clearer.
- Prefer modern APIs like `Array.from()` and the spread operator over older borrowing patterns for converting array-like objects.
- Understand which native methods are generic and which require special internal object types.
- Prefer `Object.hasOwn()` over borrowed `hasOwnProperty()` in modern JavaScript when available.

---

# Interview Questions

## Q1. What is method borrowing?

**Answer**

Method borrowing is the practice of using a method from one object on another object by changing its `this` value, usually with `call()`, `apply()`, or `bind()`.

---

## Q2. Why does `Array.prototype.join.call(obj)` work?

**Answer**

Because `join()` mainly relies on indexed properties (`this[0]`, `this[1]`, ...) and `this.length`, not on the object being an actual array.

---

## Q3. What is an array-like object?

**Answer**

An object with numeric keys and a `length` property that resembles an array but does not inherit from `Array.prototype`.

---

## Q4. Can every native method be borrowed?

**Answer**

No. Some methods, such as those on `Map`, `Set`, and `Date`, require internal object data and perform brand checks, so they throw errors when used on incompatible objects.

---

## Q5. Why is `Array.prototype.slice.call(arguments)` commonly seen in older code?

**Answer**

Because `arguments` is array-like, not a real array. Borrowing `slice()` creates a real array. Modern code typically uses `Array.from(arguments)` or the spread operator instead.

---

# Key Takeaways

- Methods in JavaScript are simply function values stored on objects.
- Method borrowing allows one object to temporarily use another object's method by changing `this`.
- Many array methods are generic and work on array-like objects.
- Array-like objects have indexed properties and a `length` property but are not true arrays.
- Some built-in methods cannot be borrowed because they require special internal object data.
- Modern JavaScript often replaces older borrowing patterns with APIs like `Array.from()` and the spread operator.
- Understanding method borrowing deepens your understanding of `this`, prototypes, and JavaScript's flexible object model.

---
