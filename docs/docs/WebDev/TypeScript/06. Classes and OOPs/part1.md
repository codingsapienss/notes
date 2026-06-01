# Classes Fundamentals

> Classes are one of the core Object-Oriented Programming (OOP) features in TypeScript.
>
> They allow us to model real-world entities using:
>
> - Properties (Data)
> - Methods (Behavior)
> - Constructors (Initialization)
>
> Classes help organize code and are heavily used in:
>
> - Backend Development
> - Enterprise Applications
> - Design Patterns
> - Angular
> - NestJS
> - OOP-based Architectures

---

# What is a Class?

A Class is a blueprint for creating objects.

Think of it as:

```text
Class  → Blueprint

Object → Actual Instance
```

---

## Real World Example

```text
Blueprint of House
        ↓
Actual House
```

Similarly:

```text
Class User
       ↓
User Object
```

---

# Why Do We Need Classes?

Without Classes:

```ts
const user1 = {
  name: "Prashant",
  age: 25,
  greet() {
    console.log("Hello");
  },
};

const user2 = {
  name: "John",
  age: 30,
  greet() {
    console.log("Hello");
  },
};
```

Problem:

```text
Code Duplication
Hard Maintenance
Poor Scalability
```

---

With Classes:

```ts
class User {
  name: string;
  age: number;

  greet() {
    console.log("Hello");
  }
}
```

Create multiple users easily.

---

# Class Syntax

---

## Basic Structure

```ts
class ClassName {
  properties;

  methods;
}
```

---

## Example

```ts
class User {
  name: string;
  age: number;
}
```

---

Here:

```text
Class Name → User

Properties:
- name
- age
```

---

# Creating Objects

Classes themselves do not create objects.

We create objects using:

```ts
new
```

keyword.

---

## Example

```ts
class User {
  name: string;
  age: number;
}
```

---

Create Object

```ts
const user = new User();
```

---

Memory:

```text
User Class
      ↓
new User()
      ↓
Object Created
```

---

# What is an Object?

An Object is:

```text
An instance of a class.
```

---

Example

```ts
class User {}
```

---

```ts
const user1 = new User();
const user2 = new User();
```

---

Memory

```text
user1 → User Object

user2 → User Object
```

---

Both are separate objects.

---

# Adding Properties

---

## Example

```ts
class User {
  name: string;
  age: number;
}
```

---

Create Object

```ts
const user = new User();

user.name = "Prashant";
user.age = 25;
```

---

Output

```ts
console.log(user);
```

```text
User {
  name: 'Prashant',
  age: 25
}
```

---

# Constructor

One of the most important concepts.

---

# What is a Constructor?

A Constructor is a special method that runs:

```text
Automatically
```

when an object is created.

---

# Why Do We Need Constructors?

Without Constructor:

```ts
const user = new User();

user.name = "Prashant";
user.age = 25;
```

Multiple assignments needed.

---

With Constructor:

```ts
const user = new User("Prashant", 25);
```

Cleaner.

---

# Constructor Syntax

```ts
class User {
  constructor() {}
}
```

---

Example

```ts
class User {
  constructor() {
    console.log("User Created");
  }
}
```

---

Create Object

```ts
const user = new User();
```

Output

```text
User Created
```

---

Constructor automatically executes.

---

# Constructor with Parameters

---

Example

```ts
class User {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}
```

---

Create Object

```ts
const user = new User("Prashant", 25);
```

---

Output

```ts
console.log(user);
```

```text
User {
  name: 'Prashant',
  age: 25
}
```

---

# Understanding this

One of the most important OOP concepts.

---

Consider:

```ts
class User {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

---

Question:

What is:

```ts
this.name;
```

?

---

# Meaning of this

```text
Current Object
```

---

Example

```ts
const user1 = new User("Prashant");

const user2 = new User("John");
```

---

During Object Creation

For user1:

```ts
this.name = "Prashant";
```

---

For user2:

```ts
this.name = "John";
```

---

So:

```text
this refers to the object
currently being created or used.
```

---

# Memory Visualization

---

Object Creation

```ts
const user = new User("Prashant", 25);
```

---

Memory

```text
user
 │
 ▼

