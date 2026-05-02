# Type Narrowing

> We have learned that Union Types allow a variable to store multiple possible types.
>
> Example:
>
> ```ts
> let value: string | number;
> ```
>
> The problem is:
>
> ```text
> TypeScript only knows that value could be either type.
> ```
>
> Therefore:
>
> ```ts
> value.toUpperCase();
> ```
>
> is not allowed because:
>
> ```text
> number does not have toUpperCase()
> ```
>
> To safely work with union types, TypeScript provides:
>
> ```text
> Type Narrowing
> ```
>
> Type Narrowing allows TypeScript to reduce a broader type into a more specific type.

---

### What is Type Narrowing?

Type Narrowing means:

```text
Reducing a union type into a more specific type
based on runtime checks.
```

---

Example:

```ts
let value: string | number;
```

Initially:

```text
string | number
```

After checking:

```ts
if (typeof value === "string")
```

TypeScript narrows it to:

```text
string
```

inside the block.

---

### Why Do We Need Type Narrowing?

Consider:

```ts
function printValue(value: string | number) {
  console.log(value.toUpperCase());
}
```

Error:

```text
Property 'toUpperCase'
does not exist on type
'string | number'
```

---

Because:

```text
value might be a number.
```

---

We must first narrow it.

---

### Type Narrowing Using typeof

Most common narrowing technique.

---

#### Syntax

```ts
typeof variable;
```

Returns:

```text
string
number
boolean
undefined
object
function
bigint
symbol
```

---

### Example

```ts
function printValue(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  }
}
```

---

Inside block:

```ts
value;
```

becomes:

```ts
string;
```

---

Valid.

---

### Example

```ts
function printValue(value: string | number) {
  if (typeof value === "number") {
    console.log(value.toFixed(2));
  }
}
```

---

Inside block:

```ts
value;
```

becomes:

```ts
number;
```

---

Output

```ts
printValue(25);
```

```text
25.00
```

---

### Multiple Narrowing Branches

```ts
function printValue(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else {
    console.log(value.toFixed(2));
  }
}
```

---

TypeScript knows:

Inside:

```ts
if
```

↓

```ts
string;
```

---

Inside:

```ts
else
```

↓

```ts
number;
```

---

### typeof Supported Types

---

#### String

```ts
typeof value === "string";
```

---

#### Number

```ts
typeof value === "number";
```

---

#### Boolean

```ts
typeof value === "boolean";
```

---

#### Undefined

```ts
typeof value === "undefined";
```

---

#### Function

```ts
typeof value === "function";
```

---

### Important Interview Question

---

What does:

```ts
typeof null;
```

return?

---

Answer:

```text
"object"
```

---

Example

```ts
console.log(typeof null);
```

Output

```text
object
```

---

Historical JavaScript bug.

Still exists.

---

### Narrowing Using instanceof

Used with:

```text
Classes
Objects
Built-in Constructors
```

---

### Example

```ts
class Dog {
  bark() {
    console.log("Woof");
  }
}
```

---

```ts
class Cat {
  meow() {
    console.log("Meow");
  }
}
```

---

```ts
function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  }
}
```

---

Inside block:

```ts
animal;
```

becomes:

```ts
Dog;
```

---

### Example

```ts
const date = new Date();

console.log(date instanceof Date);
```

Output:

```text
true
```

---

### Why Use instanceof?

Because:

```text
typeof cannot distinguish
between custom classes.
```

---

Example:

```ts
typeof dog;
```

returns:

```text
object
```

Not useful.

---

Use:

```ts
instanceof
```

instead.

---

### Narrowing Using in Operator

Used to check:

```text
Whether a property exists.
```

---

### Example

```ts
type User = {
  name: string;
};
```

---

```ts
type Admin = {
  name: string;
  permissions: string[];
};
```

---

```ts
function printUser(user: User | Admin) {
  if ("permissions" in user) {
    console.log(user.permissions);
  }
}
```

---

Inside block:

```ts
user;
```

becomes:

```ts
Admin;
```

---

### Another Example

```ts
type Car = {
  drive: () => void;
};
```

---

```ts
type Boat = {
  sail: () => void;
};
```

---

```ts
function move(vehicle: Car | Boat) {
  if ("drive" in vehicle) {
    vehicle.drive();
  }
}
```

---

Type narrowed to:

```ts
Car;
```

---

### Truthiness Narrowing

Very common in real projects.

---

JavaScript values can be:

```text
Truthy
Falsy
```

---

Falsy values:

```ts
false;
0;
("");
null;
undefined;
NaN;
```

---

### Example

```ts
function printName(name: string | null) {
  if (name) {
    console.log(name.toUpperCase());
  }
}
```

---

Inside block:

```ts
name;
```

becomes:

```ts
string;
```

---

Because:

```text
null is eliminated.
```

---

### Example

