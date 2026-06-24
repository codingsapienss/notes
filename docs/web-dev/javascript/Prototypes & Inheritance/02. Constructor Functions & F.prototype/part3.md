# The Default `prototype` Object & the `constructor` Property

> In the previous chapter, we learned that every constructor function has a special property called:
>
> ```javascript
> F.prototype;
> ```
>
> But JavaScript does something even more interesting.
>
> Even if **you never create a prototype yourself**, JavaScript automatically creates one for every constructor function.
>
> That automatically created prototype contains a very important property:
>
> ```javascript
> constructor;
> ```
>
> This chapter explains:
>
> - Why every function automatically gets a prototype
> - What the `constructor` property is
> - Why it exists
> - How it is inherited
> - How it can accidentally disappear
> - How to restore it correctly
> - When it is useful in real-world programming

---

## Prerequisites

Before reading this chapter, you should understand:

- Constructor Functions
- `new`
- Prototype Chain
- `F.prototype`
- `[[Prototype]]`

---

## Why Does JavaScript Create a Default Prototype?

Suppose we write

```javascript
function Rabbit() {}
```

We never created

```javascript
Rabbit.prototype;
```

Yet

```javascript
console.log(Rabbit.prototype);
```

prints

```javascript
{
  constructor: Rabbit;
}
```

Question

```text
Who created this object?
```

Answer

```text
JavaScript Engine
```

Whenever a normal constructor function is created,

JavaScript automatically creates a prototype object for it.

---

## Default Prototype

Internally,

JavaScript behaves approximately like this:

```javascript
function Rabbit() {}

// JavaScript automatically creates

Rabbit.prototype = {
  constructor: Rabbit,
};
```

You never wrote this code,

but JavaScript behaves as if it did.

---

## Memory Diagram

```text
          Rabbit Function

                 │

        prototype property

                 │

                 ▼

        Prototype Object

        ┌──────────────────────┐

        │ constructor : Rabbit │

        └──────────────────────┘
```

Every constructor function starts with this object.

---

## What is the `constructor` Property?

The

```javascript
constructor;
```

property simply points back to the function that created the prototype.

Example

```javascript
function Rabbit() {}

console.log(Rabbit.prototype.constructor);
```

Output

```javascript
[Function: Rabbit]
```

---

Visualization

```text
Rabbit Function

│

├── prototype

│

▼

Prototype Object

│

└── constructor

      │

      ▼

Rabbit Function
```

Notice

```text
constructor

↓

points back

↓

Rabbit
```

---

## Why Does JavaScript Need It?

Imagine creating an object

```javascript
const rabbit = new Rabbit();
```

Memory

```text
rabbit

↓

[[Prototype]]

↓

Rabbit.prototype

↓

constructor

↓

Rabbit
```

Even though

```javascript
rabbit;
```

doesn't directly store

```javascript
Rabbit;
```

it can still access it through the prototype chain.

---

## Example

```javascript
function Rabbit() {}

const rabbit = new Rabbit();

console.log(rabbit.constructor);
```

Output

```javascript
[Function: Rabbit]
```

---

Question

```text
Where did constructor come from?
```

Search

```text
rabbit

↓

No constructor

↓

Rabbit.prototype

↓

Found constructor
```

---

## Property Lookup

Memory

```text
rabbit

│

▼

Rabbit.prototype

│

├── constructor

│

▼

Rabbit Function
```

Lookup

```javascript
rabbit.constructor;
```

JavaScript performs

```text
rabbit

↓

Not Found

↓

Rabbit.prototype

↓

Found

↓

Return Rabbit
```

---

## Verifying the Constructor

```javascript
function Rabbit() {}

const rabbit = new Rabbit();

console.log(rabbit.constructor === Rabbit);
```

Output

```text
true
```

---

Another Example

```javascript
function User() {}

const user = new User();

console.log(user.constructor === User);
```

Output

```text
true
```

---

## Creating Objects Using `constructor`

One useful feature of the

```javascript
constructor;
```

property is that we can create another object of the same type.

Example

```javascript
function Rabbit(name) {
  this.name = name;
}

const rabbit1 = new Rabbit("White");

const rabbit2 = new rabbit1.constructor("Black");

console.log(rabbit2.name);
```

Output

```text
Black
```

---

Why does this work?

Because

```text
rabbit1

↓

Rabbit.prototype

↓

constructor

↓

Rabbit
```

So

```javascript
rabbit1.constructor;
```

is actually

```javascript
Rabbit;
```

---

Visualization

```text
rabbit1

↓

Rabbit.prototype

↓

constructor

↓

Rabbit()

↓

new Rabbit(...)
```

---

## Real-World Use Case

Suppose

you receive an object from a third-party library.

```javascript
const obj = getObjectFromLibrary();
```

You don't know

```text
Which constructor
created it.
```

Instead of writing

```javascript
new Rabbit();
```

you can write

