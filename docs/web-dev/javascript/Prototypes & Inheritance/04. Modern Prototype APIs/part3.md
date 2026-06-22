# Prototype-less Objects (`Object.create(null)`)

> Almost every object in JavaScript inherits from `Object.prototype`.
>
> That means every ordinary object automatically receives methods like:
>
> - `toString()`
> - `hasOwnProperty()`
> - `valueOf()`
> - `isPrototypeOf()`
>
> But sometimes, we **don't want any inheritance at all**.
>
> We want a completely clean object.
>
> JavaScript provides a special way to create such objects:
>
> ```javascript
> Object.create(null);
> ```
>
> This chapter explains why prototype-less objects exist, how they work internally, and where they are used in real-world applications.

---

# Prerequisites

Before reading this chapter, you should understand:

- Prototype Chain
- Object.create()
- Object.prototype
- Property Lookup
- Object.hasOwn()

---

# What is a Prototype-less Object?

Normally

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

But

```javascript
const obj = Object.create(null);
```

Prototype chain

```text
obj

↓

null
```

There is **no** `Object.prototype`.

---

# Why Does JavaScript Allow This?

Sometimes we don't want

- inherited methods
- inherited properties
- prototype lookup

We only want

```text
Pure Key-Value Storage
```

---

# Internal Working

```javascript
const obj = Object.create(null);
```

Internally

```text
Create Empty Object

↓

Set [[Prototype]]

↓

null

↓

Return Object
```

Unlike

```javascript
{
}
```

which internally behaves like

```text
Create Object

↓

Set [[Prototype]]

↓

Object.prototype
```

---

# Memory Diagram

Ordinary Object

```text
obj

↓

Object.prototype

↓

null
```

Prototype-less Object

```text
obj

↓

null
```

---

# Verification

```javascript
const obj = Object.create(null);

console.log(Object.getPrototypeOf(obj));
```

Output

```text
null
```

---

# No Inherited Methods

Example

```javascript
const obj = Object.create(null);

console.log(obj.toString);
```

Output

```text
undefined
```

---

Why?

Search

```text
obj

↓

No prototype

↓

Stop
```

No

```javascript
Object.prototype;
```

exists.

---

# Another Example

```javascript
const obj = Object.create(null);

console.log(obj.hasOwnProperty);
```

Output

```text
undefined
```

---

Likewise

```javascript
obj.valueOf;
```

```javascript
obj.constructor;
```

```javascript
obj.isPrototypeOf;
```

All return

```text
undefined
```

---

# Comparison

Ordinary Object

```javascript
const obj = {};
```

Methods available

```javascript
obj.toString();

obj.valueOf();

obj.hasOwnProperty();
```

---

Prototype-less Object

```javascript
const obj = Object.create(null);
```

Methods available

```text
None
```

---

# Why Is This Useful?

Suppose

```javascript
const scores = {};
```

Now someone inserts

```javascript
scores["toString"] = 100;
```

Problem

```javascript
scores.toString;
```

already exists on

```javascript
Object.prototype;
```

Name collisions become possible.

---

Prototype-less object

```javascript
const scores = Object.create(null);
```

Now

```javascript
scores["toString"] = 100;
```

works normally.

There is no inherited

```javascript
toString();
```

to conflict with.

---

# Dictionary Objects

Prototype-less objects are commonly used as

```text
Dictionary Objects
```

Meaning

```text
Key

↓

Value
```

Nothing else.

---

Example

```javascript
const dictionary = Object.create(null);

dictionary.apple = "🍎";

dictionary.orange = "🍊";

console.log(dictionary.apple);
```

Output

```text
🍎
```

---

# Why Not Use {}?

Because

```javascript
{
}
```

already contains inherited properties.

Example

```javascript
const obj = {};

console.log("toString" in obj);
```

Output

```text
true
```

Even though

you never created

```javascript
toString;
```

---

Prototype-less version

```javascript
const obj = Object.create(null);

console.log("toString" in obj);
```

Output

```text
false
```

---

# Property Lookup

Suppose

```javascript
const obj = Object.create(null);

obj.name = "John";
```

Lookup

```javascript
obj.name;
```

Search

```text
obj

↓

Found

↓

Return
```

---

Lookup

```javascript
obj.age;
```

Search

```text
obj

↓

Not Found

↓

Prototype?

↓

null

↓

undefined
```

No additional search occurs.

---

# Enumeration

Example

```javascript
const obj = Object.create(null);

obj.a = 1;

obj.b = 2;

for (const key in obj) {
  console.log(key);
}
```

