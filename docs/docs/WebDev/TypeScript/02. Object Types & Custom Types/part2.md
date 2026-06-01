# Type Aliases

> In previous chapter, we learned how to define Object Types directly using inline type definitions.
>
> While that works for small examples, it quickly becomes difficult to maintain in real-world applications.
>
> Type Aliases solve this problem by allowing us to:
>
> - Create reusable custom types
> - Improve readability
> - Reduce duplication
> - Build complex type systems
>
> Type Aliases are one of the most heavily used TypeScript features.

---

# Why Do We Need Type Aliases?

Consider the following function:

```ts
function createUser(user: {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}) {
  console.log(user.name);
}
```

Looks okay initially.

Now imagine:

```ts
function updateUser(user: {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}) {}

function deleteUser(user: {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}) {}
```

We are repeating the same structure everywhere.

Problems:

```text
Code Duplication
Hard Maintenance
Poor Readability
Higher Chance of Errors
```

---

# What is a Type Alias?

A Type Alias allows us to:

```text
Give a name to a type.
```

---

## Syntax

```ts
type TypeName = TypeDefinition;
```

---

## Example

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

---

Now:

```ts
const user: User = {
  id: 1,
  name: "Prashant",
  email: "abc@gmail.com",
};
```

---

# Mental Model

Think of:

```ts
type User = ...
```

as:

```text
A custom type definition
```

similar to:

```cpp
typedef
```

in C/C++.

---

# Reusing Type Aliases

Without Alias:

```ts
function createUser(user: { id: number; name: string }) {}
```

---

With Alias:

```ts
type User = {
  id: number;
  name: string;
};

function createUser(user: User) {}
```

---

Cleaner.

More maintainable.

More readable.

---

# Type Aliases with Variables

---

## Example

```ts
type User = {
  name: string;
  age: number;
};
```

---

```ts
const user: User = {
  name: "Prashant",
  age: 25,
};
```

---

Output

```ts
console.log(user.name);
```

```text
Prashant
```

---

# Type Checking Still Happens

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
  age: "25",
};
```

Error:

```text
Type 'string'
is not assignable to type 'number'
```

---

# Nested Type Aliases

One alias can use another alias.

---

## Example

```ts
type Address = {
  city: string;
  pincode: number;
};
```

---

```ts
type User = {
  name: string;
  address: Address;
};
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

# Why Nest Types?

Real applications contain relationships.

Example:

```text
User
 └── Address

Order
 └── Product

Company
 └── Employee
```

Nested aliases make these models manageable.

---

# Deeply Nested Example

```ts
type Contact = {
  phone: string;
};

type Address = {
  city: string;
  contact: Contact;
};

type User = {
  name: string;
  address: Address;
};
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

# Type Aliases with Functions

Aliases can be used in parameters.

---

## Example

```ts
type User = {
  name: string;
  age: number;
};
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

Output

```text
Prashant
```

---

# Type Aliases with Return Types

---

Example

```ts
type User = {
  name: string;
  age: number;
};
```

---

```ts
function createUser(): User {
  return {
    name: "Prashant",
    age: 25,
  };
}
```

---

Return Type:

```text
User
```

---

# Type Aliases with Arrays

---

## Array of Numbers

```ts
type Scores = number[];
```

---

Usage

```ts
const marks: Scores = [90, 85, 95];
```

---

# Array of Strings

```ts
type UserNames = string[];
```

---

```ts
const users: UserNames = ["Prashant", "John", "Alex"];
```

---

# Array of Objects

Very common.

---

```ts
type User = {
  id: number;
  name: string;
};
```

---

```ts
type Users = User[];
```

---

Usage

```ts
const users: Users = [
  {
    id: 1,
    name: "Prashant",
  },
  {
    id: 2,
    name: "John",
  },
];
```

---

# Type Aliases with Functions (Function Types)

A Type Alias can describe a function itself.

---

## Example

```ts
type AddFunction = (a: number, b: number) => number;
```

---

Usage

```ts
const add: AddFunction = (a, b) => a + b;
```

---

Call

```ts
console.log(add(10, 20));
```

Output

```text
30
```

---

# Why Use Function Aliases?

Useful when:

```text
Many functions share
the same signature.
```

---

Example

```ts
type Calculator = (a: number, b: number) => number;
```

---

