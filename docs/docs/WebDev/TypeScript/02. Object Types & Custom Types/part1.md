# Object Types

> Objects are one of the most important concepts in TypeScript.
>
> Almost everything in real-world TypeScript applications revolves around objects:
>
> - API Responses
> - Database Records
> - React Props
> - Configuration Objects
> - User Models
> - Product Models
>
> Understanding Object Types properly is essential before learning:
>
> - Type Aliases
> - Interfaces
> - Classes
> - Generics

---

# What is an Object?

An object is a collection of:

```text
Key → Value Pairs
```

Example:

```ts
const user = {
  name: "Prashant",
  age: 25,
};
```

---

# Why Do We Need Object Types?

Consider:

```ts
const user = {
  name: "Prashant",
  age: 25,
};
```

TypeScript automatically infers:

```ts
{
  name: string;
  age: number;
}
```

But sometimes we want to explicitly define the structure.

---

# Inline Object Types

---

## Syntax

```ts
let variable: {
  property: type;
};
```

---

## Example

```ts
let user: {
  name: string;
  age: number;
};
```

---

Valid:

```ts
user = {
  name: "Prashant",
  age: 25,
};
```

---

Invalid:

```ts
user = {
  name: "Prashant",
};
```

Error:

```text
Property 'age' is missing
```

---

# Multiple Properties

```ts
let product: {
  id: number;
  name: string;
  price: number;
};
```

---

Valid:

```ts
product = {
  id: 1,
  name: "Laptop",
  price: 50000,
};
```

---

# Property Types Can Differ

```ts
let employee: {
  id: number;
  name: string;
  isActive: boolean;
};
```

---

Example:

```ts
employee = {
  id: 101,
  name: "John",
  isActive: true,
};
```

---

# Object Type Checking

TypeScript checks:

```text
Property Names
Property Types
Required Properties
```

---

Example

```ts
let user: {
  name: string;
  age: number;
};
```

---

Invalid Type

