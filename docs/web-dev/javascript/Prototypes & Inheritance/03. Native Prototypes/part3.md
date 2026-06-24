# Primitive Wrapper Objects (Autoboxing)

> One of the strangest things in JavaScript is that primitive values like strings and numbers can call methods.
>
> ```javascript
> const str = "Hello";
>
> console.log(str.toUpperCase());
> ```
>
> But wait...
>
> ```text
> Strings are primitives.
>
> Primitives cannot have methods.
> ```
>
> So how does this work?
>
> The answer is:
>
> **Primitive Wrapper Objects**, also known as **Autoboxing**.
>
> This chapter explains everything happening internally.

---

## Prerequisites

Before reading this chapter, you should understand:

- Objects
- Prototype Chain
- Native Prototypes
- `Object.prototype`
- `String.prototype`
- `Number.prototype`

---

## The Problem

Consider

```javascript
const str = "Hello";

console.log(str.toUpperCase());
```

Output

```text
HELLO
```

Question

```text
Where did

toUpperCase()

come from?
```

Strings are primitive values.

Primitive values do not store methods.

So how is JavaScript executing

```javascript
toUpperCase();
```

---

## First Important Fact

There are two completely different things.

Primitive

```javascript
"Hello";
```

Object

```javascript
new String("Hello");
```

They are **not** the same.

---

## Primitive

```javascript
const str = "Hello";
```

Type

```javascript
typeof str;
```

Output

```text
string
```

Primitive.

---

## Object

```javascript
const str = new String("Hello");
```

Type

```javascript
typeof str;
```

Output

```text
object
```

This is an object.

---

## Comparison

```javascript
const a = "Hello";

const b = new String("Hello");

console.log(typeof a);

console.log(typeof b);
```

Output

```text
string

object
```

---

## So How Does a Primitive Call Methods?

Suppose

```javascript
const str = "Hello";

str.toUpperCase();
```

Internally,

JavaScript performs approximately this sequence.

---

### Step 1

Primitive exists

```text
"Hello"
```

---

### Step 2

JavaScript creates a temporary wrapper object.

Conceptually

```javascript
new String("Hello");
```

Memory

```text
Temporary String Object

↓

String.prototype
```

---

### Step 3

Search

```text
Temporary Object

↓

No toUpperCase()

↓

String.prototype

↓

Found
```

---

### Step 4

Execute

```javascript
toUpperCase();
```

---

### Step 5

Destroy the temporary object.

Only the primitive remains.

---

## Complete Internal Flow

```javascript
"Hello".toUpperCase();
```

Conceptually

```text
Primitive

↓

Temporary String Object Created

↓

Search

↓

String.prototype

↓

Execute Method

↓

Destroy Temporary Object

↓

Return Result
```

---

## Visualization

```text
Primitive

"Hello"

        │

        ▼

Temporary Wrapper

String Object

        │

        ▼

String.prototype

        │

        ▼

toUpperCase()

        │

        ▼

Wrapper Destroyed
```

Notice

The wrapper object exists only during the operation.

---

## This Process Has a Name

This automatic conversion is called

```text
Autoboxing
```

Sometimes also called

```text
Automatic Boxing
```

JavaScript automatically wraps primitive values inside temporary objects whenever methods or properties are accessed.

---

## String Wrapper

Methods stored inside

```javascript
String.prototype;
```

Examples

```javascript
toUpperCase();

toLowerCase();

trim();

slice();

substring();

replace();

includes();

startsWith();

endsWith();
```

Example

```javascript
const str = "javascript";

console.log(str.includes("script"));
```

Search

```text
Primitive

↓

Temporary Wrapper

↓

String.prototype

↓

includes()

↓

Execute
```

---

## Number Wrapper

Numbers are also primitives.

```javascript
const num = 12.345;

console.log(num.toFixed(2));
```

Output

```text
12.35
```

Internally

```text
12.345

↓

Temporary Number Object

↓

Number.prototype

↓

toFixed()

↓

Destroy Wrapper
```

---

Methods

```javascript
toFixed();

toPrecision();

toExponential();

toString();

valueOf();
```

come from

```javascript
Number.prototype;
```

---

## Boolean Wrapper

Example

```javascript
const value = true;

console.log(value.valueOf());
```

Internally

```text
true

↓

Temporary Boolean Object

↓

Boolean.prototype

↓

valueOf()

↓

Destroy Wrapper
```

---

## BigInt Wrapper

Example

```javascript
const num = 123n;

console.log(num.toString());
```

Internally

```text
123n

↓

Temporary BigInt Object

↓

BigInt.prototype

↓

toString()
```

---

## Symbol Wrapper

Example

```javascript
const id = Symbol("user");

console.log(id.toString());
```

Internally

```text
Symbol

↓

Temporary Symbol Object

↓

Symbol.prototype

↓

toString()
```

---

## Complete Primitive Table

| Primitive | Temporary Wrapper | Prototype           |
| --------- | ----------------- | ------------------- |
| String    | String Object     | `String.prototype`  |
| Number    | Number Object     | `Number.prototype`  |
| Boolean   | Boolean Object    | `Boolean.prototype` |
| BigInt    | BigInt Object     | `BigInt.prototype`  |
| Symbol    | Symbol Object     | `Symbol.prototype`  |

---

## Why Doesn't JavaScript Permanently Convert Them?

Imagine

```javascript
const str = "Hello";
```

If JavaScript permanently converted it

