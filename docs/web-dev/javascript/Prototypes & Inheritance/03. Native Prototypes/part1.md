# `Object.prototype` & The Root of JavaScript Inheritance

> In the previous chapters, we learned how our own objects inherit from other objects using the prototype chain.
>
> But now an important question arises:
>
> ```javascript
> const obj = {};
>
> console.log(obj.toString());
> ```
>
> We never defined `toString()`.
>
> So where did it come from?
>
> This chapter explains one of the most important built-in objects in JavaScript:
>
> ```javascript
> Object.prototype;
> ```
>
> Understanding this chapter will explain why almost every object in JavaScript already has methods like:
>
> - `toString()`
> - `hasOwnProperty()`
> - `valueOf()`
> - `isPrototypeOf()`
> - `propertyIsEnumerable()`

---

# Prerequisites

Before reading this chapter, you should understand:

- Objects
- Constructor Functions
- `new`
- `prototype`
- `[[Prototype]]`
- Prototype Chain

---

# The Question

Consider

```javascript
const user = {};

console.log(user);
```

This object is empty.

Memory

```text
user

{

}
```

There are no methods.

Yet

```javascript
console.log(user.toString());
```

works perfectly.

Question

```text
Where does

toString()

come from?
```

---

# First Important Fact

The following two statements are equivalent.

```javascript
const user = {};
```

and

```javascript
const user = new Object();
```

The object literal

```javascript
{
}
```

is simply shorthand for

```javascript
new Object();
```

Although JavaScript engines optimize object literal creation internally, the resulting object is associated with `Object.prototype` in the same way.

---

# The Object Constructor

JavaScript already provides a built-in constructor called

```javascript
Object;
```

Visualization

```text
Object()

↓

Creates

↓

Objects
```

Whenever an object is created,

its prototype becomes

```javascript
Object.prototype;
```

---

# What is `Object.prototype`?

`Object.prototype` is the root prototype object for ordinary JavaScript objects.

It contains methods that should be available to every object.

Examples

```javascript
Object.prototype.toString;

Object.prototype.hasOwnProperty;

Object.prototype.valueOf;

Object.prototype.isPrototypeOf;

Object.prototype.propertyIsEnumerable;
```

---

# Memory Diagram

```text
Object Constructor

│

├── prototype

│

▼

Object.prototype

{

toString()

hasOwnProperty()

valueOf()

...

}
```

Every normal object ultimately inherits from this object.

---

# Creating an Empty Object

```javascript
const user = {};
```

Internally

```text
user

↓

[[Prototype]]

↓

Object.prototype

↓

null
```

---

Visualization

```text
user

│

▼

Object.prototype

│

├── toString()

├── hasOwnProperty()

├── valueOf()

├── isPrototypeOf()

│

▼

null
```

---

# Property Lookup

Suppose

```javascript
const user = {};
```

Now execute

```javascript
user.toString();
```

JavaScript searches

```text
user

↓

No toString

↓

Object.prototype

↓

Found

↓

Execute
```

This is why

```javascript
user.toString();
```

works.

---

# Verifying the Prototype

Example

```javascript
const obj = {};

console.log(Object.getPrototypeOf(obj) === Object.prototype);
```

Output

```text
true
```

This confirms

```text
obj

↓

Object.prototype
```

---

Another way

```javascript
console.log(obj.__proto__ === Object.prototype);
```

Output

```text
true
```

Although this works, prefer `Object.getPrototypeOf()` in modern code.

---

# The Complete Prototype Chain

Suppose

```javascript
const obj = {};
```

Prototype chain

```text
obj

↓

Object.prototype

↓

null
```

Notice

```text
Object.prototype

↓

null
```

---

Verification

```javascript
console.log(Object.getPrototypeOf(Object.prototype));
```

Output

```text
null
```

---

# Why Does the Chain End?

If

```text
Object.prototype
```

had another prototype,

JavaScript would continue searching forever.

Instead,

JavaScript terminates the chain using

```text
null
```

which means

```text
No More Prototype
```

---

Visualization

```text
obj

↓

Object.prototype

↓

null
```

Property lookup stops here.

---

# Searching for a Property

Suppose

```javascript
const user = {};
```

Searching

```javascript
user.toString;
```

Algorithm

```text
user

↓

Not Found

↓

Object.prototype

↓

Found

↓

Return Function
```

---

Searching

```javascript
user.walk;
```

Algorithm

```text
user

↓

Not Found

↓

Object.prototype

↓

Not Found

↓

null

↓

undefined
```

---

# Why Doesn't Every Object Store These Methods?

Imagine

```text
1,000,000 Objects
```

Without prototypes

```text
Each object

↓

Own toString()

↓

Own hasOwnProperty()

↓

Own valueOf()
```