```ts
user = {
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

# Nested Objects

Objects can contain other objects.

---

## Example

```ts
let user: {
  name: string;
  address: {
    city: string;
    pincode: number;
  };
};
```

---

Assignment

```ts
user = {
  name: "Prashant",
  address: {
    city: "Delhi",
    pincode: 201001,
  },
};
```

---

# Deeply Nested Objects

```ts
let company: {
  name: string;
  owner: {
    name: string;
    contact: {
      phone: string;
    };
  };
};
```

---

Example

```ts
company = {
  name: "Tech Corp",
  owner: {
    name: "John",
    contact: {
      phone: "9999999999",
    },
  },
};
```

---

# Object Types in Functions

Very common in real projects.

---

## Parameter Object

```ts
function printUser(user: { name: string; age: number }) {
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

Output:

```text
Prashant
```

---

# Function Returning Objects

---

Example

```ts
function createUser(): {
  name: string;
  age: number;
} {
  return {
    name: "Prashant",
    age: 25,
  };
}
```

---

Returned Value

```ts
{
  name: "Prashant",
  age: 25
}
```

---

# Problem with Inline Object Types

Imagine:

```ts
function createUser(user: {
  name: string;
  age: number;
  city: string;
  isAdmin: boolean;
}) {}
```

Repeated everywhere.

---

This becomes:

```text
Hard to Read
Hard to Maintain
Hard to Reuse
```

---

Solution:

```text
Type Aliases
Interfaces
```

covered in upcoming chapters.

---

# Object Type Inference

TypeScript can infer object types automatically.

---

Example

```ts
const user = {
  name: "Prashant",
  age: 25,
};
```

---

Inferred Type

```ts
{
  name: string;
  age: number;
}
```

---

# Accessing Properties

---

Example

```ts
const user = {
  name: "Prashant",
  age: 25,
};
```

---

Access

```ts
console.log(user.name);
```

Output:

```text
Prashant
```

---

# Invalid Property Access

```ts
console.log(user.salary);
```

Error:

```text
Property 'salary'
does not exist
```

---

This is one of the biggest benefits of TypeScript.

---

# Duck Typing

TypeScript follows:

```text
Structural Typing
```

also known as:

```text
Duck Typing
```

---

# What Does It Mean?

TypeScript cares about:

```text
Structure
```

not:

```text
Object Name
```

---

Example

```ts
function printUser(user: { name: string }) {
  console.log(user.name);
}
```

---

Object

```ts
const person = {
  name: "Prashant",
  age: 25,
  city: "Delhi",
};
```

---

Valid

```ts
printUser(person);
```

Output:

```text
Prashant
```

---

Why?

Because:

```text
Required structure exists.
```

---

# Structural Typing Example

---

Function

```ts
function display(item: { id: number }) {}
```

---

Object

```ts
const product = {
  id: 1,
  name: "Laptop",
  price: 50000,
};
```

---

Valid

```ts
display(product);
```

---

TypeScript only checks:

```text
Does it contain id:number?
```

Yes.

Therefore valid.

---

# Excess Property Checking

One of the most common interview questions.

---

Consider:

```ts
function createUser(user: { name: string }) {}
```

---

Direct Object Literal

```ts
createUser({
  name: "Prashant",
  age: 25,
});
```

Error.

---

```text
Object literal may only specify known properties.
```

---

# Why Error Occurs?

When passing:

```ts
Direct Object Literal
```

TypeScript performs:

```text
Excess Property Checking
```

---

It verifies:

```text
Extra properties not allowed.
```

---

# Example

Expected

```ts
{
  name: string;
}
```

Received

```ts
{
  name: string;
  age: number;
}
```

---

Result:

```text
Compilation Error
```

---

# Interesting Behavior

---

Object Variable

```ts
const user = {
  name: "Prashant",
  age: 25,
};
```

---

Pass Variable

```ts
createUser(user);
```

Valid.

---

Why?

Because:

```text
Structural Typing
```

takes over.

---

The object contains:

```text
name:string
```

which satisfies the requirement.

---

# Required vs Extra Properties

---

Expected

```ts
{
  name: string;
}
```

---

Provided

```ts
{
  name: string;
}
```

Valid.

---

Provided

```ts
{
  name: string;
  age: number;
}
```

Depends on context.

---

Direct Literal:

```text
Error
```

---

Variable:

```text
Valid
```

---

# Real World Example

API Response

```ts
const user = {
  id: 1,
  name: "Prashant",
  email: "abc@gmail.com",
};
```

---

Function

```ts
function printUser(user: { name: string }) {
  console.log(user.name);
}
```

---

Call

```ts
printUser(user);
```

Valid.

---

Output

```text
Prashant
```

---

# Common Mistakes

---

## Missing Required Property

```ts
let user: {
  name: string;
  age: number;
};

user = {
  name: "Prashant",
};
```

Error.

---

## Wrong Property Type

```ts
user = {
  name: "Prashant",
  age: "25",
};
```

Error.

---

## Invalid Property Access

```ts
console.log(user.salary);
```

Error.

---

# Interview Questions

---

## Q1

What is an Object Type?

### Answer

```text
A type that describes the structure
of an object.
```

---

## Q2

What is Structural Typing?

### Answer

```text
TypeScript checks object structure
instead of object names.
```

---

## Q3

What is Duck Typing?

### Answer

```text
If an object has the required properties,
it is considered compatible.
```

---

## Q4

What is Excess Property Checking?

### Answer

```text
Extra property validation performed
on object literals.
```

---

## Q5

Difference between:

```ts
createUser({
  name: "John",
  age: 20,
});
```

and

```ts
const user = {
  name: "John",
  age: 20,
};

createUser(user);
```

### Answer

Direct object literals trigger Excess Property Checking.

Variables use Structural Typing.

---

# Cheat Sheet

```ts
let user: {
  name: string;
  age: number;
};
```

---

```ts
{
  name: "Prashant",
  age: 25
}
```

---

```ts
function printUser(user: { name: string }) {}
```

---

```ts
function createUser(): {
  name: string;
  age: number;
} {}
```

---

```ts
const user = {
  name: "Prashant",
  age: 25,
};
```

---

# Key Takeaways

- Object Types define the structure of objects.
- TypeScript validates property names and property types.
- Objects can be nested indefinitely.
- Object Types can be used in variables, parameters and return values.
- TypeScript uses Structural Typing (Duck Typing).
- Compatibility depends on structure, not object names.
- Direct object literals trigger Excess Property Checking.
- Object variables are checked using Structural Typing.
- Inline object types become difficult to maintain in large applications.
- Type Aliases and Interfaces solve this problem and are the next logical step.

---


---\n*Last refined on April 12, 2026*


---\n*Last refined on April 13, 2026*


---\n*Last refined on April 13, 2026*


---\n*Last refined on April 25, 2026*
