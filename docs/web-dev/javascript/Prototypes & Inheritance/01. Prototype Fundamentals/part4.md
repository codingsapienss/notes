# `this` with Prototype Methods

> One of the biggest misconceptions about JavaScript prototypes is:
>
> > "If a method comes from the prototype, shouldn't `this` refer to the prototype?"
>
> The answer is **No**.
>
> This chapter explains **exactly how `this` works with prototype methods**, why methods are shared, and why every object still maintains its own state.

---

## Why Learn This?

Consider this code.

```javascript
const animal = {
  eats: true,

  walk() {
    console.log(this.name + " is walking");
  },
};

const rabbit = {
  name: "Rabbit",
};

Object.setPrototypeOf(rabbit, animal);

rabbit.walk();
```

Output

```text
Rabbit is walking
```

Question:

```text
walk() belongs to animal.

So why is

this === rabbit

instead of

this === animal ?
```

Understanding this is essential to understanding JavaScript inheritance.

---

## Important Rule

**`this` never depends on where the function is defined.**

It depends on

```text
Who calls the function.
```

Always remember:

```text
Definition

≠

Execution
```

---

## How JavaScript Executes a Method

Suppose

```javascript
rabbit.walk();
```

JavaScript performs two completely separate operations.

---

### Step 1 — Find the Method

JavaScript searches

```text
rabbit

↓

animal

↓

Found walk()
```

---

### Step 2 — Execute the Method

Although the method was found inside

```text
animal
```

it is executed as

```javascript
rabbit.walk();
```

Therefore

```javascript
this === rabbit;
```

---

## Visual Representation

Property Lookup

```text
rabbit

↓

animal

↓

walk()
```

Execution

```text
rabbit.walk()

↓

this

↓

rabbit
```

The prototype only helps **find** the method.

It does **not** determine `this`.

---

## Complete Example

```javascript
const animal = {
  eats: true,

  walk() {
    console.log(this.name);
  },
};

const rabbit = {
  name: "White Rabbit",
};

Object.setPrototypeOf(rabbit, animal);

rabbit.walk();
```

Search

```text
rabbit

↓

walk ❌

↓

animal

↓

walk ✅
```

Execution

```text
rabbit.walk()

↓

this = rabbit
```

Output

```text
White Rabbit
```

---

## Why Doesn't `this` Become `animal`?

Because JavaScript remembers

```text
Who called the function.
```

Not

```text
Where the function was found.
```

The lookup and execution are two independent steps.

---

## Another Example

```javascript
const animal = {
  sound() {
    console.log(this.type);
  },
};

const dog = {
  type: "Dog",
};

const cat = {
  type: "Cat",
};

Object.setPrototypeOf(dog, animal);
Object.setPrototypeOf(cat, animal);

dog.sound();

cat.sound();
```

Output

```text
Dog

Cat
```

Notice

Both objects share

```javascript
sound();
```

Yet

```text
this
```

changes automatically.

---

## One Shared Method

Memory

```text
dog

↓

animal

↑

cat
```

Method

```javascript
sound();
```

exists only once.

Both objects use it.

---

## Object State is Independent

Although methods are shared,

properties belong to each object.

Example

```javascript
const animal = {
  walk() {
    console.log(this.name);
  },
};

const rabbit = {
  name: "Rabbit",
};

const fox = {
  name: "Fox",
};

Object.setPrototypeOf(rabbit, animal);
Object.setPrototypeOf(fox, animal);

rabbit.walk();

fox.walk();
```

Output

```text
Rabbit

Fox
```

The same function is executed twice,

but each object provides its own data.

---

## Shared Behavior vs Shared State

This is one of the most important prototype concepts.

Behavior

```text
walk()

eat()

run()

jump()
```

is shared.

---

State

```text
name

age

health

score
```

belongs to each object.

---

Visualization

```text
           animal
      ┌────────────────┐
      │ walk()         │
      │ eat()          │
      └────────────────┘
          ▲        ▲
          │        │
      rabbit     fox
      ┌──────┐   ┌──────┐
      │name  │   │name  │
      │age   │   │age   │
      └──────┘   └──────┘
```

