# Utility Types

> As applications grow larger, we often need slightly modified versions of existing types.
>
> Example:
>
> ```text
> User Type
> ```
>
> but sometimes we need:
>
> ```text
> User Creation Type
> User Update Type
> User Public Profile Type
> Readonly User Type
> ```
>
> Creating separate types manually becomes repetitive.
>
> TypeScript solves this using:
>
> ```text
> Utility Types
> ```
>
> Utility Types are built-in generic types that help transform existing types into new types.

---

### What are Utility Types?

Utility Types are:

```text
Built-in TypeScript helper types
```

used to create new types from existing types.

---

Instead of:

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

and manually creating:

```ts
type UpdateUser = {
  id?: number;
  name?: string;
  email?: string;
};
```

TypeScript can generate it automatically.

---

### Why Utility Types Exist?

Without utility types:

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

---

Now imagine:

```ts
CreateUser;
UpdateUser;
PublicUser;
ReadonlyUser;
```

You would constantly duplicate types.

---

Problems:

```text
Code Duplication
Maintenance Issues
Inconsistency
```

---

Utility Types solve this.

---

### Most Important Utility Types

For interviews and real projects:

```ts
Partial<T>;
Required<T>;
Readonly<T>;
Pick<T, K>;
Omit<T, K>;
```

are the most important.

---

### Base Type

We'll use this type throughout the chapter.

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

---

### Partial<T>

---

#### Definition

Makes:

```text
All Properties Optional
```

---

#### Syntax

```ts
Partial<Type>;
```

---

### Example

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

---

```ts
type UpdateUser = Partial<User>;
```

---

Generated Type

```ts
{
  id?: number;
  name?: string;
  email?: string;
}
```

---

### Usage

```ts
const updateData: UpdateUser = {
  name: "Prashant",
};
```

Valid.

---

Only one property provided.

---

### Why is Partial Useful?

Common API Endpoint:

```http
PATCH /users/1
```

---

User updates:

```ts
{
  name: "John";
}
```

Not entire object.

---

Partial perfectly models this.

---

### Required<T>

---

#### Definition

Makes:

```text
All Properties Required
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

```ts
type CompleteUser = Required<User>;
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

### Usage

Valid

```ts
const user: CompleteUser = {
  id: 1,
  name: "Prashant",
};
```

---

Invalid

```ts
const user: CompleteUser = {
  id: 1,
};
```

Error.

---

### Why Use Required?

Useful when:

```text
Validation Completed
```

and data is guaranteed to exist.

---

Example:

```ts
DraftUser;
```

↓

```ts
ValidatedUser;
```

---

### Readonly<T>

---

#### Definition

Makes every property:

```text
Read Only
```

---

### Example

```ts
type User = {
  id: number;
  name: string;
};
```

---

```ts
type ReadonlyUser = Readonly<User>;
```

---

Generated Type

```ts
{
  readonly id: number;
  readonly name: string;
}
```

---

### Usage

```ts
const user: ReadonlyUser = {
  id: 1,
  name: "Prashant",
};
```

---

Attempt:

```ts
user.name = "John";
```

Error.

---

```text
Cannot assign to readonly property
```

---

### Why Use Readonly?

Protects objects from accidental modification.

---

Common examples:

```text
Configuration Objects
Environment Variables
Application Settings
API Response Models
```

---

### Pick<T, K>

---

#### Definition

Selects specific properties from a type.

---

#### Syntax

```ts
Pick<Type, Keys>;
```

---

### Example

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

---

```ts
type UserPreview = Pick<User, "id" | "name">;
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

### Usage

```ts
const preview: UserPreview = {
  id: 1,
  name: "Prashant",
};
```

---

### Why Use Pick?

Often we don't need the entire object.

---

Example:

```text
User Card Component
```

needs:

```ts
id;
name;
```

only.

---

Not:

```ts
email;
address;
password;
```

---

### Pick Multiple Properties

```ts
type PublicUser = Pick<User, "id" | "name" | "email">;
```

---

### Omit<T, K>

---

#### Definition

Removes properties from a type.

---

#### Syntax

```ts
Omit<Type, Keys>;
```

---

### Example

```ts
type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};
```

---

```ts
type PublicUser = Omit<User, "password">;
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