```ts
function process(value: string | undefined) {
  if (value) {
    console.log(value.length);
  }
}
```

---

TypeScript narrows:

```ts
string | undefined;
```

↓

```ts
string;
```

---

### Equality Narrowing

Using:

```ts
===
!==
==
!=
```

---

### Example

```ts
function printValue(value: string | number) {
  if (value === "admin") {
    console.log("Admin User");
  }
}
```

---

Inside block:

```ts
value;
```

becomes:

```ts
"admin";
```

Literal Type.

---

### Another Example

```ts
function printValue(value: string | null) {
  if (value !== null) {
    console.log(value.toUpperCase());
  }
}
```

---

Inside block:

```ts
string;
```

---

### Discriminated Unions

One of the most important TypeScript concepts.

Frequently asked in interviews.

---

### Problem

Suppose:

```ts
type Circle = {
  radius: number;
};
```

---

```ts
type Square = {
  side: number;
};
```

---

Need to identify shape.

---

### Solution

Add a common property.

---

```ts
type Circle = {
  kind: "circle";
  radius: number;
};
```

---

```ts
type Square = {
  kind: "square";
  side: number;
};
```

---

Union

```ts
type Shape = Circle | Square;
```

---

### Example

```ts
function area(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius * shape.radius;
  }
}
```

---

TypeScript automatically narrows:

```ts
shape;
```

to:

```ts
Circle;
```

---

### Why Called Discriminated Union?

Because:

```ts
kind;
```

acts as a:

```text
Discriminator
```

which identifies the exact type.

---

### Exhaustive Checking

Ensures all possible cases are handled.

---

Example

```ts
type Shape = Circle | Square;
```

---

```ts
function area(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return 1;

    case "square":
      return 2;
  }
}
```

---

Every case handled.

---

Safer.

---

### User Defined Type Guards

You can create custom narrowing functions.

---

### Example

```ts
type User = {
  name: string;
};
```

---

```ts
type Admin = {
  name: string;
  permissions: string[];
};
```

---

```ts
function isAdmin(user: User | Admin): user is Admin {
  return "permissions" in user;
}
```

---

Usage

```ts
if (isAdmin(user)) {
  console.log(user.permissions);
}
```

---

TypeScript narrows:

```ts
user;
```

to:

```ts
Admin;
```

---

### Why Type Guards Matter?

Useful when:

```text
Complex business logic
Large codebases
Reusable validation
```

---

### Visual Summary

---

Union

```ts
string | number;
```

↓

typeof

```ts
typeof value === "string";
```

↓

Narrowed

```ts
string;
```

---

Object Union

```ts
User | Admin;
```

↓

in

```ts
"permissions" in user;
```

↓

```ts
Admin;
```

---

Class Union

```ts
Dog | Cat;
```

↓

instanceof

```ts
animal instanceof Dog;
```

↓

```ts
Dog;
```

---

### Common Mistakes

---

#### Accessing Properties Without Narrowing

Wrong

```ts
value.toUpperCase();
```

when:

```ts
string | number;
```

---

Must narrow first.

---

#### Using typeof for Objects

Wrong

```ts
typeof animal === "Dog";
```

---

Use:

```ts
instanceof Dog
```

---

#### Forgetting null Checks

Wrong

```ts
user.name.toUpperCase();
```

when:

```ts
User | null;
```

---

Check first.

---

### Interview Questions

---

#### Q1

What is Type Narrowing?

#### Answer

```text
The process of reducing a broader type
into a more specific type.
```

---

#### Q2

How does typeof help narrowing?

#### Answer

It narrows primitive types.

---

#### Q3

When should instanceof be used?

#### Answer

For classes and object instances.

---

#### Q4

What is a Discriminated Union?

#### Answer

A union where every type contains a common literal property used for narrowing.

---

#### Q5

What is a User Defined Type Guard?

#### Answer

A custom function that narrows types using:

```ts
value is Type
```

syntax.

---

### Cheat Sheet

```ts
typeof value === "string";
```

---

```ts
animal instanceof Dog;
```

---

```ts
"permissions" in user;
```

---

```ts
if (value)
```

---

```ts
if (value !== null)
```

---

```ts
shape.kind === "circle";
```

---

```ts
function isAdmin(user): user is Admin;
```

---

### Key Takeaways

- Union Types often require narrowing before accessing specific properties or methods.
- `typeof` is used for primitive type narrowing.
- `instanceof` is used for class/object narrowing.
- `in` is used to check for property existence.
- Truthiness checks can eliminate `null` and `undefined`.
- Equality checks can narrow literal types.
- Discriminated Unions are one of the most powerful TypeScript patterns.
- User Defined Type Guards allow reusable custom narrowing logic.
- Type Narrowing is essential for writing safe TypeScript code.
- Most advanced TypeScript features build upon narrowing concepts.
