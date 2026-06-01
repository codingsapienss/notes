# Interface Fundamentals

> Interfaces are one of the most important features in TypeScript.
>
> They allow us to define:
>
> ```text
> The Structure of an Object
> ```
>
> Interfaces help us create:
>
> - Reusable Type Definitions
> - Better Code Organization
> - Strong Type Safety
> - Self-Documenting Code
>
> Almost every large TypeScript codebase uses interfaces extensively.

---

# What is an Interface?

An Interface is a blueprint that describes the shape of an object.

---

Example:

```ts
interface User {
  name: string;
  age: number;
}
```

---

This means:

```text
Any object of type User
must contain:

name → string
age → number
```

---

# Why Do We Need Interfaces?

Without interfaces:

```ts
function createUser(user: { name: string; age: number; email: string }) {}
```

---

Imagine writing this everywhere.

```text
Hard to Read
Hard to Maintain
Repeated Code
```

---

Instead:

```ts
interface User {
  name: string;
  age: number;
  email: string;
}
```

---

```ts
function createUser(user: User) {}
```

Much cleaner.

---

# Interface Syntax

---

Basic Syntax

```ts
interface InterfaceName {
  property: type;
}
```

---

Example

```ts
interface User {
  name: string;
  age: number;
}
```

---

Usage

```ts
const user: User = {
  name: "Prashant",
  age: 25,
};
```

---

# Type Checking

TypeScript validates:

```text
Property Names
Property Types
Required Properties
```

---

Valid

```ts
const user: User = {
  name: "Prashant",
  age: 25,
};
```

---

Invalid

```ts
const user: User = {
  name: "Prashant",
};
```

Error:

```text
Property 'age' is missing
```

---

Invalid

```ts
const user: User = {
  name: "Prashant",
  age: "25",
};
```

Error.

---

# Interface vs Object Type

You already learned:

```ts
type User = {
  name: string;
  age: number;
};
```

---

Equivalent Interface:

```ts
interface User {
  name: string;
  age: number;
}
```

---

Both describe object structures.

Differences will be covered in Part 5C.

---

# Optional Properties

Sometimes properties may not exist.

---

Use:

```ts
?
```

---

Example

```ts
interface User {
  name: string;
  age?: number;
}
```

---

Valid

```ts
const user: User = {
  name: "Prashant",
};
```

---

Valid

```ts
const user: User = {
  name: "Prashant",
  age: 25,
};
```

---

Internally:

```ts
age?: number
```

behaves like:

```ts
age: number | undefined;
```

---

# Real World Example

User Profile

```ts
interface UserProfile {
  name: string;
  phone?: string;
}
```

---

Some users may have:

```text
Phone Number
```

Others may not.

---

# Readonly Properties

Some properties should never change.

---

Use:

```ts
readonly;
```

---

Example

```ts
interface User {
  readonly id: number;
  name: string;
}
```

---

Create Object

```ts
const user: User = {
  id: 1,
  name: "Prashant",
};
```

---

Valid

```ts
user.name = "John";
```

---

Invalid

```ts
user.id = 10;
```

Error:

```text
Cannot assign to readonly property
```

---

# Why Use Readonly?

Common examples:

```text
Database IDs
Order IDs
User IDs
Created Timestamps
```

---

Values that should never change.

---

# Method Signatures

Interfaces can describe methods.

---

Example

```ts
interface User {
  name: string;

  greet(): void;
}
```

---

Implementation

```ts
const user: User = {
  name: "Prashant",

  greet() {
    console.log("Hello");
  },
};
```

---

Output

```text
Hello
```

---

# Method Parameters

Methods can have parameters.

---

Example

```ts
interface Calculator {
  add(a: number, b: number): number;
}
```

---

Implementation

```ts
const calc: Calculator = {
  add(a, b) {
    return a + b;
  },
};
```

---

Usage

```ts
console.log(calc.add(10, 20));
```

Output

```text
30
```

---

# Method Return Types

Interfaces also enforce return types.

---

Example

```ts
interface UserService {
  getName(): string;
}
```

---

Valid

```ts
const service: UserService = {
  getName() {
    return "Prashant";
  },
};
```

---

Invalid

```ts
const service: UserService = {
  getName() {
    return 100;
  },
};
```

Error.

---

# Nested Interfaces

Interfaces can contain other interfaces.

---

Example

```ts
interface Address {
  city: string;
  pincode: number;
}
```