```ts
const add: Calculator = (a, b) => a + b;

const multiply: Calculator = (a, b) => a * b;
```

---

# Type Aliases with Union Types

One of the biggest advantages.

---

## Example

```ts
type Status = "success" | "error" | "loading";
```

---

Usage

```ts
let state: Status;

state = "success";
```

Valid.

---

```ts
state = "pending";
```

Error.

---

# Why Is This Useful?

Restricts values.

---

Without Alias

```ts
let state: "success" | "error" | "loading";
```

Repeated everywhere.

---

With Alias

```ts
type Status = "success" | "error" | "loading";
```

Reusable.

---

# Type Aliases with Intersection Types

Aliases can combine multiple types.

---

## Example

```ts
type Person = {
  name: string;
};
```

---

```ts
type Employee = {
  employeeId: number;
};
```

---

```ts
type Staff = Person & Employee;
```

---

Result

```ts
{
  name: string;
  employeeId: number;
}
```

---

Usage

```ts
const staff: Staff = {
  name: "Prashant",
  employeeId: 101,
};
```

---

# Type Alias vs Inline Object Type

---

## Inline

```ts
function printUser(user: { name: string; age: number }) {}
```

---

## Alias

```ts
type User = {
  name: string;
  age: number;
};

function printUser(user: User) {}
```

---

Alias version is:

```text
Cleaner
Reusable
Maintainable
```

---

# Can Type Aliases Be Reopened?

Important Interview Question.

---

Example

```ts
type User = {
  name: string;
};
```

---

Trying:

```ts
type User = {
  age: number;
};
```

Error.

---

```text
Duplicate Identifier
```

---

Unlike Interfaces:

```text
Type Aliases Cannot Merge
```

---

# Naming Conventions

Common conventions:

---

## PascalCase

```ts
type User = {};
type Product = {};
type ApiResponse = {};
```

---

Avoid:

```ts
type user = {};
```

---

PascalCase is standard.

---

# Real World Example

API Response

---

Without Alias

```ts
function saveUser(user: { id: number; name: string; email: string }) {}
```

---

With Alias

```ts
type User = {
  id: number;
  name: string;
  email: string;
};

function saveUser(user: User) {}
```

---

Much easier to maintain.

---

# Common Mistakes

---

## Repeating Types Everywhere

Bad

```ts
function a(user:{...}) {}

function b(user:{...}) {}
```

---

Use aliases instead.

---

## Creating Duplicate Aliases

Wrong

```ts
type User = {};
type User = {};
```

---

Error.

---

## Using Poor Names

Bad

```ts
type A = {};
type B = {};
```

---

Use meaningful names.

---

# Interview Questions

---

## Q1

What is a Type Alias?

### Answer

```text
A named reusable type definition.
```

---

## Q2

Why use Type Aliases?

### Answer

```text
To improve readability,
reuse and maintainability.
```

---

## Q3

Can a Type Alias represent a function?

### Answer

Yes.

```ts
type Add = (a: number, b: number) => number;
```

---

## Q4

Can a Type Alias represent an array?

### Answer

Yes.

```ts
type Users = User[];
```

---

## Q5

Can Type Aliases be merged?

### Answer

No.

Unlike interfaces,
Type Aliases cannot merge.

````

---

# Cheat Sheet

```ts
type User = {
  id: number;
  name: string;
};
````

---

```ts
const user: User = {
  id: 1,
  name: "Prashant",
};
```

---

```ts
type Users = User[];
```

---

```ts
type Status = "success" | "error" | "loading";
```

---

```ts
type Calculator = (a: number, b: number) => number;
```

---

```ts
type Staff = Person & Employee;
```

---

# Key Takeaways

- Type Aliases create reusable named types.
- They reduce duplication and improve readability.
- Type Aliases can represent objects, arrays, functions, unions and intersections.
- Nested aliases help model complex real-world data.
- Function signatures can be stored inside aliases.
- Type Aliases are heavily used in production TypeScript applications.
- Type Aliases cannot be reopened or merged.
- Use PascalCase naming conventions.
- Prefer aliases over repeating inline object types.
- Type Aliases form the foundation for scalable TypeScript codebases.

---
 
 
 
 


---\n*Last refined on April 17, 2026*


---\n*Last refined on April 18, 2026*


---\n*Last refined on April 20, 2026*


---\n*Last refined on April 27, 2026*
