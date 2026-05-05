# Generic Interfaces

> In previous chapter, we learned how Generic Functions allow us to write reusable and type-safe functions.
>
> However, Generics are not limited to functions.
>
> We can also create:
>
> ```text
> Generic Interfaces
> ```
>
> which allow interfaces to work with multiple data types while maintaining strong type safety.
>
> Generic Interfaces are heavily used in:
>
> - API Responses
> - React Components
> - Repositories
> - Database Layers
> - Collections
> - Enterprise Applications

---

### The Problem Before Generic Interfaces

Suppose we want an API response interface.

---

For Users

```ts
interface UserResponse {
  success: boolean;

  data: {
    id: number;
    name: string;
  };
}
```

---

For Products

```ts
interface ProductResponse {
  success: boolean;

  data: {
    id: number;
    title: string;
    price: number;
  };
}
```

---

Problem:

```text
Duplicate Structure
```

Only:

```text
data
```

changes.

---

Everything else remains the same.

---

### Generic Interface Solution

Instead of repeating:

```ts
UserResponse;
ProductResponse;
OrderResponse;
```

we can create:

```ts
interface ApiResponse<T>
```

---

### What is a Generic Interface?

A Generic Interface is:

```text
An Interface
that accepts Type Parameters.
```

---

Syntax

```ts
interface Name<T> {}
```

---

Here:

```ts
T;
```

is a:

```text
Type Placeholder
```

---

### First Generic Interface

```ts
interface ApiResponse<T> {
  success: boolean;

  data: T;
}
```

---

Notice:

```ts
data: T;
```

---

Type of data is now:

```text
Flexible
```

---

### Using Generic Interface

---

User Type

```ts
type User = {
  id: number;

  name: string;
};
```

---

Response

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

TypeScript replaces:

```ts
T;
```

with:

```ts
User;
```

---

Generated Type

```ts
{
  success: boolean;

  data: User;
}
```

---

### Another Example

Product Type

```ts
type Product = {
  id: number;

  title: string;

  price: number;
};
```

---

Response

```ts
const response: ApiResponse<Product> = {
  success: true,

  data: {
    id: 1,
    title: "Laptop",
    price: 50000,
  },
};
```

---

Same interface.

Different data type.

---

### Visualizing Generic Interfaces

Interface

```ts
interface Box<T> {
  value: T;
}
```

---

Usage

```ts
Box<string>;
```

becomes:

```ts
{
  value: string;
}
```

---

Usage

```ts
Box<number>;
```

becomes:

```ts
{
  value: number;
}
```

---

### Generic Interface with Arrays

---

Example

```ts
interface ApiResponse<T> {
  success: boolean;

  data: T[];
}
```

---

User Type

```ts
type User = {
  id: number;

  name: string;
};
```

---

Usage

```ts
const response: ApiResponse<User> = {
  success: true,

  data: [
    {
      id: 1,
      name: "Prashant",
    },
  ],
};
```

---

Generated Type

```ts
{
  success: boolean;

  data: User[];
}
```

---

### Multiple Generic Parameters

Generic Interfaces can have multiple type parameters.

---

Syntax

```ts
interface Pair<T, U> {}
```

---

Example

```ts
interface Pair<T, U> {
  first: T;

  second: U;
}
```

---

Usage

```ts
const pair: Pair<string, number> = {
  first: "Age",

  second: 25,
};
```

---

Generated Type

```ts
{
  first: string;

  second: number;
}
```

---

### Generic Key-Value Example

---

Interface

```ts
interface KeyValue<K, V> {
  key: K;

  value: V;
}
```

---

Usage

```ts
const item: KeyValue<string, number> = {
  key: "age",

  value: 25,
};
```

---

Result

```ts
{
  key: string;

  value: number;
}
```

---

### Generic Interfaces with Functions

Interfaces can define generic function structures.

---

Example

```ts
interface Processor<T> {
  process(value: T): T;
}
```

---

Implementation

```ts
class StringProcessor implements Processor<string> {
  process(value: string) {
    return value.toUpperCase();
  }
}
```

---

Usage

```ts
const processor = new StringProcessor();

console.log(processor.process("hello"));
```

Output

```text
HELLO
```

---

### Generic Interfaces with Classes

Very common.

---

Interface

```ts
interface Repository<T> {
  getById(id: number): T;

  save(item: T): void;
}
```

---

Implementation

```ts
type User = {
  id: number;

  name: string;
};
```