---

## Why is This Memory Efficient?

Suppose

```text
10000 Objects
```

Without prototypes

```text
10000 walk()

10000 eat()

10000 run()
```

Huge memory usage.

---

With prototypes

```text
10000 Objects

↓

1 walk()

1 eat()

1 run()
```

Massive memory savings.

---

## Another Example

```javascript
const person = {
  introduce() {
    console.log("Hi, I am " + this.name);
  },
};

const john = {
  name: "John",
};

const alice = {
  name: "Alice",
};

Object.setPrototypeOf(john, person);
Object.setPrototypeOf(alice, person);

john.introduce();

alice.introduce();
```

Output

```text
Hi, I am John

Hi, I am Alice
```

The method is identical.

Only

```text
this
```

changes.

---

## Internal Flow

When JavaScript executes

```javascript
rabbit.walk();
```

Internally

```text
1.

Search

↓

rabbit

↓

animal

↓

Found walk()

--------------------

2.

Call

↓

rabbit.walk()

--------------------

3.

Bind

↓

this = rabbit

--------------------

4.

Execute
```

Notice

Searching and binding are different operations.

---

## Common Mistake

Many beginners think

```text
Method found in animal

↓

this = animal
```

Wrong.

Correct flow

```text
Method found in animal

↓

Called by rabbit

↓

this = rabbit
```

---

## Rule to Remember

Whenever you see

```javascript
object.method();
```

Ask yourself

```text
Who is before the dot?
```

That object becomes

```text
this
```

---

Example

```javascript
rabbit.walk();
```

```text
this = rabbit
```

---

Example

```javascript
fox.walk();
```

```text
this = fox
```

---

## What if We Store the Function?

```javascript
const animal = {
  walk() {
    console.log(this);
  },
};

const rabbit = {};

Object.setPrototypeOf(rabbit, animal);

const fn = rabbit.walk;

fn();
```

Output (strict mode)

```text
undefined
```

or (non-strict mode)

```text
window
```

Why?

Because

```text
fn()
```

is a normal function call.

There is no object before the dot.

Therefore,

the call site determines `this`, not the prototype.

---

## Prototype Doesn't Own the Object

Another misconception

```text
animal

↓

rabbit
```

No.

Instead

```text
rabbit

↓

animal
```

The object inherits from the prototype.

The prototype does not own the object.

---

## Advantages

- Methods are shared.
- Memory efficient.
- Each object maintains independent data.
- Supports inheritance.
- Avoids duplicated functions.

---

## Common Mistakes

### Mistake 1

Thinking

```text
this

↓

prototype
```

Wrong.

`this` is the calling object.

---

### Mistake 2

Thinking methods are copied.

Wrong.

Methods are shared through the prototype chain.

---

### Mistake 3

Thinking shared methods mean shared data.

Wrong.

Only behavior is shared.

Object properties remain separate.

---

## Interview Questions

### Q1. If a method is found in the prototype, what does `this` refer to?

**Answer**

`this` refers to the object that called the method, not the prototype where the method was found.

---

### Q2. Does JavaScript copy prototype methods into every object?

**Answer**

No. Prototype methods exist only once and are shared by all objects linked to that prototype.

---

### Q3. Why do two objects using the same prototype method produce different outputs?

**Answer**

Because `this` points to the calling object, so the same method operates on different object data.

---

### Q4. Why are prototypes memory efficient?

**Answer**

Because multiple objects share a single copy of each method instead of storing duplicate functions in every object.

---

### Q5. What determines the value of `this`?

**Answer**

The **call site** determines `this`. It depends on how the function is invoked, not where it is defined or where it is found.

---

## Key Takeaways

- Prototype lookup and function execution are **two separate processes**.
- The prototype chain is used only to **find** a method.
- The object that **calls** the method becomes `this`.
- Prototype methods are **shared**, not copied.
- Object data (state) remains independent even when behavior is shared.
- A method's location does **not** determine `this`; the call site does.
- Understanding this distinction is fundamental to mastering JavaScript's prototype system.

---