```javascript
new obj.constructor();
```

to create another object of the same type.

---

## Important Warning

JavaScript does **not** guarantee that

```javascript
constructor;
```

will always be correct.

It works only because of the default prototype.

---

## Losing the `constructor`

Consider

```javascript
function Rabbit() {}

Rabbit.prototype = {
  jumps: true,
};

const rabbit = new Rabbit();

console.log(rabbit.constructor === Rabbit);
```

Output

```text
false
```

---

Why?

Because we replaced

```javascript
Rabbit.prototype;
```

with a completely new object.

Original prototype

```text
{

    constructor: Rabbit
}
```

New prototype

```text
{

    jumps: true
}
```

Notice

```text
constructor

is gone.
```

---

Memory Before

```text
Rabbit.prototype

↓

{

constructor : Rabbit

}
```

---

Memory After

```javascript
Rabbit.prototype = {
  jumps: true,
};
```

```text
Rabbit.prototype

↓

{

jumps : true

}
```

The

```text
constructor
```

property disappeared.

---

## Verifying

```javascript
function Rabbit() {}

Rabbit.prototype = {
  jumps: true,
};

const rabbit = new Rabbit();

console.log(rabbit.constructor);
```

Output

```javascript
[Function: Object]
```

Why?

Search

```text
rabbit

↓

Rabbit.prototype

↓

No constructor

↓

Object.prototype

↓

constructor

↓

Object
```

JavaScript continues searching up the prototype chain until it reaches `Object.prototype`, which still has its own `constructor` property.

---

## How to Preserve `constructor`

Instead of replacing the entire prototype,

modify it.

Example

```javascript
function Rabbit() {}

Rabbit.prototype.jumps = true;
```

Now

```text
Original Prototype

+

constructor

still exists.
```

Memory

```text
{

constructor : Rabbit,

jumps : true

}
```

---

## Alternative Solution

If you replace the prototype,

add

```javascript
constructor;
```

back manually.

Example

```javascript
function Rabbit() {}

Rabbit.prototype = {
  constructor: Rabbit,

  jumps: true,
};
```

Now

```javascript
const rabbit = new Rabbit();

console.log(rabbit.constructor === Rabbit);
```

Output

```text
true
```

---

## Two Ways to Add Methods

### Method 1 (Recommended)

```javascript
Rabbit.prototype.jump = function () {};
```

Result

```text
constructor

preserved
```

---

### Method 2

```javascript
Rabbit.prototype = {
  jump() {},
};
```

Result

```text
constructor

lost
```

Unless you add it manually.

---

## Comparison

| Technique                                 | `constructor` Preserved? |
| ----------------------------------------- | ------------------------ |
| Add property to existing prototype        | ✅ Yes                   |
| Replace prototype completely              | ❌ No                    |
| Replace prototype and restore constructor | ✅ Yes                   |

---

## Common Mistakes

### Mistake 1

Thinking

```javascript
constructor;
```

is a keyword.

Wrong.

It is simply a property.

---

### Mistake 2

Replacing

```javascript
prototype;
```

without restoring

```javascript
constructor;
```

This breaks code relying on

```javascript
obj.constructor;
```

---

### Mistake 3

Thinking JavaScript automatically fixes

```javascript
constructor;
```

It doesn't.

If you replace the prototype,

you're responsible for restoring it.

---

## Best Practices

- Prefer extending the existing prototype instead of replacing it.
- If replacing the prototype is necessary, explicitly restore the `constructor` property.
- Don't rely exclusively on `obj.constructor` for application logic, because it can be changed or lost.

---

## Interview Questions

### Q1. Why does every constructor function have a default prototype?

**Answer**

JavaScript automatically creates a prototype object so that objects created with `new` have a shared prototype and a `constructor` reference.

---

### Q2. What is the purpose of the `constructor` property?

**Answer**

It points back to the constructor function that created the prototype object, allowing instances to access their constructor through the prototype chain.

---

### Q3. Why does `rabbit.constructor === Rabbit` return `true`?

**Answer**

Because `rabbit` inherits the `constructor` property from `Rabbit.prototype`, and that property points to the `Rabbit` function.

---

### Q4. When can the `constructor` property be lost?

**Answer**

When the entire prototype object is replaced with a new object that does not define its own `constructor` property.

---

### Q5. How do you preserve the `constructor` property?

**Answer**

Either:

- Add properties to the existing prototype instead of replacing it, or
- Restore `constructor` manually after replacing the prototype.

---

## Key Takeaways

- Every normal constructor function automatically receives a default `prototype` object.
- That default prototype contains a `constructor` property pointing back to the constructor function.
- Instances access `constructor` through the prototype chain.
- `obj.constructor` can be useful for creating another object of the same type.
- Replacing the entire prototype removes the default `constructor` property.
- Adding methods to the existing prototype preserves `constructor`.
- If you replace the prototype, restore `constructor` manually if you need it.

---