---

```ts
interface User {
  name: string;
  address: Address;
}
```

---

Usage

```ts
const user: User = {
  name: "Prashant",

  address: {
    city: "Delhi",
    pincode: 201001,
  },
};
```

---

# Deeply Nested Interfaces

---

Example

```ts
interface Contact {
  phone: string;
}
```

---

```ts
interface Address {
  city: string;
  contact: Contact;
}
```

---

```ts
interface User {
  name: string;
  address: Address;
}
```

---

Usage

```ts
const user: User = {
  name: "Prashant",

  address: {
    city: "Delhi",

    contact: {
      phone: "9999999999",
    },
  },
};
```

---

# Arrays Inside Interfaces

Very common.

---

Example

```ts
interface User {
  name: string;
  skills: string[];
}
```

---

Usage

```ts
const user: User = {
  name: "Prashant",

  skills: ["TypeScript", "React", "Node.js"],
};
```

---

# Interface Reusability

One of the biggest advantages.

---

Example

```ts
interface User {
  name: string;
  age: number;
}
```

---

Reuse everywhere:

```ts
const user1: User;
```

---

```ts
const user2: User;
```

---

```ts
function saveUser(user: User) {}
```

---

```ts
function updateUser(user: User) {}
```

---

Single source of truth.

---

# Interfaces in Functions

---

Parameter Example

```ts
interface User {
  name: string;
  age: number;
}
```

---

```ts
function printUser(user: User) {
  console.log(user.name);
}
```

---

Call

```ts
printUser({
  name: "Prashant",
  age: 25,
});
```

---

# Interfaces as Return Types

---

Example

```ts
interface User {
  name: string;
  age: number;
}
```

---

```ts
function getUser(): User {
  return {
    name: "Prashant",
    age: 25,
  };
}
```

---

# Structural Typing Still Applies

TypeScript uses:

```text
Structural Typing
```

---

Example

```ts
interface User {
  name: string;
}
```

---

Object

```ts
const person = {
  name: "Prashant",
  age: 25,
};
```

---

Valid

```ts
const user: User = person;
```

---

Why?

Because:

```text
Required structure exists.
```

---

# Real World Example

API User Model

```ts
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}
```

---

Usage

```ts
const user: User = await getUser();
```

---

TypeScript now knows:

```ts
user.id;
```

↓

```ts
number;
```

---

```ts
user.email;
```

↓

```ts
string;
```

---

Strong typing everywhere.

---

# Common Mistakes

---

## Forgetting Required Properties

Wrong

```ts
const user: User = {
  name: "Prashant",
};
```

---

Missing:

```ts
age;
```

---

## Wrong Property Types

Wrong

```ts
const user: User = {
  name: "Prashant",
  age: "25",
};
```

---

Must be:

```ts
number;
```

---

## Modifying Readonly Properties

Wrong

```ts
user.id = 100;
```

---

Readonly prevents reassignment.

---

# Interview Questions

---

## Q1

What is an Interface?

### Answer

```text
A blueprint that describes
the structure of an object.
```

---

## Q2

Why use Interfaces?

### Answer

```text
Reusability
Readability
Type Safety
Maintainability
```

---

## Q3

How do you create an optional property?

### Answer

```ts
age?: number;
```

---

## Q4

How do you create a readonly property?

### Answer

```ts
readonly id: number;
```

---

## Q5

Can Interfaces contain methods?

### Answer

Yes.

```ts
greet(): void;
```

---

# Cheat Sheet

```ts
interface User {
  name: string;
  age: number;
}
```

---

```ts
age?: number;
```

---

```ts
readonly id: number;
```

---

```ts
greet(): void;
```

---

```ts
address: Address;
```

---

```ts
skills: string[];
```

---

```ts
function saveUser(user: User) {}
```

---

# Key Takeaways

- Interfaces define object structures.
- They improve readability and reusability.
- Interfaces support optional properties using `?`.
- Interfaces support readonly properties using `readonly`.
- Interfaces can define methods and method signatures.
- Interfaces can be nested.
- Interfaces work seamlessly with arrays and functions.
- TypeScript uses structural typing with interfaces.
- Interfaces are one of the most commonly used features in large TypeScript codebases.
- Mastering interfaces is essential before learning interface extension and declaration merging.

---
 
 


---\n*Last refined on April 12, 2026*


---\n*Last refined on April 24, 2026*
