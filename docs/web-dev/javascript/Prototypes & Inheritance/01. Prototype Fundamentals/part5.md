# Enumerating Properties in the Prototype Chain

> One of the most confusing behaviors in JavaScript is that some loops iterate over **inherited properties**, while others only iterate over an object's **own properties**.
>
> Understanding how property enumeration works is important for writing correct JavaScript code and is a common interview topic.

---

### Prerequisites

Before reading this chapter, you should understand:

- Objects
- Prototype Chain
- Property Lookup
- `[[Prototype]]`
- Property Shadowing

---

### Why Should We Learn This?

Consider the following code.

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  jumps: true,
};

Object.setPrototypeOf(rabbit, animal);

for (let key in rabbit) {
  console.log(key);
}
```

Output

```text
jumps
eats
```

Question

```text
Why is "eats" printed?

It doesn't belong to rabbit.
```

This happens because JavaScript's property enumeration rules are different for different methods.

---

### Own Properties vs Inherited Properties

Before learning enumeration, we must understand two kinds of properties.

---

#### Own Properties

These are properties stored directly inside the object.

Example

```javascript
const rabbit = {
  name: "White Rabbit",
  jumps: true,
};
```

Own properties

```text
name

jumps
```

---

#### Inherited Properties

Properties that come from the prototype.

Example

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  jumps: true,
};

Object.setPrototypeOf(rabbit, animal);
```

Own Property

```text
jumps
```

Inherited Property

```text
eats
```

---

### Visual Representation

```text
rabbit
│
├── jumps : true
│
▼
animal
│
├── eats : true
│
▼
Object.prototype
│
▼
null
```

---

### Property Enumeration

Enumeration simply means

```text
Listing

or

Iterating over

properties
```

JavaScript provides multiple ways to enumerate properties.

Each behaves differently.

---

### 1. for...in Loop

The

```javascript
for...in
```

loop iterates over

- Own enumerable properties
- Inherited enumerable properties

---

Example

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  jumps: true,
};

Object.setPrototypeOf(rabbit, animal);

for (const key in rabbit) {
  console.log(key);
}
```

Output

```text
jumps

eats
```

Notice

```text
eats
```

comes from the prototype.

---

### Search Process

```text
rabbit

↓

Own Properties

↓

Prototype Properties

↓

Print All Enumerable Properties
```

---

### 2. Object.keys()

Unlike

```javascript
for...in
```

this method returns

```text
Only Own Properties
```

Example

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  jumps: true,
};

Object.setPrototypeOf(rabbit, animal);

console.log(Object.keys(rabbit));
```

Output

```text
["jumps"]
```

Notice

```text
eats
```

is missing.

---

### 3. Object.values()

Returns

```text
Only Own Values
```

Example

```javascript
console.log(Object.values(rabbit));
```

Output

```text
[true]
```

---

### 4. Object.entries()

Returns

```text
Own

Key-Value

Pairs
```

Example

```javascript
console.log(Object.entries(rabbit));
```

Output

```text
[
    ["jumps", true]
]
```

---

### Comparison

| Method             | Own Properties | Inherited Properties |
| ------------------ | -------------- | -------------------- |
| `for...in`         | ✅             | ✅                   |
| `Object.keys()`    | ✅             | ❌                   |
| `Object.values()`  | ✅             | ❌                   |
| `Object.entries()` | ✅             | ❌                   |

---

### Why Does `for...in` Include Prototype Properties?

Historically,

JavaScript was designed to support

```text
Prototype Inheritance
```

naturally.

Therefore,

`for...in`

was designed to walk through the entire prototype chain.

---

Visualization

```text
rabbit

↓

animal

↓

Object.prototype

↓

null
```

Every enumerable property is visited.

---

### Enumerable Properties

Not every property can be enumerated.

JavaScript has an internal property attribute called

```text
[[Enumerable]]
```

If

```text
Enumerable = true
```

the property appears in

```javascript
for...in
```

If

```text
Enumerable = false
```

it is skipped.

---

Example

Most built-in methods

```javascript
toString();

valueOf();

hasOwnProperty();
```

exist on

```javascript
Object.prototype;
```

but they do **not** appear in

```javascript
for...in
```

because they are

