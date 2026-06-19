# Constructor Functions & the `new` Operator

> Before understanding `F.prototype`, we must first understand **constructor functions** and **how the `new` operator actually works**.
>
> Most developers know how to write:
>
> ```javascript
> const user = new User();
> ```
>
> But very few know **what JavaScript actually does internally** when `new` is executed.
>
> This chapter explains everything from first principles.

---

# Prerequisites

Before reading this chapter, you should understand:

- Objects
- Functions
- `this`
- Prototype Chain
- `[[Prototype]]`

---

# Why Do Constructor Functions Exist?

Imagine we want to create 100 users.

Without constructor functions

```javascript
const user1 = {
  name: "John",
  age: 25,
};

const user2 = {
  name: "Alice",
  age: 30,
};

const user3 = {
  name: "Bob",
  age: 40,
};
```

Immediately we notice

- Duplicate code
- Difficult to maintain
- Hard to scale

---

A better solution is

```javascript
Create a blueprint

↓

Create objects from it
```

That blueprint is called a

```text
Constructor Function
```

---

# What is a Constructor Function?

A constructor function is simply a **normal JavaScript function** that is intended to create and initialize objects.

Example

```javascript
function User(name, age) {
  this.name = name;

  this.age = age;
}
```

Notice

Nothing special happened.

It is still an ordinary function.

The only difference is

```text
We call it using

new
```

---

# Why is it Called a Constructor?

Because it

```text
Constructs

↓

Creates

↓

Initializes

↓

Returns

a new object
```

---

# Naming Convention

By convention,

constructor functions start with

```text
Capital Letter
```

Example

```javascript
function User() {}

function Rabbit() {}

function Animal() {}
```

Not

```javascript
function user() {}
```

Although JavaScript allows it,

the capital letter tells developers

```text
This function should be called with

new
```

---

# Creating Objects

Constructor

```javascript
function User(name, age) {
  this.name = name;

  this.age = age;
}
```

Creating objects

```javascript
const user1 = new User("John", 25);

const user2 = new User("Alice", 30);

const user3 = new User("Bob", 22);
```

Output

```javascript
console.log(user1);
```

```text
{
    name: "John",
    age: 25
}
```

---

# Without Constructor

```javascript
const john = {
  name: "John",
  age: 25,
};

const alice = {
  name: "Alice",
  age: 30,
};

const bob = {
  name: "Bob",
  age: 22,
};
```

---

# With Constructor

```javascript
const john = new User("John", 25);

const alice = new User("Alice", 30);

const bob = new User("Bob", 22);
```

Cleaner

Reusable

Scalable

---

# What Happens When We Use `new`?

This is the most important part.

Suppose

```javascript
const rabbit = new Rabbit();
```

JavaScript does **not** simply call

```javascript
Rabbit();
```

Instead,

the `new` operator performs several internal steps automatically.

---

# Internal Steps of `new`

When JavaScript executes

```javascript
new Constructor();
```

it performs

```text
Step 1

Create a new empty object

↓

Step 2

Set the object's [[Prototype]]

↓

Step 3

Call the constructor

↓

Step 4

Return the object
```

Let's study each step.

---

# Step 1 — Create an Empty Object

Suppose

```javascript
new User();
```

JavaScript first creates

```javascript
{
}
```

Memory

```text
Empty Object

{}
```

At this point

```text
No properties

No methods

Nothing
```

---

# Step 2 — Set the Prototype

JavaScript automatically performs

```text
newObject.[[Prototype]]

↓

Constructor.prototype
```

Visualization

```text
User.prototype

▲

│

[[Prototype]]

│

New Object
```

This step is the reason prototypes work.

We'll study it deeply in Part 2B.

---

# Step 3 — Call the Constructor

Now JavaScript calls

```javascript
User.call(newObject, ...arguments);
```

Notice

Inside the constructor

```javascript
this;
```

becomes

```text
newObject
```

Example

```javascript
function User(name) {
  this.name = name;
}
```

Internally

```javascript
this.name = "John";
```

actually becomes

```javascript
newObject.name = "John";
```

---

Visualization

```text
newObject

↓

this

↓

Properties Added
```

---

# Step 4 — Return the Object

Finally

JavaScript returns

```text
newObject
```

which becomes

```javascript
user;
```

---

# Complete Internal Flow

Suppose

```javascript
const user = new User("John", 25);
```

JavaScript internally performs

```javascript
// Step 1

const obj = {};

// Step 2

Object.setPrototypeOf(obj, User.prototype);

// Step 3

User.call(obj, "John", 25);

// Step 4

return obj;
```

This is conceptually what happens.

The actual engine implementation is more optimized, but the observable behavior matches these steps.