{
  name: "Prashant",
  age: 25
}
```

---

Constructor executes:

```ts
this.name = name;
this.age = age;
```

---

Result:

```text
Object Initialized
```

---

# Methods

Classes can contain functions.

Inside classes they are called:

```text
Methods
```

---

Example

```ts
class User {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet() {
    console.log(`Hello ${this.name}`);
  }
}
```

---

Create Object

```ts
const user = new User("Prashant");

user.greet();
```

---

Output

```text
Hello Prashant
```

---

# Multiple Methods

---

Example

```ts
class BankAccount {
  balance: number;

  constructor(balance: number) {
    this.balance = balance;
  }

  deposit(amount: number) {
    this.balance += amount;
  }

  withdraw(amount: number) {
    this.balance -= amount;
  }

  showBalance() {
    console.log(this.balance);
  }
}
```

---

Usage

```ts
const account = new BankAccount(1000);

account.deposit(500);

account.withdraw(200);

account.showBalance();
```

---

Output

```text
1300
```

---

# Class as a Custom Type

A class automatically creates a type.

---

Example

```ts
class User {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

---

Valid

```ts
const user: User = new User("Prashant");
```

---

Notice:

```ts
User;
```

is acting as:

```text
Both Class and Type
```

---

# Property Initialization Error

Common TypeScript Error.

---

Example

```ts
class User {
  name: string;
}
```

---

Error

```text
Property 'name'
has no initializer
and is not definitely assigned.
```

---

Why?

Because TypeScript expects:

```text
Every property must be initialized.
```

---

# Fix 1 — Constructor Initialization

```ts
class User {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

---

# Fix 2 — Default Value

```ts
class User {
  name: string = "";
}
```

---

# Fix 3 — Definite Assignment Assertion

```ts
class User {
  name!: string;
}
```

---

Meaning:

```text
Trust me TypeScript,
I will initialize it later.
```

---

Use carefully.

---

# Constructor Shorthand

Very common in production code.

---

Instead of:

```ts
class User {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}
```

---

Use:

```ts
class User {
  constructor(
    public name: string,
    public age: number,
  ) {}
}
```

---

TypeScript automatically creates:

```ts
name;
age;
```

properties.

---

Equivalent behavior.

---

# Class Expression

Classes can be stored in variables.

---

Example

```ts
const User = class {
  name: string = "Prashant";
};
```

---

Create Object

```ts
const user = new User();
```

---

Less common than normal classes.

---

# Real World Example

---

User Model

```ts
class User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
  ) {}

  display() {
    console.log(`${this.name} (${this.email})`);
  }
}
```

---

Usage

```ts
const user = new User(1, "Prashant", "abc@gmail.com");

user.display();
```

---

Output

```text
Prashant (abc@gmail.com)
```

---

# Common Mistakes

---

## Forgetting new

Wrong

```ts
const user = User();
```

---

Error.

---

Correct

```ts
const user = new User();
```

---

## Using Property Before Initialization

Wrong

```ts
class User {
  name: string;
}
```

---

Initialize properly.

---

## Forgetting this

Wrong

```ts
constructor(name: string) {
  name = name;
}
```

---

Correct

```ts
constructor(name: string) {
  this.name = name;
}
```

---

# Interview Questions

---

## Q1

What is a Class?

### Answer

```text
A blueprint used to create objects.
```

---

## Q2

What is an Object?

### Answer

```text
An instance of a class.
```

---

## Q3

What is a Constructor?

### Answer

```text
A special method that executes
automatically when an object is created.
```

---

## Q4

What does this refer to?

### Answer

```text
The current object instance.
```

---

## Q5

Why use Classes?

### Answer

```text
To model real-world entities,
improve code organization,
and support OOP principles.
```

---

# Cheat Sheet

```ts
class User {}
```

---

```ts
const user = new User();
```

---

```ts
constructor() {}
```

---

```ts
this.name = name;
```

---

```ts
class User {
  constructor(public name: string) {}
}
```

---

```ts
user.greet();
```

---

# Key Takeaways

- A class is a blueprint for creating objects.
- Objects are instances of classes.
- The `new` keyword creates objects.
- Constructors run automatically during object creation.
- `this` refers to the current object instance.
- Methods define object behavior.
- Classes act as both runtime constructs and TypeScript types.
- Properties should be initialized properly.
- Constructor shorthand is heavily used in production TypeScript.
- Classes form the foundation for inheritance, abstraction, and advanced OOP concepts.

---
 
 
