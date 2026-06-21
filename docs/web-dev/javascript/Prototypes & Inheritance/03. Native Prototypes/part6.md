# Complete Prototype Hierarchy & Mental Model

> Throughout this documentation, we've studied:
>
> - Prototype Chains
> - `F.prototype`
> - `Object.prototype`
> - Native Prototypes
> - Wrapper Objects
> - Method Borrowing
>
> This chapter brings everything together into **one complete mental model**.
>
> By the end of this chapter, you should be able to trace the prototype chain of almost any JavaScript value.

---

# Prerequisites

Before reading this chapter, you should understand:

- Objects
- Constructor Functions
- `new`
- `[[Prototype]]`
- `F.prototype`
- Native Prototypes
- Primitive Wrapper Objects

---

# The Big Picture

Every JavaScript value belongs to one of these categories:

```text
1. Ordinary Objects

2. Arrays

3. Functions

4. Built-in Objects
   (Date, Map, Set...)

5. Primitive Values
```

Every one of them eventually participates in the prototype system.

---

# The Most Important Rule

Whenever JavaScript needs a property,

it performs

```text
Current Object

↓

Current Prototype

↓

Next Prototype

↓

...

↓

null
```

Until the property is found.

---

# The Universal Lookup Algorithm

Whenever JavaScript executes

```javascript
obj.property;
```

Internally

```text
1.

Check object itself

↓

Found?

↓

YES

↓

Return

----------------

NO

↓

Check [[Prototype]]

↓

Found?

↓

YES

↓

Return

----------------

NO

↓

Next Prototype

↓

...

↓

null

↓

undefined
```

Everything about prototypes follows this algorithm.

---

# Ordinary Objects

Example

```javascript
const user = {};
```

Prototype chain

```text
user

↓

Object.prototype

↓

null
```

Methods available

```javascript
toString();

hasOwnProperty();

valueOf();

isPrototypeOf();
```

---

# Arrays

Example

```javascript
const arr = [1, 2, 3];
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

Methods

```javascript
push();

pop();

map();

filter();

reduce();

forEach();

find();

every();

some();
```

---

# Functions

Example

```javascript
function greet() {}
```

Prototype chain

```text
greet

↓

Function.prototype

↓

Object.prototype

↓

null
```

Methods

```javascript
call();

apply();

bind();

toString();
```

---

# Dates

```javascript
const today = new Date();
```

Prototype chain

```text
today

↓

Date.prototype

↓

Object.prototype

↓

null
```

Methods

```javascript
getFullYear();

getMonth();

getDate();

toISOString();
```

---

# Maps

```javascript
const map = new Map();
```

Prototype chain

```text
map

↓

Map.prototype

↓

Object.prototype

↓

null
```

Methods

```javascript
set()

get()

has()

delete()

clear()
```

---

# Sets

```javascript
const set = new Set();
```

Prototype chain

```text
set

↓

Set.prototype

↓

Object.prototype

↓

null
```

Methods

```javascript
add()

delete()

has()

clear()
```

---

# Regular Expressions

```javascript
const regex = /abc/;
```

Prototype chain

```text
regex

↓

RegExp.prototype

↓

Object.prototype

↓

null
```

---

# Promise Objects

```javascript
const promise = Promise.resolve();
```

Prototype chain

```text
promise

↓

Promise.prototype

↓

Object.prototype

↓

null
```

---

# Error Objects

```javascript
const err = new Error();
```

Prototype chain

```text
err

↓

Error.prototype

↓

Object.prototype

↓

null
```

---

# Primitive Strings

```javascript
const str = "Hello";
```

Actual value

```text
Primitive
```

When calling

```javascript
str.toUpperCase();
```

JavaScript temporarily creates

```text
String Wrapper

↓

String.prototype

↓

Object.prototype

↓

null
```

---

# Primitive Numbers

```javascript
const num = 100;
```

During method access

```text
Temporary Number Wrapper

↓

Number.prototype

↓

Object.prototype

↓

null
```

---

# Primitive Booleans

```javascript
true

↓

Temporary Boolean Wrapper

↓

Boolean.prototype

↓

Object.prototype

↓

null
```

---

# Primitive BigInt

```javascript
100n

↓

Temporary BigInt Wrapper

↓

BigInt.prototype

↓

Object.prototype

↓

null
```

---

# Primitive Symbol

```javascript
Symbol()

↓

Temporary Symbol Wrapper

↓

Symbol.prototype

↓

Object.prototype

↓

null
```

---

# Exceptions

These values have

```text
NO

Wrapper

