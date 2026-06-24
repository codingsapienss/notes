# Modifying Native Prototypes & Polyfills

> JavaScript allows us to modify built-in prototypes like:
>
> - `Array.prototype`
> - `String.prototype`
> - `Object.prototype`
> - `Function.prototype`
>
> But should we?
>
> **Usually, the answer is NO.**
>
> There is only one major exception:
>
> **Polyfills**
>
> This chapter explains:
>
> - How native prototypes can be modified
> - Why it is usually a bad practice
> - What Polyfills are
> - When modifying prototypes is acceptable
> - Prototype pollution
> - Best practices followed in modern JavaScript

---

## Prerequisites

Before reading this chapter, you should understand:

- Prototype Chain
- Native Prototypes
- `Object.prototype`
- `Array.prototype`
- `String.prototype`
- Property Lookup

---

## Can We Modify Native Prototypes?

Yes.

Every native prototype is simply an object.

If it is an object,

we can add,

modify,

or delete properties.

Example

```javascript
String.prototype.sayHello = function () {
  console.log("Hello");
};
```

Now

```javascript
"JavaScript".sayHello();
```

Output

```text
Hello
```

The method became available on **every string**.

---

## How Did This Work?

Suppose

```javascript
String.prototype.sayHello = function () {
  console.log("Hello");
};
```

Memory

```text
String.prototype

│

├── toUpperCase()

├── trim()

├── includes()

├── sayHello()

│

▼

Object.prototype
```

Now

```javascript
const str = "JS";
```

Internally

```text
Primitive

↓

Temporary String Wrapper

↓

String.prototype

↓

sayHello()

↓

Execute
```

---

## Another Example

Adding a custom method

```javascript
Array.prototype.first = function () {
  return this[0];
};
```

Usage

```javascript
const numbers = [10, 20, 30];

console.log(numbers.first());
```

Output

```text
10
```

Every array now has

```javascript
first();
```

---

## Memory Diagram

```text
Array.prototype

│

├── push()

├── pop()

├── map()

├── filter()

├── first()

│

▼

Object.prototype
```

Every array shares

```javascript
first();
```

---

## Why is This Possible?

Because

```javascript
Array.prototype;
```

is simply an object.

Example

```javascript
console.log(typeof Array.prototype);
```

Output

```text
object
```

Since it's an object,

adding properties works exactly like

```javascript
const obj = {};

obj.x = 10;
```

---

## Then Why Is It Considered Bad Practice?

Imagine two different libraries.

Library A

```javascript
Array.prototype.first = function () {
  return this[0];
};
```

Library B

```javascript
Array.prototype.first = function () {
  return "Different";
};
```

Now

```javascript
const arr = [1, 2, 3];

console.log(arr.first());
```

Which version should execute?

---

Answer

The second one overwrites the first.

This creates conflicts.

---

Visualization

Before

```text
Array.prototype

↓

first()

Version A
```

After

```text
Array.prototype

↓

first()

Version B
```

Library A breaks.

---

## Global Effect

Native prototypes are shared globally.

Suppose

```javascript
Array.prototype.test = function () {};
```

Then

```javascript
const a = [];

const b = [];

const c = [];
```

All arrays immediately get

```javascript
test();
```

No imports.

No inheritance.

Everything changes globally.

---

Visualization

```text
Array.prototype

│

├── test()

│

▲

│

Array A

Array B

Array C

Array D

Array E
```

One modification affects every array.

---

## Prototype Pollution

This phenomenon is called

```text
Prototype Pollution
```

Meaning

```text
Changing a shared prototype

↓

Changes behavior

↓

Everywhere
```

---

## Example

```javascript
Object.prototype.country = "India";
```

Now

```javascript
const user = {
  name: "John",
};

console.log(user.country);
```

Output

```text
India
```

Even though

```javascript
user;
```

never had

```javascript
country;
```

---

Search

```text
user

↓

No country

↓

Object.prototype

↓

Found
```

---

## Another Problem

Suppose

```javascript
Object.prototype.version = "1.0";
```

Now

```javascript
const obj = {
  name: "John",
};

for (const key in obj) {
  console.log(key);
}
```

Output

```text
name

version
```

Unexpected!

Why?

Because

```javascript
for...in
```

iterates over inherited enumerable properties.

---

## Real-World Problems

Imagine adding

```javascript
Array.prototype.remove = function () {};
```

A third-party library may later add

```javascript
Array.prototype.remove;
```

with different behavior.

One implementation overwrites the other.

Applications become unpredictable.

---

## Why Doesn't JavaScript Prevent This?

Because prototypes are ordinary objects.

JavaScript gives developers complete flexibility.

With flexibility comes responsibility.

---

## The One Acceptable Exception

There is one situation where modifying native prototypes is considered acceptable.

That is

```text
Polyfills
```

---

## What is a Polyfill?

A Polyfill is

```text
Code that implements a feature

which exists in the JavaScript specification

but is missing in an older JavaScript engine.
```

---

Example

Imagine

```javascript
String.prototype.repeat();
```

doesn't exist in an old browser.

We can add it ourselves.

---

Example

```javascript
if (!String.prototype.repeat) {
  String.prototype.repeat = function (n) {
    return new Array(n + 1).join(this);
  };
}
```