---

```ts
class UserRepository implements Repository<User> {
  getById(id: number) {
    return {
      id,
      name: "Prashant",
    };
  }

  save(user: User) {
    console.log("Saved", user);
  }
}
```

---

This pattern is used extensively in:

```text
Backend Systems
ORMs
Repository Pattern
```

---

### Real World API Response Model

One of the most important examples.

---

Without Generics

```ts
interface UserResponse {}
interface ProductResponse {}
interface OrderResponse {}
```

---

With Generics

```ts
interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}
```

---

User

```ts
type User = {
  id: number;

  name: string;
};
```

---

Usage

```ts
const response: ApiResponse<User> = {
  success: true,

  message: "Success",

  data: {
    id: 1,
    name: "Prashant",
  },
};
```

---

Product

```ts
type Product = {
  id: number;

  title: string;
};
```

---

Usage

```ts
const productResponse: ApiResponse<Product> = {
  success: true,

  message: "Success",

  data: {
    id: 1,
    title: "Laptop",
  },
};
```

---

Huge code reuse.

---

### Generic Collection Example

---

Interface

```ts
interface Collection<T> {
  items: T[];

  add(item: T): void;
}
```

---

Implementation

```ts
class UserCollection implements Collection<string> {
  items: string[] = [];

  add(item: string) {
    this.items.push(item);
  }
}
```

---

Usage

```ts
const users = new UserCollection();

users.add("Prashant");
```

---

Type-safe collection.

---

### Generic Interfaces vs Generic Functions

---

Generic Function

```ts
function identity<T>(value: T): T;
```

---

Purpose:

```text
Reusable Function
```

---

Generic Interface

```ts
interface Box<T>
```

---

Purpose:

```text
Reusable Structure
```

---

### Generic Interfaces vs Generic Types

---

Interface

```ts
interface Box<T> {
  value: T;
}
```

---

Type Alias

```ts
type Box<T> = {
  value: T;
};
```

---

Most of the time:

```text
Both behave similarly
```

---

Differences will be covered later in:

```text
Interface vs Type
```

---

### Common Mistakes

---

#### Using any Instead of Generic Interfaces

Bad

```ts
interface ApiResponse {
  data: any;
}
```

---

Problem:

```text
Type Safety Lost
```

---

Prefer

```ts
interface ApiResponse<T> {
  data: T;
}
```

---

#### Creating Separate Interfaces

Bad

```ts
UserResponse;

ProductResponse;

OrderResponse;
```

---

When structure is identical.

---

Use:

```ts
ApiResponse<T>;
```

instead.

---

#### Forgetting Generic Arguments

Wrong

```ts
const response: ApiResponse;
```

---

Correct

```ts
const response: ApiResponse<User>;
```

---

### Interview Questions

---

#### Q1

What is a Generic Interface?

#### Answer

```text
An interface that accepts
type parameters.
```

---

#### Q2

Why use Generic Interfaces?

#### Answer

```text
To create reusable,
type-safe structures.
```

---

#### Q3

Can Generic Interfaces have multiple type parameters?

#### Answer

```text
Yes.
```

Example:

```ts
interface Pair<T,U>
```

---

#### Q4

Where are Generic Interfaces commonly used?

#### Answer

```text
API Responses
Repositories
Collections
Frameworks
```

---

#### Q5

Difference between Generic Function and Generic Interface?

#### Answer

```text
Generic Function:
Reusable behavior

Generic Interface:
Reusable structure
```

---

### Cheat Sheet

```ts
interface Box<T> {
  value: T;
}
```

---

```ts
Box<string>;
```

↓

```ts
{
  value: string;
}
```

---

```ts
interface Pair<T,U>
```

---

```ts
interface ApiResponse<T>
```

---

```ts
interface Repository<T>
```

---

```ts
implements Repository<User>
```

---

### Key Takeaways

- Generic Interfaces allow interfaces to work with multiple data types.
- They improve reusability while preserving type safety.
- `T` acts as a type placeholder.
- Multiple generic parameters are supported.
- Generic Interfaces are heavily used in API responses and repository patterns.
- Classes can implement Generic Interfaces.
- Generic Interfaces eliminate duplicated type definitions.
- Prefer Generic Interfaces over `any` when structure remains the same but data types change.
- Generic Interfaces are a core building block of scalable TypeScript applications.
- Understanding Generic Interfaces is essential before learning Generic Classes and Constraints.
