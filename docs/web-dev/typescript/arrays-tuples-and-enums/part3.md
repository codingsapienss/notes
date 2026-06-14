# Enums

> Enums (Enumerations) allow us to define a fixed set of named constants.
>
> Instead of remembering:
>
> ```ts
> 0;
> 1;
> 2;
> ```
>
> we can use:
>
> ```ts
> Status.Pending;
> Status.Success;
> Status.Failed;
> ```
>
> making code:
>
> ```text
> More Readable
> More Maintainable
> Less Error-Prone
> ```

---

### What is an Enum?

An Enum is a special TypeScript feature that groups related constant values together.

---

#### Example

```ts
enum Status {
  Pending,
  Success,
  Failed,
}
```

---

Now we can write:

```ts
const currentStatus = Status.Success;
```

instead of:

```ts
const currentStatus = 1;
```

---

### Why Do We Need Enums?

Without Enums:

```ts
const STATUS_PENDING = 0;
const STATUS_SUCCESS = 1;
const STATUS_FAILED = 2;
```

---

Usage:

```ts
if(status === 1)
```

---

Question:

```text
What does 1 mean?
```

Not obvious.

---

With Enum:

```ts
if(status === Status.Success)
```

Immediately clear.

---

### Numeric Enums

Default enum type.

---

#### Example

```ts
enum Status {
  Pending,
  Success,
  Failed,
}
```

---

TypeScript automatically assigns:

```ts
enum Status {
  Pending = 0,
  Success = 1,
  Failed = 2,
}
```

---

### Accessing Enum Values

---

Example

```ts
enum Status {
  Pending,
  Success,
  Failed,
}
```

---

Usage

```ts
console.log(Status.Pending);
```

Output:

```text
0
```

---

```ts
console.log(Status.Success);
```

Output:

```text
1
```

---

### Custom Numeric Values

You can specify values manually.

---

Example

```ts
enum Status {
  Pending = 100,
  Success = 200,
  Failed = 500,
}
```

---

Usage

```ts
console.log(Status.Success);
```

Output:

```text
200
```

---

### Auto Increment Behavior

---

Example

```ts
enum Status {
  Pending = 10,
  Success,
  Failed,
}
```

---

Generated Values

```ts
Pending = 10;
Success = 11;
Failed = 12;
```

---

TypeScript automatically increments.

---

### Reverse Mapping

Unique feature of Numeric Enums.

---

Example

```ts
enum Status {
  Pending,
  Success,
  Failed,
}
```

---

Forward Mapping

```ts
Status.Success;
```

Output:

```text
1
```

---

Reverse Mapping

```ts
Status[1];
```

Output:

```text
"Success"
```

---

Example

```ts
console.log(Status[2]);
```

Output:

```text
Failed
```

---

### String Enums

Instead of numbers, use strings.

---

Example

```ts
enum Status {
  Pending = "PENDING",
  Success = "SUCCESS",
  Failed = "FAILED",
}
```

---

Usage

```ts
console.log(Status.Success);
```

Output:

```text
SUCCESS
```

---

### Why String Enums?

More readable.

---

Compare:

```text
1
```

vs

```text
SUCCESS
```

---

When debugging:

```text
SUCCESS
```

is much easier to understand.

---

### Real World Example

API Status

```ts
enum ApiStatus {
  Loading = "LOADING",
  Success = "SUCCESS",
  Error = "ERROR",
}
```

---

Usage

```ts
let status = ApiStatus.Loading;
```

---

Check

```ts
if (status === ApiStatus.Success) {
  console.log("Done");
}
```

---

### Heterogeneous Enums

Mixing strings and numbers.

---

Example

```ts
enum Result {
  Success = 1,
  Failed = "FAILED",
}
```

---

Technically valid.

---

Not recommended.

---

Why?

```text
Inconsistent
Confusing
Harder to Maintain
```

---

### Enum as a Type

Enums create both:

```text
Value
```

and

```text
Type
```

---

Example

```ts
enum Status {
  Pending,
  Success,
  Failed,
}
```

---

Variable

```ts
let currentStatus: Status;
```

---

Valid

```ts
currentStatus = Status.Success;
```

---

### Invalid Assignment

```ts
currentStatus = 100;
```

Usually invalid in strict codebases.

---

Prefer enum values.

---

### Enum in Functions

---

Example

```ts
enum Role {
  Admin,
  User,
  Guest,
}
```

---

Function

```ts
function login(role: Role) {
  console.log(role);
}
```

---

Call

```ts
login(Role.Admin);
```

Valid.

---

### Real World Example

User Roles

```ts
enum UserRole {
  Admin,
  Manager,
  Employee,
}
```

---

Usage

```ts
const role = UserRole.Admin;
```

---

