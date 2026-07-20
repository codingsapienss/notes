# Native Prototypes (`Array.prototype`, `Function.prototype`, `Date.prototype` & More)

> In the previous chapter, we learned that every ordinary object eventually inherits from:
>
> ```javascript
> Object.prototype;
> ```
>
> But now another question arises.
>
> ```javascript
> const arr = [1, 2, 3];
>
> arr.map(...);
> arr.filter(...);
> arr.push(...);
> ```
>
> We never created these methods.
>
> So where do they come from?
>
> Similarly,
>
> ```javascript
> function greet() {}
>
> greet.call(...)
> greet.apply(...)
> greet.bind(...)
> ```
>
> Where did these methods come from?
>
> The answer is:
>
> **Native Prototypes**

---

### Prerequisites

Before reading this chapter, you should understand:

- Objects
- Constructor Functions
- `new`
- Prototype Chain
- `Object.prototype`
- `F.prototype`

---

### What are Native Prototypes?

JavaScript contains many built-in constructor functions.

Examples

```javascript
Object;

Array;

Function;

Date;

Map;

Set;

Promise;

RegExp;

Error;

Number;

String;

Boolean;
```

Every built-in constructor has its own prototype object.

Example

```javascript
Array.prototype;

Function.prototype;

Date.prototype;

Map.prototype;
```

These prototypes store methods shared by every object created from that constructor.

---

### Why Do Native Prototypes Exist?

Imagine one million arrays.

Without prototypes

```text
Array1

push()

pop()

map()

filter()

reduce()

...
```

```text
Array2

push()

pop()

map()

filter()

reduce()

...
```

Repeated one million times.

Huge memory waste.

---

Instead,

JavaScript stores every method once.

```text
Array.prototype

↓

push()

pop()

map()

filter()

reduce()
```

Every array shares these methods.

---

### Built-in Constructors

Suppose

```javascript
const arr = [1, 2, 3];
```

Most JavaScript engines optimize array literals internally, but conceptually it behaves similarly to:

```javascript
const arr = new Array(1, 2, 3);
```

Therefore

```text
arr

↓

Array.prototype
```

---

Visualization

```text
Array()

│

├── prototype

│

▼

Array.prototype
```

---

### Array Prototype

Example

```javascript
const arr = [1, 2, 3];

console.log(arr.push);
```

Output

```text
ƒ push()
```

Where was it found?

Search

```text
arr

↓

No push

↓

Array.prototype

↓

Found
```

---

Memory Diagram

```text
arr

│

▼

Array.prototype

│

├── push()

├── pop()

├── map()

├── filter()

├── reduce()

├── forEach()

│

▼

Object.prototype

│

▼

null
```

---

### Another Example

```javascript
const numbers = [1, 2, 3];

numbers.push(4);
```

Search

```text
numbers

↓

No push

↓

Array.prototype

↓

Found

↓

Execute
```

---

### Array Methods are Shared

```javascript
const a = [];

const b = [];

console.log(a.push === b.push);
```

Output

```text
true
```

Both arrays use the same function.

Memory

```text
a

↓

Array.prototype

↑

b
```

Only one

```javascript
push();
```

function exists.

---

### Function Prototype

Functions are objects too.

Example

```javascript
function greet() {}
```

Question

```text
Where do

call()

apply()

bind()

come from?
```

Answer

```javascript
Function.prototype;
```

---

Memory

```text
greet

│

▼

Function.prototype

│

├── call()

├── apply()

├── bind()

│

▼

Object.prototype

│

▼

null
```

---

Example

```javascript
function greet() {}

console.log(greet.call);
```

Output

```text
ƒ call()
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
```

---

### Date Prototype

```javascript
const today = new Date();
```

Memory

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
today.getFullYear();

today.getMonth();

today.getDate();

today.toISOString();
```

All come from

```javascript
Date.prototype;
```

---

### String Prototype

Strings are primitives.

```javascript
const str = "Hello";

console.log(str.toUpperCase());
```

Question

```text
Strings are primitive.

How can they have methods?
```

JavaScript temporarily creates a wrapper object.

Conceptually

```javascript
new String("Hello");
```

Memory

```text
Temporary String Object

↓

String.prototype

↓

Object.prototype
```

Then the wrapper disappears.

---

Methods

```javascript
toUpperCase();

toLowerCase();

trim();

slice();

replace();

includes();
```

come from

```javascript
String.prototype;
```

---

### Number Prototype

```javascript
const num = 10;

console.log(num.toFixed(2));
```

Again,

JavaScript temporarily creates

```javascript
Number Object

↓

Number.prototype
```

Methods

```javascript
toFixed();

toPrecision();

toString();
```

come from

```javascript
Number.prototype;
```

---

### Boolean Prototype

```javascript
const value = true;
```

Wrapper

```javascript
Boolean Object

↓

Boolean.prototype
```

---

### Complete Built-in Hierarchy

#### Object

```text
Object