NO

Prototype
```

```javascript
null;

undefined;
```

Example

```javascript
null.toString();
```

Output

```text
TypeError
```

---

# The Complete Hierarchy

```text
                           Object.prototype
                                   ▲
                                   │
        ┌────────────┬─────────────┼─────────────┬─────────────┐
        │            │             │             │
 Array.prototype Function.prototype Date.prototype Map.prototype Set.prototype
        ▲            ▲             ▲             ▲             ▲
        │            │             │             │             │
      Arrays     Functions       Dates         Maps         Sets
```

---

# Wrapper Hierarchy

```text
Primitive String

↓

Temporary String Object

↓

String.prototype

↓

Object.prototype

↓

null
```

The same pattern exists for

```text
Number

Boolean

BigInt

Symbol
```

---

# Constructor Relationship

Suppose

```javascript
function Rabbit() {}
```

Memory

```text
Rabbit Function

│

├── prototype

│

▼

Rabbit.prototype

│

├── constructor

│

▼

Rabbit Function

▲

│

[[Prototype]]

│

rabbit
```

This is the relationship behind every constructor function.

---

# Where Does a Method Come From?

Suppose

```javascript
const arr = [1, 2, 3];

arr.map(...);
```

Search

```text
arr

↓

No map

↓

Array.prototype

↓

Found

↓

Execute
```

---

Suppose

```javascript
function greet() {}

greet.call(...)
```

Search

```text
greet

↓

No call

↓

Function.prototype

↓

Found

↓

Execute
```

---

Suppose

```javascript
const user = {};

user.toString();
```

Search

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

---

# The Memory Optimization

Without prototypes

```text
1000 Arrays

↓

1000 push()

1000 pop()

1000 map()
```

---

With prototypes

```text
1000 Arrays

↓

Array.prototype

↓

1 push()

1 pop()

1 map()
```

Exactly the same idea applies to

- Objects
- Functions
- Dates
- Maps
- Sets

---

# Common Misconceptions

## Misconception 1

Every object stores every method.

Wrong.

Objects store data.

Methods usually live in prototype objects.

---

## Misconception 2

Methods are copied.

Wrong.

Methods are shared through prototype references.

---

## Misconception 3

Only user-created objects use prototypes.

Wrong.

Every built-in object also participates in the prototype system.

---

## Misconception 4

Primitive values are objects.

Wrong.

Temporary wrapper objects are created only when methods or properties are accessed.

---

# Prototype Lookup Cheat Sheet

| Value          | First Prototype                         |
| -------------- | --------------------------------------- |
| `{}`           | `Object.prototype`                      |
| `[]`           | `Array.prototype`                       |
| `function(){}` | `Function.prototype`                    |
| `new Date()`   | `Date.prototype`                        |
| `new Map()`    | `Map.prototype`                         |
| `new Set()`    | `Set.prototype`                         |
| `"abc"`        | `String.prototype` (temporary wrapper)  |
| `100`          | `Number.prototype` (temporary wrapper)  |
| `true`         | `Boolean.prototype` (temporary wrapper) |
| `100n`         | `BigInt.prototype` (temporary wrapper)  |
| `Symbol()`     | `Symbol.prototype` (temporary wrapper)  |
| `null`         | No prototype                            |
| `undefined`    | No prototype                            |

---

# Interview Questions

## Q1. Where does `Array.prototype` fit in the prototype chain?

**Answer**

```text
Array Instance

↓

Array.prototype

↓

Object.prototype

↓

null
```

---

## Q2. Why do arrays have access to `toString()`?

**Answer**

`Array.prototype` defines its own `toString()`. If it didn't, JavaScript would continue searching `Object.prototype`.

---

## Q3. Do primitives participate in the prototype system?

**Answer**

Yes, through temporary wrapper objects created during property or method access.

---

## Q4. Which values do not have wrapper objects?

**Answer**

`null` and `undefined`.

---

## Q5. What is the root of almost every prototype chain?

**Answer**

`Object.prototype`.

---

# Key Takeaways

- Every JavaScript object participates in a prototype chain.
- Different built-in types have their own prototype objects (`Array.prototype`, `Function.prototype`, `Date.prototype`, etc.).
- Most prototype chains eventually end at `Object.prototype`, whose own prototype is `null`.
- Primitive values access methods through temporary wrapper objects linked to their respective prototypes.
- Property lookup always follows the same algorithm: object → prototype → next prototype → `null`.
- Understanding the complete prototype hierarchy makes debugging inheritance, method lookup, and JavaScript internals significantly easier.

---