Check

```ts
if (role === UserRole.Admin) {
  console.log("Full Access");
}
```

---

### Const Enums

Optimization feature.

---

Example

```ts
const enum Status {
  Pending,
  Success,
  Failed,
}
```

---

Usage

```ts
const status = Status.Success;
```

---

Generated JavaScript:

```js
const status = 1;
```

---

No Enum Object Created.

---

Benefits:

```text
Smaller Bundle
Faster Execution
```

---

### Normal Enum Compilation

TypeScript

```ts
enum Status {
  Pending,
  Success,
}
```

---

Generated JavaScript

```js
var Status;

(function (Status) {
  Status[(Status["Pending"] = 0)] = "Pending";

  Status[(Status["Success"] = 1)] = "Success";
})(Status || (Status = {}));
```

---

Notice:

```text
Extra JavaScript Object Created
```

---

### Const Enum Compilation

TypeScript

```ts
const enum Status {
  Pending,
  Success,
}
```

---

Generated JavaScript

```js
const status = 1;
```

---

No runtime object.

---

### Enum vs Union Literal Types

Modern TypeScript often prefers:

```ts
type Status = "pending" | "success" | "failed";
```

instead of:

```ts
enum Status {
  Pending,
  Success,
  Failed,
}
```

---

### Enum Version

```ts
enum Status {
  Pending,
  Success,
  Failed,
}
```

Usage:

```ts
Status.Success;
```

---

### Union Literal Version

```ts
type Status = "pending" | "success" | "failed";
```

Usage:

```ts
const status: Status = "success";
```

---

### Why Many Developers Prefer Literal Unions?

Benefits:

```text
Less Generated Code
Better Type Inference
More Flexible
Works Better With APIs
```

---

Modern codebases often use:

```ts
Union Literal Types
```

instead of Enums.

---

### When Should You Use Enums?

Good Use Cases:

```text
Status Codes
User Roles
Application States
Configuration Constants
```

---

Examples

```ts
Role.Admin;
Role.Manager;
Role.Employee;
```

---

### When Should You Avoid Enums?

If simple strings work:

```ts
type Status = "pending" | "success" | "failed";
```

Often preferred.

---

### Common Mistakes

---

#### Mixing String and Numeric Enums

Bad

```ts
enum Status {
  Pending = 0,
  Success = "SUCCESS",
}
```

---

Avoid.

---

#### Using Magic Numbers

Bad

```ts
if(status === 1)
```

---

Use:

```ts
if(
  status ===
  Status.Success
)
```

---

#### Forgetting String Enums Don't Have Reverse Mapping

---

Numeric Enum

```ts
Status[1];
```

Works.

---

String Enum

```ts
Status["SUCCESS"];
```

Does NOT reverse map.

---

### Numeric vs String Enum

| Feature         | Numeric Enum | String Enum |
| --------------- | ------------ | ----------- |
| Auto Increment  | ✅           | ❌          |
| Reverse Mapping | ✅           | ❌          |
| Readability     | Medium       | High        |
| Debugging       | Medium       | Excellent   |

---

### Interview Questions

---

#### Q1

What is an Enum?

#### Answer

```text
A collection of named constants.
```

---

#### Q2

What value does this generate?

```ts
enum Status {
  Pending,
  Success,
  Failed,
}
```

#### Answer

```ts
Pending = 0;
Success = 1;
Failed = 2;
```

---

#### Q3

What is Reverse Mapping?

#### Answer

```ts
Status[1];
```

returns:

```text
"Success"
```

for numeric enums.

---

#### Q4

Difference between String and Numeric Enums?

#### Answer

```text
Numeric Enums:
Auto Increment + Reverse Mapping

String Enums:
More Readable
No Reverse Mapping
```

---

#### Q5

What is a Const Enum?

#### Answer

```text
An enum removed during compilation
for better performance.
```

---

### Cheat Sheet

```ts
enum Status {
  Pending,
  Success,
  Failed,
}
```

---

```ts
enum Status {
  Pending = "PENDING",
  Success = "SUCCESS",
}
```

---

```ts
Status.Success;
```

---

```ts
Status[1];
```

---

```ts
const enum Status {
  Pending,
  Success,
}
```

---

```ts
type Status = "pending" | "success" | "failed";
```

---

### Key Takeaways

- Enums group related constants together.
- Numeric enums start from `0` by default.
- Numeric enums support reverse mapping.
- String enums are more readable and common in APIs.
- Const enums improve performance by removing runtime objects.
- Enums can be used as both values and types.
- Modern TypeScript often prefers Union Literal Types over Enums.
- Avoid heterogeneous enums.
- Use enums when you need named constants with strong semantics.
- Understanding enums is important for interviews and legacy TypeScript codebases.