Output

```text
a

b
```

Only own properties exist.

There are no inherited enumerable properties.

---

# Object.keys()

Works normally.

```javascript
const obj = Object.create(null);

obj.name = "John";

console.log(Object.keys(obj));
```

Output

```javascript
["name"];
```

---

# JSON Serialization

Prototype-less objects serialize exactly like ordinary objects.

Example

```javascript
const obj = Object.create(null);

obj.name = "John";

console.log(JSON.stringify(obj));
```

Output

```json
{ "name": "John" }
```

---

# The Missing constructor

Example

```javascript
const obj = Object.create(null);

console.log(obj.constructor);
```

Output

```text
undefined
```

Because

```text
constructor

↓

Object.prototype

↓

Not Present
```

---

# Using Object.hasOwn()

Remember

```javascript
obj.hasOwnProperty("name");
```

fails.

Instead

```javascript
Object.hasOwn(obj, "name");
```

works.

Example

```javascript
const obj = Object.create(null);

obj.name = "John";

console.log(Object.hasOwn(obj, "name"));
```

Output

```text
true
```

---

# Security Benefits

Prototype-less objects help prevent

```text
Prototype Pollution
```

Suppose malicious input tries to inject

```javascript
__proto__;
```

into an object.

Ordinary objects can be affected depending on how data is merged.

Prototype-less objects have no prototype chain, reducing this class of problems and making them a common choice for dictionary-style storage.

---

# Prototype Pollution Example

Ordinary object

```javascript
const obj = {};
```

Prototype chain exists.

---

Prototype-less object

```javascript
const obj = Object.create(null);
```

No prototype.

No inherited methods.

No inherited properties.

Much safer for

- dictionaries
- caches
- lookup tables

---

# Object.create(null) vs {}

| Feature                   | `{}` | `Object.create(null)` |
| ------------------------- | ---- | --------------------- |
| Inherits Object.prototype | ✓    | ✗                     |
| Has toString()            | ✓    | ✗                     |
| Has constructor           | ✓    | ✗                     |
| Has hasOwnProperty()      | ✓    | ✗                     |
| Suitable for Dictionary   | Good | Excellent             |

---

# Object.create(null) vs Map

Many developers ask

Should I use

```javascript
Map;
```

or

```javascript
Object.create(null);
```

Comparison

| Feature                                  | Object.create(null)                     | Map                 |
| ---------------------------------------- | --------------------------------------- | ------------------- |
| Key Type                                 | String & Symbol (property keys)         | Any value           |
| Preserves Insertion Order                | Mostly for string keys (per spec rules) | Yes                 |
| Size Property                            | ✗                                       | ✓                   |
| Built-in Iteration                       | Limited                                 | Excellent           |
| Performance for Frequent Inserts/Deletes | Good                                    | Often Better        |
| JSON Support                             | Native                                  | Requires conversion |

---

# When Should You Use Each?

Use

```javascript
Object.create(null);
```

when

- simple dictionary
- JSON-compatible storage
- string-based lookup tables
- configuration maps

---

Use

```javascript
Map;
```

when

- keys are objects
- frequent insert/delete
- ordered iteration
- dynamic datasets

---

# Real-World Use Cases

## Word Frequency Counter

```javascript
const frequency = Object.create(null);
```

---

## Translation Dictionary

```javascript
const translations = Object.create(null);
```

---

## Cache

```javascript
const cache = Object.create(null);
```

---

## Routing Tables

```javascript
const routes = Object.create(null);
```

---

## Compiler Symbol Tables

Many JavaScript engines and compilers internally use dictionary-like structures for symbol lookup.

---

# Common Misconceptions

## Misconception 1

Prototype-less objects are broken.

Wrong.

They simply don't inherit from

```javascript
Object.prototype;
```

---

## Misconception 2

They cannot store properties.

Wrong.

They store properties exactly like normal objects.

Only inheritance changes.

---

## Misconception 3

Object.create(null)

is the same as

```javascript
{
}
```

Wrong.

Their prototype chains are different.

---

# Common Mistakes

## Mistake 1

Calling

```javascript
obj.hasOwnProperty();
```

Produces

```text
TypeError
```

Use

```javascript
Object.hasOwn();
```

instead.

---

## Mistake 2

Calling

```javascript
obj.toString();
```

Doesn't work.

No inherited methods exist.

---

## Mistake 3

Assuming

```javascript
constructor;
```

exists.

It doesn't.

---

# Best Practices

- Use `Object.create(null)` when you need a pure dictionary object.
- Prefer `
