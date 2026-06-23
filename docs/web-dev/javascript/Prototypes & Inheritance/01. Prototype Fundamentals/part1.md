# Introduction to Prototypes

> Prototypes are one of the **most fundamental concepts** in JavaScript. Unlike many programming languages that use **class-based inheritance**, JavaScript was originally built on **prototypal inheritance**.
>
> Understanding prototypes is essential because almost **everything in JavaScript**—objects, arrays, functions, classes, and even built-in methods—relies on them.

---

## Prerequisites

Before learning this chapter, you should know:

- Objects
- Functions
- Constructor Functions
- `new` keyword
- Basic Object-Oriented Programming (OOP)

---

## Why Do We Need Prototypes?

Imagine creating 10,000 user objects.

```javascript
const user1 = {
  name: "John",

  sayHello() {
    console.log("Hello");
  },
};

const user2 = {
  name: "Alice",

  sayHello() {
    console.log("Hello");
  },
};

const user3 = {
  name: "Bob",

  sayHello() {
    console.log("Hello");
  },
};
```

Notice something?

Every object contains its own copy of

```javascript
sayHello();
```

Even though every function does exactly the same thing.

This wastes memory.

---

### Better Idea

Instead of storing

```text
sayHello()

sayHello()

sayHello()

sayHello()
```

inside every object,

store it only **once**.

Every object can simply **reuse** it.

That is exactly what JavaScript Prototypes do.

---

## What is a Prototype?

A **prototype** is another object from which an object can inherit properties and methods.

Instead of copying methods into every object,

JavaScript links objects together.

```text
Object

↓

Prototype

↓

Another Prototype

↓

...

↓

null
```

This chain is called the

```text
Prototype Chain
```

---

## Definition

A prototype is an object that another object delegates property and method lookups to when the property does not exist on itself.

---

## Real-Life Analogy

Imagine a school.

Each student has

```text
Name

Age

Roll Number
```

stored individually.

But

```text
Attend Class()

Give Exam()

Submit Assignment()
```

are common to every student.

Instead of storing these methods for every student,

they are stored once.

Every student shares them.

Prototype works exactly like this.

---

## Prototype vs Copy

Without prototypes

```text
Object A

Method

Method

Method

-----------------

Object B

Method

Method

Method

-----------------

Object C

Method

Method

Method
```

Every object stores its own methods.

---

With prototypes

```text
Object A
        \
Object B ---> Prototype Object
        /
Object C
```

The methods exist only once.

Every object uses them.

---

## Prototypal Inheritance

JavaScript does **not** copy properties from one object to another.

Instead,

objects are linked together.

Example

```text
rabbit

↓

animal

↓

Object.prototype

↓

null
```

If

```javascript
rabbit.eats;
```

doesn't exist,

JavaScript checks

```text
animal.eats
```

If still not found,

it checks

```text
Object.prototype
```

If nowhere exists,

result

```javascript
undefined;
```

---

## Prototype Chain

Every JavaScript object has an internal reference to another object.

Example

```text
rabbit

↓

animal

↓

Object.prototype

↓

null
```

This sequence is called

```text
Prototype Chain
```

---

## Property Lookup

Suppose

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  jumps: true,
};
```

Now imagine

```text
rabbit

↓

animal
```

Searching

```javascript
rabbit.jumps;
```

JavaScript

```text
Found

Stop
```

---

Searching

```javascript
rabbit.eats;
```

JavaScript

```text
rabbit

↓

Not Found

↓

animal

↓

Found

↓

Stop
```

---

Searching

```javascript
rabbit.run;
```

JavaScript

```text
rabbit

↓

animal

↓

Object.prototype

↓

null

↓

undefined
```

---

## The Property Lookup Algorithm

Whenever JavaScript evaluates

```javascript
obj.property;
```

it follows this algorithm.

### Step 1

Look inside the object itself.

```text
Found?

↓

Yes

↓

Return
```

---

### Step 2

Otherwise,

look inside its prototype.

---

### Step 3

Still not found?

Go to the prototype's prototype.

---

### Step 4

Repeat until

```text
null
```

is reached.

---

### Step 5

Return

```javascript
undefined;
```

if the property doesn't exist anywhere.

---

## Visual Representation

```text
rabbit

