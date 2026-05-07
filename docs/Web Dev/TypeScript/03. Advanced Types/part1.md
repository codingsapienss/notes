# — Union Types

> One of the biggest limitations of primitive typing is that a variable can normally hold only one type.
>
> Example:
>
> ```ts
> let value: string;
> ```
>
> Here:
>
> ```text
> value can only store strings.
> ```
>
> But in real-world applications, data is often more flexible.
>
> Examples:
>
> - API responses can be success or error.
> - User IDs can be numbers or strings.
> - Form fields may be empty.
> - Function parameters may accept multiple types.
>
> TypeScript solves this using:
>
> ```text
> Union Types
> ```

---

### What is a Union Type?

A Union Type allows a value to be:

```text
One of Multiple Types
```

---

#### Syntax

```ts
Type1 | Type2;
```

Read as:

```text
Type1 OR Type2
```

---

#### Example

```ts
let value: string | number;
```

Meaning:

```text
value can be a string
OR
value can be a number
```

---

Valid

```ts
value = "Prashant";
```

---

Valid

```ts
value = 100;
```

---

Invalid

```ts
value = true;
```

Error:

```text
Type 'boolean'
is not assignable to type
'string | number'
```

---

### Why Do We Need Union Types?

Without unions:

```ts
let userId: string;
```

---

But some APIs return:

```text
"101"
```

while others return:

```text
101
```

---

Instead of:

```ts
let userId: any;
```

which removes type safety,

we use:

```ts
let userId: string | number;
```

---

Now TypeScript still checks types.

---

### Union of Primitive Types

---

#### String or Number

```ts
let id: string | number;
```

---

Valid

```ts
id = "101";
```

---

Valid

```ts
id = 101;
```

---

Invalid

```ts
id = true;
```

---

### Multiple Types

A union can contain many types.

---

Example

```ts
let value: string | number | boolean;
```

---

Valid

```ts
value = "hello";
```

---

Valid

```ts
value = 100;
```

---

Valid

```ts
value = false;
```

---

### Union with null

Very common.

---

Example

```ts
let user: string | null;
```

---

Valid

```ts
user = "Prashant";
```

---

Valid

```ts
user = null;
```

---

### Why Use null?

Represents:

```text
Value intentionally absent
```

---

Example

```ts
let selectedUser: string | null = null;
```

---

Later

```ts
selectedUser = "Prashant";
```

---

### Union with undefined

---

Example

```ts
let username: string | undefined;
```

---

Valid

```ts
username = "Prashant";
```

---

Valid

```ts
username = undefined;
```

---

### Common Real World Pattern

```ts
let currentUser: User | null;
```

Meaning:

```text
Either a valid user exists
or
no user is logged in
```

---

### Union Types with Functions

---

Example

```ts
function printId(id: string | number) {
  console.log(id);
}
```

---

Valid

```ts
printId(101);
```

---

Valid

```ts
printId("101");
```

---

Invalid

```ts
printId(true);
```

---

### Important Problem

Consider:

```ts
function printId(id: string | number) {
  console.log(id.toUpperCase());
}
```

Error.

---

Why?

Because:

```text
number
```

does not have:

```ts
toUpperCase();
```

---

TypeScript protects us.

---

This leads to:

```text
Type Narrowing
```

which will be covered in Part 3C.

---

### Union Types with Arrays

---

#### Array of Multiple Types

```ts
const values: (string | number)[] = ["John", 25, "Alex", 40];
```

---

Valid.

---

### Difference Between These Two

---

#### Version 1

```ts
string | number[]
```

Meaning:

```text
string

OR

number[]
```

---

Examples

```ts
"hello";
```

Valid.

---

```ts
[1, 2, 3];
```

Valid.

---

### Version 2

```ts
(string | number)[]
```

Meaning:

```text
Array containing
strings and numbers.
```

---

Examples

```ts
["John", 25];
```

Valid.

---

This is a very common interview question.

---

### Union Types with Objects

---

Example

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

Variable

```ts
let person: User | Admin;
```

---

Valid