### Why Use Omit?

Very common in APIs.

---

Database Model

```ts
{
  id;
  name;
  email;
  password;
}
```

---

API Response

```ts
{
  id;
  name;
  email;
}
```

---

Never expose:

```text
password
```

---

### Pick vs Omit

---

#### Pick

Choose what you want.

```ts
Pick<User, "id" | "name">;
```

---

#### Omit

Remove what you don't want.

```ts
Omit<User, "password">;
```

---

### Real World Example

---

Database Entity

```ts
type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};
```

---

Create API Response

```ts
type PublicUser = Omit<User, "password">;
```

---

Result

```ts
{
  id: number;
  name: string;
  email: string;
}
```

---

Much safer.

---

### Combining Utility Types

Utility Types can be combined.

---

### Example

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

---

```ts
type UpdateUser = Partial<Pick<User, "name" | "email">>;
```

---

Generated

```ts
{
  name?: string;
  email?: string;
}
```

---

### Another Example

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

---

```ts
type ReadonlyPublicUser = Readonly<Omit<User, "email">>;
```

---

Generated

```ts
{
  readonly id: number;
  readonly name: string;
}
```

---

### Visual Summary

---

Base Type

```ts
type User = {
  id: number;
  name: string;
  email: string;
};
```

---

Partial

```ts
{
  id?: number;
  name?: string;
  email?: string;
}
```

---

Required

```ts
{
  id: number;
  name: string;
  email: string;
}
```

---

Readonly

```ts
{
  readonly id: number;
  readonly name: string;
  readonly email: string;
}
```

---

Pick

```ts
Pick<User, "id" | "name">;
```

↓

```ts
{
  id: number;
  name: string;
}
```

---

Omit

```ts
Omit<User, "email">;
```

↓

```ts
{
  id: number;
  name: string;
}
```

---

### Common Mistakes

---

#### Confusing Pick and Omit

Wrong mental model:

```text
Pick removes properties
```

No.

---

```text
Pick selects properties.
```

---

#### Assuming Readonly is Runtime Protection

Wrong.

```ts
Readonly<User>;
```

works only during:

```text
Compile Time
```

---

Generated JavaScript has:

```text
No Readonly Enforcement
```

---

#### Overusing Partial

Bad

```ts
Partial<User>;
```

everywhere.

---

Use it only when:

```text
Data may be incomplete.
```

---

### Interview Questions

---

#### Q1

What does Partial<T> do?

#### Answer

```text
Makes all properties optional.
```

---

#### Q2

What does Required<T> do?

#### Answer

```text
Makes all properties required.
```

---

#### Q3

Difference between Pick and Omit?

#### Answer

```text
Pick selects properties.

Omit removes properties.
```

---

#### Q4

What does Readonly<T> do?

#### Answer

```text
Makes all properties immutable.
```

---

#### Q5

Can Utility Types be combined?

#### Answer

Yes.

Example:

```ts
Readonly<Partial<User>>;
```

---

### Cheat Sheet

```ts
Partial<User>;
```

↓

```ts
{
  id?: number;
  name?: string;
}
```

---

```ts
Required<User>;
```

↓

```ts
{
  id: number;
  name: string;
}
```

---

```ts
Readonly<User>;
```

↓

```ts
{
  readonly id: number;
}
```

---

```ts
Pick<User, "id" | "name">;
```

---

```ts
Omit<User, "password">;
```

---

### Key Takeaways

- Utility Types generate new types from existing types.
- They reduce duplication and improve maintainability.
- `Partial<T>` makes all properties optional.
- `Required<T>` makes all properties mandatory.
- `Readonly<T>` prevents property reassignment.
- `Pick<T, K>` selects specific properties.
- `Omit<T, K>` removes specific properties.
- Utility Types can be combined together.
- They are heavily used in APIs, React applications and backend systems.
- Understanding these five utility types is essential for professional TypeScript development.