↓

animal

↓

Object.prototype

↓

null
```

Searching

```javascript
rabbit.eats;
```

```text
rabbit

↓

No

↓

animal

↓

Yes

↓

Return true
```

---

Searching

```javascript
rabbit.fly;
```

```text
rabbit

↓

animal

↓

Object.prototype

↓

null

↓

undefined
```

---

## Why Does JavaScript Use Prototypes?

Because they provide

- Memory efficiency
- Code reuse
- Dynamic inheritance
- Faster object creation
- Flexible object relationships

---

## Memory Comparison

Without prototypes

```text
1000 Objects

↓

1000 Copies

↓

1000 Functions
```

---

With prototypes

```text
1000 Objects

↓

1 Shared Function
```

Huge memory saving.

---

## Dynamic Nature

Unlike many programming languages,

prototype relationships can be changed.

Example

```text
Object A

↓

Prototype A
```

can later become

```text
Object A

↓

Prototype B
```

This flexibility is one reason JavaScript is so dynamic.

---

## Prototype vs Classical Inheritance

| Classical Inheritance       | Prototype Inheritance       |
| --------------------------- | --------------------------- |
| Class creates object        | Object creates object       |
| Copy behavior               | Share behavior              |
| Fixed hierarchy             | Dynamic hierarchy           |
| Inheritance through classes | Inheritance through objects |

---

## Where Are Prototypes Used?

Prototypes power almost every JavaScript feature.

Examples

- Objects
- Arrays
- Functions
- Classes
- Built-in methods
- Constructor functions
- Object inheritance

Even modern

```javascript
class
```

internally uses prototypes.

---

## Common Misconceptions

## Misconception 1

> Prototype copies properties.

Wrong.

Prototype links objects.

No copying happens.

---

## Misconception 2

> Every object stores all methods.

Wrong.

Methods usually exist only once in the prototype.

---

## Misconception 3

> Classes replaced prototypes.

Wrong.

Classes are only syntax sugar.

Internally,

JavaScript still uses prototypes.

---

## Advantages

- Memory efficient
- Supports inheritance
- Dynamic
- Reusable methods
- Forms the basis of JavaScript's object model

---

## Limitations

- Only one prototype can be linked to an object.
- Deep prototype chains can make debugging harder.
- Prototype lookup is slower than accessing an object's own property (though JavaScript engines optimize this heavily).
- Understanding prototype behavior can be confusing for beginners.

---

## Real-World Applications

Prototypes are used everywhere in JavaScript.

Examples

- `Array.prototype.map()`
- `Array.prototype.filter()`
- `String.prototype.slice()`
- `Function.prototype.call()`
- `Object.prototype.toString()`

Whenever you call

```javascript
arr.map();
```

you are actually using

```javascript
Array.prototype.map();
```

---

## Interview Questions

## Q1. What is a prototype in JavaScript?

**Answer**

A prototype is an object from which another object inherits properties and methods.

---

## Q2. What is the Prototype Chain?

**Answer**

The prototype chain is the sequence of objects JavaScript follows while searching for a property until it reaches `null`.

---

## Q3. Why are prototypes used?

**Answer**

To enable code reuse, memory efficiency, and inheritance by sharing methods between objects instead of duplicating them.

---

## Q4. Does JavaScript copy methods from prototypes?

**Answer**

No. JavaScript links objects through the prototype chain. Methods are shared, not copied.

---

## Q5. Do JavaScript classes replace prototypes?

**Answer**

No. JavaScript classes are syntactic sugar. They are implemented internally using prototypes.

---

## Key Takeaways

- JavaScript uses **prototal inheritance**, not traditional class-based inheritance.
- A prototype is another object that provides inherited properties and methods.
- Objects are **linked**, not copied.
- Property lookup follows the **prototype chain** until the property is found or `null` is reached.
- Sharing methods through prototypes saves memory and avoids duplication.
- Modern JavaScript `class` syntax is built on top of the prototype system.
- Understanding prototypes is essential for mastering objects, inheritance, constructor functions, and built-in JavaScript APIs.

---