```ts
person = {
  name: "Prashant",
};
```

---

Valid

```ts
person = {
  name: "Admin",
  permissions: ["read"],
};
```

---

### Real World Example

API Response

---

Success

```ts
type SuccessResponse = {
  success: true;
  data: string;
};
```

---

Error

```ts
type ErrorResponse = {
  success: false;
  message: string;
};
```

---

Union

```ts
type ApiResponse = SuccessResponse | ErrorResponse;
```

---

Meaning:

```text
API can return either:

Success Response

OR

Error Response
```

---

### Literal Types

Literal Types are often combined with unions.

---

Example

```ts
let status: "loading" | "success" | "error";
```

---

Valid

```ts
status = "loading";
```

---

Valid

```ts
status = "success";
```

---

Invalid

```ts
status = "pending";
```

Error.

---

### Why Are Literal Unions Useful?

They restrict values.

---

Without Union

```ts
let status: string;
```

Any string allowed.

---

Valid

```ts
status = "random";
```

---

With Literal Union

```ts
let status: "loading" | "success" | "error";
```

Only three values allowed.

---

Much safer.

---

### Real World Example

Request State

```ts
type RequestStatus = "idle" | "loading" | "success" | "error";
```

---

Usage

```ts
let state: RequestStatus;
```

---

Valid

```ts
state = "loading";
```

---

Invalid

```ts
state = "completed";
```

---

### Union Type Aliases

Very common.

---

Instead of:

```ts
let id: string | number;
```

everywhere,

create:

```ts
type ID = string | number;
```

---

Usage

```ts
let userId: ID;
```

---

Cleaner.

---

### Optional Properties Internally Use Union Types

This is a very important connection.

---

When you write:

```ts
type User = {
  age?: number;
};
```

TypeScript internally treats it like:

```ts
type User = {
  age: number | undefined;
};
```

---

Meaning:

```text
Optional Properties
are implemented using
Union Types.
```

---

### Common Mistakes

---

#### Using any Instead of Union

Bad

```ts
let value: any;
```

---

Good

```ts
let value: string | number;
```

---

### Assuming All Methods Exist

Wrong

```ts
let value: string | number;

value.toUpperCase();
```

---

TypeScript error.

---

Must narrow first.

---

### Overusing Large Unions

Bad

```ts
string | number | boolean | null | undefined | object;
```

---

Can become difficult to maintain.

---

Prefer meaningful aliases.

---

### Interview Questions

---

#### Q1

What is a Union Type?

#### Answer

```text
A type that allows a value
to be one of several types.
```

---

#### Q2

What does `|` mean?

#### Answer

```text
OR
```

between types.

---

#### Q3

Difference between:

```ts
string | number[]
```

and

```ts
(string | number)[]
```

#### Answer

```ts
string | number[]
```

means:

```text
string OR number array
```

---

```ts
(string | number)[]
```

means:

```text
array containing strings and numbers
```

---

#### Q4

Why are Literal Unions useful?

#### Answer

They restrict values to a predefined set.

---

#### Q5

How are Optional Properties related to Union Types?

#### Answer

```ts
age?: number
```

internally behaves like:

```ts
age: number | undefined;
```

---

### Cheat Sheet

```ts
let value: string | number;
```

---

```ts
let user: User | null;
```

---

```ts
let username: string | undefined;
```

---

```ts
type ID = string | number;
```

---

```ts
type Status = "loading" | "success" | "error";
```

---

```ts
(string | number)[]
```

---

```ts
string | number[]
```

---

### Key Takeaways

- Union Types allow values to belong to multiple possible types.
- The `|` operator means "OR" between types.
- Union Types are heavily used in APIs and real-world applications.
- Literal Unions restrict values to specific allowed options.
- Arrays can also contain Union Types.
- Objects can be combined using Union Types.
- Optional properties internally use Union Types with `undefined`.
- TypeScript prevents unsafe operations on unions until they are narrowed.
- Union Types provide flexibility without sacrificing type safety.
- Understanding unions is essential before learning Type Narrowing and Discriminated Unions.
