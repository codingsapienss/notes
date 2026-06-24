# Changing `F.prototype` & Object Creation Behavior

> One of the most frequently asked JavaScript interview topics is:
>
> **What happens if we change `F.prototype` after creating objects?**
>
> Many developers assume that changing `F.prototype` updates every existing object.
>
> **It does not.**
>
> This chapter explains exactly what happens internally using memory diagrams and answers the prototype questions commonly asked in interviews.

---

## Prerequisites

Before reading this chapter, you should understand:

- Constructor Functions
- `new`
- `F.prototype`
- `[[Prototype]]`
- Prototype Chain
- Property Lookup
- `constructor`

---

## The Golden Rule

Remember this forever.

```text
F.prototype

is used

ONLY

when

new F()

is executed.
```

After an object is created,

JavaScript never consults

```javascript
F.prototype;
```

again.

Instead,

the object follows its own

```text
[[Prototype]]
```

reference.

---

## Why is This Important?

Consider

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();
```

Question

```text
What happens if we later write

Rabbit.prototype = {};

?
```

Does

```text
rabbit
```

change?

Let's find out.

---

## Scenario 1 — Replacing `F.prototype`

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();

Rabbit.prototype = {};

console.log(rabbit.eats);
```

---

### Step 1

Initially

```text
Rabbit.prototype

↓

Object A

{

eats : true

}
```

---

### Step 2

Create object

```javascript
const rabbit = new Rabbit();
```

Memory

```text
rabbit

↓

[[Prototype]]

↓

Object A
```

---

### Step 3

Replace prototype

```javascript
Rabbit.prototype = {};
```

Memory

```text
Rabbit.prototype

↓

Object B

{

}
```

Notice

```text
rabbit

↓

still points to

↓

Object A
```

Nothing inside

```text
rabbit
```

changes.

---

### Memory Diagram

```text
Rabbit Function

│

├── prototype

│

▼

Object B

{ }






rabbit

│

▼

Object A

{

eats : true

}
```

Two completely different objects.

---

### Output

```javascript
console.log(rabbit.eats);
```

Output

```text
true
```

---

## Why?

Because

```text
rabbit

↓

[[Prototype]]

↓

Object A
```

Changing

```javascript
Rabbit.prototype;
```

does not modify

```text
rabbit.[[Prototype]]
```

---

## Rule

Replacing

```javascript
Constructor.prototype;
```

does **not** affect existing objects.

It only changes the prototype used by **future objects**.

---

## Scenario 2 — New Objects After Replacement

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit1 = new Rabbit();

Rabbit.prototype = {
  jumps: true,
};

const rabbit2 = new Rabbit();
```

---

Memory

```text
rabbit1

↓

Object A

{

eats : true

}



Rabbit.prototype

↓

Object B

{

jumps : true

}



rabbit2

↓

Object B
```

---

Outputs

```javascript
console.log(rabbit1.eats);
```

```text
true
```

---

```javascript
console.log(rabbit2.eats);
```

```text
undefined
```

---

```javascript
console.log(rabbit2.jumps);
```

```text
true
```

---

## Important Observation

Objects created before and after replacing the prototype can have **different prototype chains**.

---

## Scenario 3 — Modifying the Existing Prototype

Now consider

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();

Rabbit.prototype.eats = false;

console.log(rabbit.eats);
```

---

Did we replace the prototype?

No.

We modified the existing prototype object.

---

Memory Before

```text
rabbit

↓

Object A

{

eats : true

}
```

---

After

```javascript
Rabbit.prototype.eats = false;
```

Memory

```text
rabbit

↓

Object A

{

eats : false

}
```

The reference didn't change.

Only the object's contents changed.

---

Output

```text
false
```

---

## Rule

Modifying properties inside the prototype affects every object sharing that prototype.

---

## Scenario 4 — Deleting an Own Property

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  eats: false,
};

Object.setPrototypeOf(rabbit, animal);

delete rabbit.eats;

console.log(rabbit.eats);
```

---

Memory Before

```text
rabbit

{

eats : false

}

↓

animal

{

eats : true

}
```

---

After deletion

```text
rabbit

{

}

↓

animal

{

eats : true

}
```

Search

```text
rabbit

↓

No eats

↓

animal

↓

Found
```

---

Output

```text
true
```

---

## Rule

Deleting an own property exposes the inherited property again.

---

## Scenario 5 — Deleting Prototype Property

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();

delete Rabbit.prototype.eats;

console.log(rabbit.eats);
```