```text
Primitive

↓

Object
```

then

```javascript
typeof str;
```

would become

```text
object
```

Instead,

Output

```text
string
```

The wrapper exists only temporarily.

---

## Temporary Means Temporary

Example

```javascript
const str = "Hello";

str.language = "English";

console.log(str.language);
```

Output

```text
undefined
```

---

Why?

Internally

```text
Temporary Wrapper

↓

language = English

↓

Wrapper Destroyed

↓

Primitive Remains
```

The property disappears with the wrapper.

---

Visualization

```text
Primitive

↓

Temporary Wrapper

↓

Add Property

↓

Destroy Wrapper

↓

Property Lost
```

---

## Reading Works

Example

```javascript
const str = "Hello";

console.log(str.length);
```

Output

```text
5
```

Why?

Because

```text
Wrapper Created

↓

Read Property

↓

Return Value

↓

Destroy Wrapper
```

Nothing needs to persist.

---

## Writing Doesn't Work

Example

```javascript
const str = "Hello";

str.color = "red";

console.log(str.color);
```

Output

```text
undefined
```

Because

```text
Wrapper Destroyed
```

after assignment.

---

## Why Are Wrapper Objects Needed?

Without wrappers,

this would fail

```javascript
"Hello".toUpperCase();

(123.45).toFixed(2);

true.toString();
```

JavaScript would have no way to provide methods on primitive values.

Wrapper objects solve this problem while keeping primitives lightweight.

---

## The Exceptions

Two primitive values are special.

```javascript
null;

undefined;
```

They have

- No wrapper object
- No prototype
- No methods

---

Example

```javascript
null.toString();
```

Output

```text
TypeError
```

---

Example

```javascript
undefined.toString();
```

Output

```text
TypeError
```

---

Why?

There is no

```text
Null.prototype
```

or

```text
Undefined.prototype
```

---

## Prototype Chains

### String

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

---

### Number

```text
Primitive Number

↓

Temporary Number Object

↓

Number.prototype

↓

Object.prototype

↓

null
```

---

### Boolean

```text
Primitive Boolean

↓

Temporary Boolean Object

↓

Boolean.prototype

↓

Object.prototype

↓

null
```

---

## Common Misconceptions

### Misconception 1

Strings are objects.

Wrong.

Strings are primitives.

Only temporary wrapper objects are created.

---

### Misconception 2

Wrapper objects remain in memory.

Wrong.

They are destroyed immediately after the operation completes.

---

### Misconception 3

Properties added to primitives remain.

Wrong.

They disappear because the wrapper object is temporary.

---

## Common Mistakes

### Mistake 1

Using

```javascript
new String();
```

instead of string literals.

Avoid

```javascript
new String("Hello");
```

Prefer

```javascript
"Hello";
```

---

### Mistake 2

Expecting custom properties to remain.

```javascript
const str = "abc";

str.test = 100;

console.log(str.test);
```

Output

```text
undefined
```

---

### Mistake 3

Thinking

```javascript
typeof new String("abc");
```

is

```text
string
```

It is

```text
object
```

---

## Why Avoid Wrapper Constructors?

Consider

```javascript
const a = "Hello";

const b = new String("Hello");
```

Comparison

```javascript
console.log(a == b);
```

Output

```text
true
```

Because loose equality performs type conversion.

---

Strict comparison

```javascript
console.log(a === b);
```

Output

```text
false
```

Because

```text
Primitive

≠

Object
```

Using wrapper constructors can therefore produce confusing behavior.

---

## Best Practices

- Prefer primitive values (`"text"`, `123`, `true`) over wrapper constructors (`new String()`, `new Number()`, `new Boolean()`).
- Remember that wrapper objects are temporary and should not be relied upon to store state.
- Never assign custom properties to primitives expecting them to persist.
- Understand autoboxing to explain why primitives can access methods.

---

## Interview Questions

### Q1. How can primitive strings call methods?

**Answer**

JavaScript temporarily creates a `String` wrapper object, looks up the method on `String.prototype`, executes it, and then discards the wrapper.

---

### Q2. What is autoboxing?

**Answer**

Autoboxing is JavaScript's automatic creation of temporary wrapper objects around primitive values when methods or properties are accessed.

---

### Q3. Why doesn't assigning properties to primitives work?

**Answer**

Because the property is assigned to a temporary wrapper object, which is destroyed immediately after the operation.

---

### Q4. Why do `null` and `undefined` throw errors when accessing methods?

**Answer**

They have no wrapper objects and no associated prototypes, so JavaScript cannot perform property lookup.

---

### Q5. Why is `new String("abc")` discouraged?

**Answer**

It creates an object instead of a primitive, leading to unexpected behavior with `typeof`, equality comparisons, and performance. Primitive string literals are almost always the correct choice.

---

## Key Takeaways

- Strings, numbers, booleans, bigints, and symbols are **primitive values**, not objects.
- JavaScript uses **autoboxing** to temporarily wrap primitives in objects when methods or properties are accessed.
- Wrapper objects inherit from their respective prototypes (`String.prototype`, `Number.prototype`, etc.).
- Temporary wrapper objects are destroyed immediately after the operation completes.
- Properties assigned to primitives do not persist because they are added to temporary wrapper objects.
- `null` and `undefined` are exceptions—they have no wrapper objects and no prototypes.
- Prefer primitive literals over wrapper constructors like `new String()` or `new Number()`.

---
