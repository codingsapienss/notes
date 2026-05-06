# Utility Types + Generics

> Now we are ready to understand one of the most powerful features of TypeScript:
>
> ```text
> Utility Types
> ```
>
> Utility Types are built-in generic types provided by TypeScript that help us:
>
> - Reuse types
> - Transform types
> - Avoid duplication
> - Build scalable applications
>
> Most utility types are implemented internally using:
>
> ```ts
> Generics
> + keyof
> + Mapped Types
> ```
>
> Utility Types are heavily used in:
>
> - React
> - Angular
> - NestJS
> - Express
> - APIs
> - Enterprise Applications

---

### What Are Utility Types?

Utility Types are:

```text
Pre-built Generic Types
```

provided by TypeScript.

---

Instead of writing:

```ts
New Types
Again and Again
```

we can transform existing types.

---

Example

```ts
type User = {
  id: number;

  name: string;

  age: number;
};
```

---

Using Utility Types we can create:

```text
Optional User
Readonly User
Partial User
Selected User Fields
Excluded User Fields
```

without rewriting everything.

---

### 1. Partial<T>

One of the most used utility types.

---

### Problem

Suppose:

```ts
type User = {
  id: number;

  name: string;

  age: number;
};
```

---

Normally:

```ts
const user: User = {
  id: 1,
};
```

Error.

---

Because:

```text
name missing
age missing
```

---

### Partial Solution

```ts
type PartialUser = Partial<User>;
```

---

Generated Type

```ts
{
  id?: number;

  name?: string;

  age?: number;
}
```

---

All properties become:

```text
Optional
```

---

Usage

```ts
const user: Partial<User> = {
  id: 1,
};
```

Valid.

---

### How Partial Works Internally

Conceptually:

```ts
type Partial<T> = {
  [K in keyof T]?: T[K];
};
```

---

Meaning:

```text
Loop through all keys
and make them optional
```

---

### Real World Example

Update API

---

Original

```ts
type User = {
  id: number;

  name: string;

  age: number;
};
```

---

Update Request

```ts
function updateUser(userId: number, updates: Partial<User>) {}
```

---

Usage

```ts
updateUser(1, {
  name: "John",
});
```

Only changed fields required.

---

### 2. Required<T>

Opposite of:

```ts
Partial<T>;
```

---

### Example

```ts
type User = {
  id?: number;

  name?: string;
};
```

---

Transform

```ts
type FullUser = Required<User>;
```

---

Generated Type

```ts
{
  id: number;

  name: string;
}
```

---

All optional properties become:

```text
Required
```

---

Usage

```ts
const user: Required<User> = {
  id: 1,

  name: "Prashant",
};
```

---

Missing fields:

```ts
❌ Error
```

---

### Internal Idea

```ts
type Required<T> = {
  [K in keyof T]-?: T[K];
};
```

---

Meaning:

```text
Remove optional marker (?)
```

---

### Real World Example

After Database Save

---

Before Save

```ts
Partial<User>;
```

---

After Save

```ts
Required<User>;
```

because database guarantees all fields exist.

---

### 3. Pick<T, K>

One of the most important utility types.

---

### Problem

Suppose:

```ts
type User = {
  id: number;

  name: string;

  age: number;

  email: string;
};
```

---

Need only:

```text
id
name
```

---

Without Pick

```ts
type UserSummary = {
  id: number;

  name: string;
};
```

---

Duplicate code.

---

### Pick Solution

```ts
type UserSummary = Pick<User, "id" | "name">;
```

---

Generated Type

```ts
{
  id: number;

  name: string;
}
```

---

Usage

```ts
const user: UserSummary = {
  id: 1,

  name: "Prashant",
};
```

---

### Visualizing Pick

Original

```ts
User;
```

```text
id
name
age
email
```

---

Pick

```ts
Pick<User, "id" | "name">;
```

↓

```text
id
name
```

---

### Real World Example

API Response

---

Database User

```ts
{
  id;
  name;
  email;
  password;
}
```

---

Frontend User

```ts
Pick<User, "id" | "name">;
```

---

Password never exposed.

---