---

Search

```text
rabbit

↓

Prototype

↓

No eats

↓

Object.prototype

↓

No eats

↓

undefined
```

---

Output

```text
undefined
```

---

## Rule

Deleting a property from the prototype removes it for every object sharing that prototype.

---

## Replacing vs Modifying

This is one of the most important interview questions.

---

### Replacing

```javascript
Rabbit.prototype = {};
```

Result

```text
New Prototype Object

↓

Existing objects

UNCHANGED
```

---

### Modifying

```javascript
Rabbit.prototype.eats = false;
```

Result

```text
Same Prototype Object

↓

Every object sees update
```

---

## Complete Comparison

| Operation                       | Existing Objects        | Future Objects    |
| ------------------------------- | ----------------------- | ----------------- |
| `Rabbit.prototype = {}`         | Unchanged               | Use new prototype |
| `Rabbit.prototype.eats = false` | Updated                 | Updated           |
| `delete rabbit.eats`            | Falls back to prototype | No effect         |
| `delete Rabbit.prototype.eats`  | Property removed        | Property removed  |

---

## Visual Summary

Replacing

```text
Before

rabbit

↓

Object A



After

Rabbit.prototype

↓

Object B



rabbit

↓

Object A
```

---

Modifying

```text
Rabbit.prototype

↓

Object A

↓

Property Changed

↓

rabbit sees change
```

---

Deleting Own Property

```text
rabbit

↓

No Property

↓

Prototype

↓

Found
```

---

Deleting Prototype Property

```text
rabbit

↓

Prototype

↓

No Property

↓

undefined
```

---

## How JavaScript Thinks

When

```javascript
new Rabbit();
```

runs,

JavaScript performs

```text
Create Object

↓

Set

[[Prototype]]

↓

Current Rabbit.prototype

↓

Done
```

After that,

the object no longer depends on

```javascript
Rabbit.prototype;
```

It follows its own

```text
[[Prototype]]
```

reference forever (unless changed explicitly).

---

## Common Mistakes

### Mistake 1

Thinking

```javascript
Rabbit.prototype = {};
```

updates existing objects.

Wrong.

It only changes what future objects will inherit from.

---

### Mistake 2

Thinking

```javascript
Rabbit.prototype.eats = false;
```

creates a new prototype.

Wrong.

It changes the existing shared prototype object.

---

### Mistake 3

Confusing

```javascript
Rabbit.prototype = {};
```

with

```javascript
Rabbit.prototype.x = ...
```

One replaces the object.

The other modifies it.

---

### Mistake 4

Thinking objects "watch" their constructor's prototype.

Wrong.

Objects only remember their own

```text
[[Prototype]]
```

They do not continuously reference

```javascript
Constructor.prototype;
```

---

## Best Practices

- Avoid replacing a constructor's prototype after instances have already been created.
- Prefer adding or modifying methods on the existing prototype.
- Be aware that replacing the prototype can also remove the default `constructor` property unless you restore it.
- Use prototype replacement intentionally, understanding that it affects only future instances.

---

## Interview Questions

### Q1. When is `F.prototype` used?

**Answer**

Only during the execution of `new F()`, when JavaScript assigns the new object's `[[Prototype]]`.

---

### Q2. What happens if `F.prototype` is replaced after objects are created?

**Answer**

Existing objects continue using their original prototype. Only future objects created with `new F()` use the new prototype.

---

### Q3. What happens if you modify a property on the existing prototype?

**Answer**

All objects sharing that prototype immediately observe the updated property because they reference the same prototype object.

---

### Q4. Why does deleting an object's own property expose the prototype property?

**Answer**

Once the own property is removed, JavaScript resumes its normal prototype-chain lookup and finds the inherited property.

---

### Q5. Why is replacing a prototype different from modifying it?

**Answer**

Replacing creates a brand-new prototype object. Modifying changes the existing prototype object. Existing instances keep references to the original object.

---

## Key Takeaways

- `F.prototype` is used only during object creation with `new`.
- Objects store a reference to their own `[[Prototype]]`; they do not continuously consult `F.prototype`.
- Replacing `F.prototype` affects only future instances.
- Modifying the existing prototype affects every instance sharing it.
- Deleting an own property causes JavaScript to continue searching the prototype chain.
- Deleting a prototype property removes it for all objects that inherit from that prototype.
- Understanding the distinction between **replacing** and **modifying** a prototype is essential for mastering JavaScript inheritance.

---