Millions of duplicate functions.

---

With prototypes

```text
1,000,000 Objects

↓

One

Object.prototype

↓

Shared Methods
```

Huge memory savings.

---

# Built-in Methods

Some common methods available because of

```javascript
Object.prototype;
```

| Method                   | Purpose                   |
| ------------------------ | ------------------------- |
| `toString()`             | Convert object to string  |
| `hasOwnProperty()`       | Check own property        |
| `valueOf()`              | Primitive representation  |
| `isPrototypeOf()`        | Prototype relationship    |
| `propertyIsEnumerable()` | Check enumerable property |

---

# Example

```javascript
const user = {
  name: "John",
};

console.log(user.hasOwnProperty("name"));
```

Output

```text
true
```

Question

```text
Where is

hasOwnProperty()

stored?
```

Answer

```text
Object.prototype
```

---

# Another Example

```javascript
const user = {
  name: "John",
};

console.log(user.valueOf());
```

Output

```javascript
{
  name: "John";
}
```

Again,

the method comes from

```javascript
Object.prototype;
```

---

# Why Do We Say "Everything Inherits From Object"?

Most ordinary JavaScript objects eventually have

```text
Object.prototype
```

at the top of their prototype chain.

Example

```javascript
const arr = [];
```

Prototype chain

```text
arr

↓

Array.prototype

↓

Object.prototype

↓

null
```

Similarly

```javascript
function f() {}
```

Prototype chain

```text
f

↓

Function.prototype

↓

Object.prototype

↓

null
```

So although arrays and functions have their own prototypes first,

they eventually reach

```text
Object.prototype
```

---

# Important Exception

Not every value inherits from

```text
Object.prototype
```

Examples

```javascript
null;

undefined;
```

They have no object wrapper and no prototype chain.

Additionally, objects created with `Object.create(null)` deliberately have no prototype and therefore do not inherit from `Object.prototype`. We'll study these later.

---

# Visual Summary

Ordinary Object

```text
user

↓

Object.prototype

↓

null
```

Array

```text
array

↓

Array.prototype

↓

Object.prototype

↓

null
```

Function

```text
function

↓

Function.prototype

↓

Object.prototype

↓

null
```

---

# Common Mistakes

## Mistake 1

Thinking

```javascript
{
}
```

has no prototype.

Wrong.

It automatically inherits from

```javascript
Object.prototype;
```

---

## Mistake 2

Thinking

```javascript
toString();
```

belongs to every object individually.

Wrong.

It exists once inside

```javascript
Object.prototype;
```

---

## Mistake 3

Thinking

```javascript
Object.prototype;
```

has another prototype.

Wrong.

Its prototype is

```text
null
```

---

## Mistake 4

Thinking all JavaScript values inherit from `Object.prototype`.

Wrong.

`null` and `undefined` do not, and objects created with `Object.create(null)` are intentionally prototype-less.

---

# Best Practices

- Prefer `Object.getPrototypeOf()` over `__proto__` for inspecting prototypes.
- Remember that methods inherited from `Object.prototype` are shared across objects.
- Be aware that objects without `Object.prototype` (created with `Object.create(null)`) won't have methods like `hasOwnProperty()`.

---

# Interview Questions

## Q1. Why does an empty object have `toString()`?

**Answer**

Because an empty object inherits from `Object.prototype`, where `toString()` is defined.

---

## Q2. What is `Object.prototype`?

**Answer**

It is the root prototype object for ordinary JavaScript objects and contains methods shared by almost all objects.

---

## Q3. What is the prototype of `Object.prototype`?

**Answer**

Its prototype is `null`, which marks the end of the prototype chain.

---

## Q4. Why is `Object.prototype` important?

**Answer**

It provides common functionality shared by ordinary JavaScript objects while avoiding duplication of methods.

---

## Q5. Does every JavaScript object inherit directly from `Object.prototype`?

**Answer**

No. Arrays inherit from `Array.prototype`, functions inherit from `Function.prototype`, and many built-in objects have their own prototypes first. However, those prototype chains usually end at `Object.prototype`. Objects created with `Object.create(null)` are an exception.

---

# Key Takeaways

- `{}` is conceptually equivalent to `new Object()`.
- Ordinary objects automatically have `Object.prototype` as their prototype.
- `Object.prototype` contains common methods such as `toString()`, `hasOwnProperty()`, and `valueOf()`.
- Property lookup continues through `Object.prototype` before stopping at `null`.
- `Object.prototype` is the root of the prototype chain for ordinary objects.
- Arrays and functions have their own prototypes, but their chains typically end at `Object.prototype`.
- `null`, `undefined`, and prototype-less objects created with `Object.create(null)` are important exceptions.

---