### 4. Omit<T, K>

Opposite of Pick.

---

### Problem

Need everything except:

```text
password
```

---

Original

```ts
type User = {
  id: number;

  name: string;

  email: string;

  password: string;
};
```

---

Solution

```ts
type SafeUser = Omit<User, "password">;
```

---

Generated Type

```ts
{
  id: number;

  name: string;

  email: string;
}
```

---

Password removed.

---

### Visualizing Omit

Original

```text
id
name
email
password
```

---

Omit

```ts
Omit<User, "password">;
```

↓

```text
id
name
email
```

---

### Real World Example

Backend Response

---

Database Entity

```ts
User;
```

contains:

```text
password
refreshToken
```

---

API Response

```ts
Omit<User, "password" | "refreshToken">;
```

---

Much safer.

---

### Combining Utility Types

Extremely common.

---

Example

```ts
type User = {
  id: number;

  name: string;

  email: string;

  age: number;
};
```

---

Create

```ts
type UpdateUser = Partial<Pick<User, "name" | "email">>;
```

---

Generated Type

```ts
{
  name?:string;

  email?:string;
}
```

---

Very common in:

```text
PATCH APIs
Update Forms
```

---

### Utility Types + Generics

Suppose we create:

```ts
function updateEntity<T>(updates: Partial<T>) {}
```

---

Usage

```ts
updateEntity<User>({
  name: "John",
});
```

---

Type-safe.

Reusable.

---

### Generic Repository Example

```ts
class Repository<T> {
  update(id: number, updates: Partial<T>) {}
}
```

---

Usage

```ts
repo.update(1, {
  name: "Prashant",
});
```

---

Only modified fields required.

---

### API Example

```ts
interface ApiResponse<T> {
  success: boolean;

  data: T;
}
```

---

User Response

```ts
ApiResponse<Pick<User, "id" | "name">>;
```

---

Result

```ts
{
  success:true,

  data:{
    id:1,
    name:"Prashant"
  }
}
```

---

### Utility Types Interview Pattern

Question:

```text
Need all fields optional?
```

Answer:

```ts
Partial<T>;
```

---

Question:

```text
Need all fields required?
```

Answer:

```ts
Required<T>;
```

---

Question:

```text
Need only specific fields?
```

Answer:

```ts
Pick<T, K>;
```

---

Question:

```text
Need everything except some fields?
```

Answer:

```ts
Omit<T, K>;
```

---

### Common Mistakes

---

#### Creating Duplicate Types

Bad

```ts
type UserSummary = {
  id: number;
  name: string;
};
```

---

Better

```ts
Pick<User, "id" | "name">;
```

---

#### Using any

Bad

```ts
data: any;
```

---

Prefer

```ts
ApiResponse<T>;
```

---

#### Rewriting Update Types

Bad

```ts
type UpdateUser = {
  name?: string;
  age?: number;
};
```

---

Better

```ts
Partial<User>;
```

---

### Interview Questions

---

#### Q1

What is Partial<T>?

#### Answer

```text
Makes all properties optional.
```

---

#### Q2

What is Required<T>?

#### Answer

```text
Makes all properties required.
```

---

#### Q3

What is Pick<T,K>?

#### Answer

```text
Selects specific properties.
```

---

#### Q4

What is Omit<T,K>?

#### Answer

```text
Removes specific properties.
```

---

#### Q5

Why are Utility Types important?

#### Answer

```text
They reduce duplication
and improve reusability.
```

---

### Cheat Sheet

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

```ts
Partial<Pick<User, "name">>;
```

---

```ts
Omit<User, "password">;
```

---

### Key Takeaways

- Utility Types are built-in generic helpers.
- `Partial<T>` makes all properties optional.
- `Required<T>` makes all properties required.
- `Pick<T,K>` selects specific properties.
- `Omit<T,K>` removes specific properties.
- Utility Types are built using Generics and `keyof`.
- They eliminate duplicate type definitions.
- Utility Types are heavily used in APIs, forms, repositories and enterprise applications.
- Combining Utility Types creates powerful reusable type transformations.
- Mastering Utility Types is essential for professional TypeScript development.