↓

Object.prototype

↓

null
```

---

#### Array

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

#### Function

```text
Function Instance

↓

Function.prototype

↓

Object.prototype

↓

null
```

---

#### Date

```text
Date Instance

↓

Date.prototype

↓

Object.prototype

↓

null
```

---

#### Map

```text
Map Instance

↓

Map.prototype

↓

Object.prototype

↓

null
```

---

#### Set

```text
Set Instance

↓

Set.prototype

↓

Object.prototype

↓

null
```

---

#### RegExp

```text
RegExp Instance

↓

RegExp.prototype

↓

Object.prototype

↓

null
```

---

### Why Does an Array Have `toString()`?

Suppose

```javascript
const arr = [1, 2, 3];

arr.toString();
```

Search

```text
arr

↓

Array.prototype

↓

Found toString()

↓

Stop
```

Notice

Array has its own implementation.

It never reaches

```javascript
Object.prototype.toString();
```

---

### Method Overriding

Suppose

```javascript
Array.prototype.toString;
```

exists.

And

```javascript
Object.prototype.toString;
```

also exists.

Which one executes?

Search

```text
arr

↓

Array.prototype

↓

Found

↓

STOP
```

The nearest method always wins.

---

Visualization

```text
arr

↓

Array.prototype

↓

toString()

↓

STOP

↓

Object.prototype

(Not Reached)
```

---

### Verifying

```javascript
const arr = [];

console.log(Object.getPrototypeOf(arr) === Array.prototype);
```

Output

```text
true
```

---

Another

```javascript
function greet() {}

console.log(Object.getPrototypeOf(greet) === Function.prototype);
```

Output

```text
true
```

---

### Complete Prototype Tree

```text
                 Object.prototype
                        ▲
                        │
       ┌────────┬────────┬────────┬────────┐
       │        │        │        │
Array.prototype Function.prototype Date.prototype Map.prototype
       ▲        ▲        ▲        ▲
       │        │        │        │
    Arrays   Functions  Dates    Maps
```

Every prototype eventually reaches

```text
Object.prototype
```

---

### Common Misconceptions

#### Misconception 1

```text
Arrays store push()
```

Wrong.

Arrays inherit

```javascript
push();
```

from

```javascript
Array.prototype;
```

---

#### Misconception 2

Functions are not objects.

Wrong.

Functions are objects.

They simply have an additional ability:

```text
They can be called.
```

---

#### Misconception 3

Strings are objects.

Wrong.

Strings are primitives.

JavaScript temporarily creates wrapper objects when methods are accessed.

---

#### Misconception 4

Every built-in method belongs to

```javascript
Object.prototype;
```

Wrong.

Every constructor has its own prototype.

---

### Common Mistakes

#### Mistake 1

Thinking every array owns

```javascript
push();
```

It doesn't.

---

#### Mistake 2

Thinking

```javascript
call();
```

belongs to every object.

It belongs only to

```javascript
Function.prototype;
```

---

#### Mistake 3

Thinking primitives permanently become objects.

The wrapper objects are temporary.

They are created only for property or method access.

---

### Best Practices

- Understand where built-in methods come from instead of memorizing them.
- Remember that arrays, functions, dates, maps, and other built-in objects each have their own prototype.
- When debugging prototype chains, use `Object.getPrototypeOf()` rather than relying on `__proto__`.
- Be aware that method overriding follows the nearest-prototype rule.

---

### Interview Questions

#### Q1. Where is `Array.prototype.push()` stored?

**Answer**

It is stored once inside `Array.prototype` and shared by every array.

---

#### Q2. Why do all arrays share the same `push()` function?

**Answer**

Because each array's `[[Prototype]]` points to the same `Array.prototype` object, which contains a single shared `push()` method.

---

#### Q3. Where do `call()`, `apply()`, and `bind()` come from?

**Answer**

They are methods defined on `Function.prototype`.

---

#### Q4. Why can strings call methods like `toUpperCase()`?

**Answer**

Strings are primitives, but JavaScript temporarily creates a wrapper object linked to `String.prototype`, allowing access to string methods.

---

#### Q5. Why does an array use `Array.prototype.toString()` instead of `Object.prototype.toString()`?

**Answer**

JavaScript searches the prototype chain from nearest to farthest. Since `Array.prototype` defines its own `toString()`, the search stops there and never reaches `Object.prototype.toString()`.

---

### Key Takeaways

- Every built-in constructor has its own prototype object.
- Arrays inherit methods from `Array.prototype`.
- Functions inherit methods from `Function.prototype`.
- Dates inherit methods from `Date.prototype`.
- Maps, Sets, RegExp objects, and others each have their own prototype.
- Most built-in prototype chains eventually end at `Object.prototype`.
- Primitive values like strings, numbers, and booleans access methods through temporary wrapper objects.
- The nearest method in the prototype chain overrides methods with the same name higher in the chain.

---
