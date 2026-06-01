# Advanced Utility Types (`Record`, `Exclude`, `Extract`, `NonNullable`)

> In this chapter, we'll cover additional utility types frequently used in:
>
> - APIs
> - React Applications
> - Backend Systems
> - Enterprise TypeScript Codebases

---

# 1. Record<K, T>

One of the most useful utility types.

---

## Problem

Suppose we want:

```ts
const roles = {
  admin: "Full Access",
  user: "Limited Access",
  guest: "Read Only",
};
```

---

We can type it manually:

```ts
type Roles = {
  admin: string;
  user: string;
  guest: string;
};
```

---

But TypeScript provides:

```ts
Record<K, T>;
```

---

## Syntax

```ts
Record<Keys, ValueType>;
```

---

## Example

```ts
type Roles = Record<"admin" | "user" | "guest", string>;
```

---

Generated Type

```ts
{
  admin: string;
  user: string;
  guest: string;
}
```

---

Usage

```ts
const roles: Roles = {
  admin: "Full Access",
  user: "Limited Access",
  guest: "Read Only",
};
```

---

## Real World Example

```ts
type UserCache = Record<number, string>;
```

---

Result

```ts
{
  [id: number]: string;
}
```

---

Usage

```ts
const cache: UserCache = {
  1: "Prashant",
  2: "John",
};
```

---

# 2. Exclude<T, U>

Used to remove types from a union.

---

## Example

```ts
type Role = "admin" | "user" | "guest";
```

---

Remove Guest

```ts
type ActiveRole = Exclude<Role, "guest">;
```

---

Result

```ts
"admin" | "user";
```

---

Visualization

```text
admin
user
guest
```

Remove:

```text
guest
```

Result:

```text
admin
user
```

---

# Real World Example

```ts
type Status = "loading" | "success" | "error";
```

---

```ts
type CompletedStatus = Exclude<Status, "loading">;
```

---

Result

```ts
"success" | "error";
```

---

# 3. Extract<T, U>

Opposite of Exclude.

---

Keeps matching values.

---

## Example

```ts
type Role = "admin" | "user" | "guest";
```

---

```ts
type Allowed = Extract<Role, "admin" | "user">;
```

---

Result

```ts
"admin" | "user";
```

---

Visualization

Original

```text
admin
user
guest
```

Keep

```text
admin
user
```

Result

```text
admin
user
```

---

# Real World Example

```ts
type EventType = "click" | "scroll" | "keydown";
```

---

```ts
type MouseEvents = Extract<EventType, "click">;
```

---

Result

```ts
"click";
```

---

# 4. NonNullable<T>

Removes:

```ts
null;
undefined;
```

from a type.

---

## Example

```ts
type UserName = string | null | undefined;
```

---

Transform

```ts
type SafeUserName = NonNullable<UserName>;
```

---

Result

```ts
string;
```

---

Visualization

Before

```ts
string | null | undefined;
```

---

After

```ts
string;
```

---

# Real World Example

API Response

```ts
type ApiUser = User | null;
```

---

After Validation

```ts
type ValidUser = NonNullable<ApiUser>;
```

---

Result

```ts
User;
```

---

# Combining Utility Types

---

Example

```ts
type User = {
  id: number;
  name: string;
  password: string;
};
```

---

Safe Response

```ts
type SafeUser = Omit<User, "password">;
```

---

Partial Update

```ts
type UpdateUser = Partial<SafeUser>;
```

---

Result

```ts
{
  id?: number;
  name?: string;
}
```

---

# Real World API Example

```ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
}
```

---

User Response

```ts
type User = {
  id: number;
  name: string;
};
```

---

```ts
const response: ApiResponse<User> = {
  success: true,
  data: {
    id: 1,
    name: "Prashant",
  },
};
```

---

This combines:

```text
Generics
+
Utility Types
+
Type Safety
```

---

# Common Interview Questions

---

## Q1

What does Record<K,T> do?

### Answer

```text
Creates an object type
with specified keys and values.
```

---

## Q2

What does Exclude<T,U> do?

### Answer

```text
Removes matching types
from a union.
```

---

## Q3

What does Extract<T,U> do?

### Answer

```text
Keeps matching types
from a union.
```

---

## Q4

What does NonNullable<T> do?

### Answer

```text
Removes null and undefined.
```

---

## Q5

Which utility type is used for object dictionaries?

### Answer

```ts
Record<K, T>;
```

---

# Cheat Sheet

```ts
Record<K, T>;
```

↓

```ts
{
  [key: K]: T
}
```

---

```ts
Exclude<T, U>;
```

↓

```text
Remove Types
```

---

```ts
Extract<T, U>;
```

↓

```text
Keep Matching Types
```

---

```ts
NonNullable<T>;
```

↓

```text
Remove null | undefined
```

---

```ts
Partial<T>;
```

↓

```text
All Optional
```

---

```ts
Required<T>;
```

↓

```text
All Required
```

---

```ts
Pick<T, K>;
```

↓

```text
Select Fields
```

---

```ts
Omit<T, K>;
```

↓

```text
Remove Fields
```

---

# Key Takeaways

- `Record<K, T>` creates strongly typed object maps.
- `Exclude<T, U>` removes values from unions.
- `Extract<T, U>` keeps matching values from unions.
- `NonNullable<T>` removes `null` and `undefined`.
- Utility types are built using generics and conditional typing internally.
- These types are heavily used in React, APIs, repositories, and backend applications.
- Combining utility types creates powerful reusable type transformations.
- Mastering utility types significantly improves TypeScript productivity.

---


---\n*Last refined on April 20, 2026*


---\n*Last refined on April 22, 2026*


---\n*Last refined on April 25, 2026*


---\n*Last refined on April 25, 2026*