Now

```javascript
console.log("Hi".repeat(3));
```

Output

```text
HiHiHi
```

---

## Why Is This Safe?

Notice

```javascript
if (!String.prototype.repeat)
```

We first check

```text
Does the method already exist?
```

Only if it doesn't,

we create it.

This avoids overwriting the native implementation.

---

## Polyfill Flow

```text
Method Exists?

↓

Yes

↓

Do Nothing

----------------

No

↓

Create Method

↓

Everyone Can Use It
```

---

## Modern Example

Suppose an older browser doesn't support

```javascript
Array.prototype.flat;
```

A polyfill could provide the same behavior until the browser is updated.

---

## Difference Between Custom Methods and Polyfills

### Custom Method

```javascript
Array.prototype.myMethod = function () {};
```

Purpose

```text
Inventing

New Feature
```

Not recommended.

---

### Polyfill

```javascript
if (!Array.prototype.flat) {
  Array.prototype.flat = function () {
    // implementation
  };
}
```

Purpose

```text
Implement Existing Standard
```

Accepted.

---

## Why Frameworks Rarely Modify Prototypes

Modern frameworks like

- React
- Vue
- Angular
- Svelte

almost never modify native prototypes.

Instead,

they create

- Utility functions
- Helper libraries
- Standalone APIs

Example

Instead of

```javascript
Array.prototype.sum();
```

they prefer

```javascript
sum(array);
```

or

```javascript
_.sum(array);
```

This avoids global side effects.

---

## Prototype Pollution vs Utility Functions

Instead of

```javascript
Array.prototype.last = function () {
  return this[this.length - 1];
};
```

Prefer

```javascript
function last(arr) {
  return arr[arr.length - 1];
}
```

Usage

```javascript
last(numbers);
```

No global modifications.

---

## Security Concerns

Prototype pollution is not only a design issue.

It can also become a **security vulnerability**.

Example

Suppose malicious code executes

```javascript
Object.prototype.isAdmin = true;
```

Application

```javascript
const user = {};

if (user.isAdmin) {
  // Sensitive Action
}
```

Output

```text
Access Granted
```

Even though

```javascript
user;
```

never contained

```javascript
isAdmin;
```

This is why prototype pollution is treated seriously in secure applications.

---

## Common Misconceptions

### Misconception 1

JavaScript forbids modifying prototypes.

Wrong.

It allows it.

It is simply discouraged.

---

### Misconception 2

Polyfills are hacks.

Wrong.

Polyfills are widely accepted when implementing standardized features for older environments.

---

### Misconception 3

Only `Object.prototype` can be modified.

Wrong.

Every native prototype can be modified.

Examples

```javascript
Array.prototype;

String.prototype;

Function.prototype;

Date.prototype;

Map.prototype;

Set.prototype;
```

---

## Common Mistakes

### Mistake 1

Adding custom methods to

```javascript
Object.prototype;
```

This affects almost every object.

Avoid it.

---

### Mistake 2

Overwriting existing methods.

Example

```javascript
Array.prototype.push = function () {};
```

This breaks fundamental JavaScript behavior.

Never do this.

---

### Mistake 3

Adding enumerable properties.

Custom properties may unexpectedly appear in

```javascript
for...in
```

loops.

If you must define a property, use `Object.defineProperty()` with `enumerable: false` to mimic built-in methods.

---

## Best Practices

- Avoid modifying native prototypes in application code.
- Never overwrite existing built-in methods.
- Use utility functions or helper libraries instead of custom prototype methods.
- Only write polyfills for standardized features missing in older environments.
- When implementing a polyfill, check whether the feature already exists before defining it.
- If defining properties on prototypes, make them non-enumerable to match native behavior.

---

## Interview Questions

### Q1. Can native prototypes be modified?

**Answer**

Yes. Native prototypes are ordinary JavaScript objects, so properties and methods can be added, modified, or removed.

---

### Q2. Why is modifying native prototypes discouraged?

**Answer**

Because native prototypes are shared globally. Changes affect every object of that type and can conflict with libraries, cause unexpected behavior, and introduce bugs.

---

### Q3. What is a polyfill?

**Answer**

A polyfill is code that implements a JavaScript feature defined in the specification but missing in older JavaScript engines.

---

### Q4. Why do polyfills check whether a method already exists?

**Answer**

To avoid overwriting native implementations in environments that already support the feature.

---

### Q5. What is prototype pollution?

**Answer**

Prototype pollution is the modification of shared prototype objects—intentionally or unintentionally—which changes the behavior of many objects. In security contexts, attackers may exploit this to inject unexpected properties into application objects.

---

## Key Takeaways

- Native prototypes such as `Array.prototype` and `String.prototype` are ordinary objects and can be modified.
- Modifying native prototypes affects every object that inherits from them.
- Adding custom methods to native prototypes is generally considered poor practice because of global side effects and library conflicts.
- The primary accepted use case for modifying native prototypes is implementing **polyfills**.
- Polyfills should only implement standardized features and should first verify that the feature is missing.
- Prototype pollution can lead to maintenance issues and security vulnerabilities.
- Modern JavaScript code typically favors utility functions over extending native prototypes.

---