---

# Visual Representation

```text
new User()

↓

Create {}

↓

Set [[Prototype]]

↓

User.prototype

↓

this = new Object

↓

Execute Constructor

↓

Return Object
```

---

# Example

Constructor

```javascript
function User(name) {
  this.name = name;
}
```

Call

```javascript
const user = new User("John");
```

Internally

```text
{}

↓

[[Prototype]]

↓

User.prototype

↓

this.name = "John"

↓

Return Object
```

Result

```javascript
{
  name: "John";
}
```

---

# Understanding `this`

Many beginners think

```javascript
this;
```

already exists.

Wrong.

Without

```javascript
new
```

there is no automatically created object.

---

Example

```javascript
function User(name) {
  this.name = name;
}

User("John");
```

In strict mode

```text
TypeError
```

because

```text
this

↓

undefined
```

No object was created.

---

Using

```javascript
new User("John");
```

JavaScript creates the object first,

then

```text
this

↓

New Object
```

---

# What If the Constructor Returns Something?

Normally

```javascript
new
```

returns the newly created object.

Example

```javascript
function User() {
  this.name = "John";
}

const user = new User();
```

Returns

```javascript
{
  name: "John";
}
```

---

But constructors can explicitly return values.

## Returning an Object

```javascript
function User() {
  this.name = "John";

  return {
    city: "Delhi",
  };
}

const user = new User();

console.log(user);
```

Output

```javascript
{
  city: "Delhi";
}
```

The returned object replaces the automatically created one.

---

## Returning a Primitive

```javascript
function User() {
  this.name = "John";

  return 100;
}
```

Output

```javascript
{
  name: "John";
}
```

Primitive values are ignored.

---

# Summary of Return Behavior

| Constructor Returns | Result               |
| ------------------- | -------------------- |
| Nothing             | Newly created object |
| Object              | Returned object      |
| Primitive           | Newly created object |

---

# Common Mistakes

## Mistake 1

Calling constructor without

```javascript
new
```

```javascript
User("John");
```

This does not create a new object automatically.

---

## Mistake 2

Thinking constructor functions are special.

They are normal functions.

The special behavior comes from

```javascript
new
```

not from the function itself.

---

## Mistake 3

Thinking

```javascript
this;
```

exists before

```javascript
new
```

The object is created first.

Then

```javascript
this;
```

points to it.

---

# Advantages of Constructor Functions

- Reusable object creation
- Less duplicated code
- Consistent initialization
- Foundation of prototype-based inheritance
- Used internally by `class`

---

# Constructor Functions vs Factory Functions

| Feature                      | Constructor Function | Factory Function        |
| ---------------------------- | -------------------- | ----------------------- |
| Uses `new`                   | ✅ Yes               | ❌ No                   |
| Uses `this`                  | ✅ Yes               | Usually No              |
| Automatic Prototype          | ✅ Yes               | ❌ No                   |
| Returns Object Automatically | ✅ Yes               | ❌ Must return manually |

---

# Real-World Examples

Many built-in JavaScript objects are constructor functions.

```javascript
new Object();

new Array();

new Date();

new Map();

new Set();

new Error();

new RegExp();
```

Even when using array literals like

```javascript
const arr = [1, 2, 3];
```

JavaScript conceptually creates an array object associated with `Array.prototype`, though engines optimize this internally.

---

# Interview Questions

## Q1. What is a constructor function?

**Answer**

A constructor function is a normal JavaScript function intended to create and initialize objects when called with the `new` operator.

---

## Q2. What are the four internal steps performed by `new`?

**Answer**

1. Create a new empty object.
2. Set its `[[Prototype]]` to the constructor's `prototype`.
3. Execute the constructor with `this` bound to the new object.
4. Return the new object (unless the constructor explicitly returns another object).

---

## Q3. What happens if a constructor returns an object?

**Answer**

The explicitly returned object replaces the automatically created object.

---

## Q4. What happens if a constructor returns a primitive value?

**Answer**

The primitive value is ignored, and the automatically created object is returned.

---

## Q5. Are constructor functions different from normal functions?

**Answer**

No. They are ordinary functions. The special behavior comes from invoking them with the `new` operator.

---

# Key Takeaways

- Constructor functions provide a reusable way to create similar objects.
- The `new` operator is responsible for the special object creation behavior.
- `new` performs four essential steps: create an object, set its `[[Prototype]]`, call the constructor with `this`, and return the object.
- `this` refers to the newly created object only because of `new`.
- Constructors may explicitly return an object, replacing the default one; primitive return values are ignored.
- Understanding `new` is essential before learning `F.prototype`, because `new` is the mechanism that connects new objects to a constructor's prototype.

---