```text
Non-Enumerable
```

---

### Checking Own Properties

Sometimes

we only want the object's own properties.

Use

```javascript
Object.hasOwn();
```

(Modern)

or

```javascript
hasOwnProperty();
```

---

Example

```javascript
for (const key in rabbit) {
  if (rabbit.hasOwnProperty(key)) {
    console.log(key);
  }
}
```

Output

```text
jumps
```

Now

```text
eats
```

is ignored.

---

### Modern Alternative

ES2022 introduced

```javascript
Object.hasOwn();
```

Example

```javascript
for (const key in rabbit) {
  if (Object.hasOwn(rabbit, key)) {
    console.log(key);
  }
}
```

Output

```text
jumps
```

Unlike `hasOwnProperty()`, this works even if an object overrides or lacks that method.

---

### Why Prefer `Object.hasOwn()`?

Consider

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

does not exist.

But

```javascript
Object.hasOwn(obj, key);
```

still works.

---

### Enumerating Arrays

Example

```javascript
const arr = [10, 20, 30];

for (const key in arr) {
  console.log(key);
}
```

Output

```text
0

1

2
```

Notice

```text
Indices

not

Values
```

---

Better

```javascript
for (const value of arr) {
  console.log(value);
}
```

Output

```text
10

20

30
```

Generally,

avoid using

```javascript
for...in
```

for arrays.

---

### Complete Comparison

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  jumps: true,
};

Object.setPrototypeOf(rabbit, animal);
```

---

Using

```javascript
for...in
```

Output

```text
jumps

eats
```

---

Using

```javascript
Object.keys();
```

Output

```text
["jumps"]
```

---

Using

```javascript
Object.values();
```

Output

```text
[true]
```

---

Using

```javascript
Object.entries();
```

Output

```text
[
    ["jumps", true]
]
```

---

### Common Mistakes

#### Mistake 1

Thinking

```javascript
for...in
```

only loops over own properties.

Wrong.

It also loops over inherited enumerable properties.

---

#### Mistake 2

Using

```javascript
for...in
```

for arrays.

Use

```javascript
for...of
```

instead.

---

#### Mistake 3

Forgetting to filter inherited properties.

Always check

```javascript
Object.hasOwn();

or;

hasOwnProperty();
```

when using

```javascript
for...in
```

if only own properties are required.

---

### Best Practices

✅ Use

```javascript
Object.keys();
```

when you need only own keys.

---

✅ Use

```javascript
Object.entries();
```

when both keys and values are needed.

---

✅ Use

```javascript
Object.hasOwn();
```

to filter own properties.

---

❌ Avoid

```javascript
for...in
```

for arrays.

---

### Interview Questions

#### Q1. What is the difference between `for...in` and `Object.keys()`?

**Answer**

`for...in` iterates over both own and inherited enumerable properties, whereas `Object.keys()` returns only an object's own enumerable property names.

---

#### Q2. Why doesn't `Object.keys()` return prototype properties?

**Answer**

Because it is designed to return only the object's own enumerable properties, ignoring the prototype chain.

---

#### Q3. Why don't methods like `toString()` appear in `for...in`?

**Answer**

Because they are **non-enumerable** properties on `Object.prototype`.

---

#### Q4. Why is `Object.hasOwn()` preferred over `hasOwnProperty()`?

**Answer**

`Object.hasOwn()` works even for objects without `Object.prototype` and cannot be affected if `hasOwnProperty` is overridden.

---

#### Q5. Should `for...in` be used with arrays?

**Answer**

Generally, no. Use `for...of` or array iteration methods (`forEach`, `map`, etc.) because `for...in` iterates over property names and may include inherited enumerable properties.

---

### Key Takeaways

- Properties are classified as **own** or **inherited**.
- `for...in` iterates over both own and inherited **enumerable** properties.
- `Object.keys()`, `Object.values()`, and `Object.entries()` return only an object's own enumerable properties.
- Built-in methods such as `toString()` are non-enumerable, so they do not appear in `for...in`.
- Use `Object.hasOwn()` (or `hasOwnProperty()`) to distinguish own properties from inherited ones.
- Avoid using `for...in` for arrays; prefer `for...of` or array iteration methods.

---
