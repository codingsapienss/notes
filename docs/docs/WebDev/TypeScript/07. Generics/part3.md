# Generic Classes

> Now we'll learn one of the most powerful applications of Generics:
>
> ```text
> Generic Classes
> ```
>
> Generic Classes allow us to create:
>
> - Reusable Classes
> - Type-Safe Containers
> - Generic Data Structures
> - Repositories
> - Service Layers
> - Cache Systems
>
> without sacrificing type safety.

---

# Why Do We Need Generic Classes?

Suppose we want a class that stores data.

---

Without Generics

```ts
class StringStorage {
  private data: string[] = [];

  add(item: string) {
    this.data.push(item);
  }

  getAll() {
    return this.data;
  }
}
```

---

Usage

```ts
const users = new StringStorage();

users.add("Prashant");
```

Works.

---

Now we need:

```text
Number Storage
Boolean Storage
User Storage
Product Storage
```

---

Without Generics

```ts
class NumberStorage {}

class BooleanStorage {}

class UserStorage {}

class ProductStorage {}
```

---

Problem:

```text
Code Duplication
```

---

# Generic Class Solution

Instead of creating multiple classes:

```ts
StringStorage;

NumberStorage;

UserStorage;
```

---

Create:

```ts
Storage<T>;
```

---

One class.

Many types.

---

# What is a Generic Class?

A Generic Class is:

```text
A Class That Accepts
Type Parameters
```

---

Syntax

```ts
class ClassName<T> {}
```

---

Here:

```ts
T;
```

represents:

```text
A Placeholder Type
```

---

# First Generic Class

```ts
class Storage<T> {
  private data: T[] = [];

  add(item: T) {
    this.data.push(item);
  }

  getAll() {
    return this.data;
  }
}
```

---

Notice:

```ts
T[]
```

---

The class can now store:

```text
Strings
Numbers
Objects
Custom Types
```

---

# Using Generic Classes

---

String Storage

```ts
const users = new Storage<string>();
```

---

Add Data

```ts
users.add("Prashant");

users.add("John");
```

---

Result

```ts
["Prashant", "John"];
```

---

TypeScript knows:

```text
Storage contains strings
```

---

# Number Storage

```ts
const scores = new Storage<number>();
```

---

Usage

```ts
scores.add(100);

scores.add(95);
```

---

Result

```ts
[100, 95];
```

---

Type-safe.

---

# Type Safety in Action

---

String Storage

```ts
const users = new Storage<string>();
```

---

Valid

```ts
users.add("Prashant");
```

---

Invalid

```ts
users.add(100);
```

---

Error

```text
Argument of type number
is not assignable to string
```

---

Because:

```ts
T = string;
```

---

# Generic Class with Objects

---

User Type

```ts
type User = {
  id: number;

  name: string;
};
```

---

Storage

```ts
const userStorage = new Storage<User>();
```

---

Usage

```ts
userStorage.add({
  id: 1,
  name: "Prashant",
});
```

---

Valid.

---

TypeScript knows:

```text
Storage contains User objects
```

---

# Generic Class Internally

Consider:

```ts
const users = new Storage<string>();
```

---

TypeScript treats it as:

```ts
Storage<string>;
```

---

Internally:

```ts
class Storage {
  private data: string[];
}
```

Conceptually.

---

# Multiple Generic Parameters

Classes can have multiple type parameters.

---

Syntax

```ts
class Pair<T, U> {}
```

---

Example

```ts
class Pair<T, U> {
  constructor(
    public first: T,
    public second: U,
  ) {}
}
```

---

Usage

```ts
const pair = new Pair<string, number>("Age", 25);
```

---

Result

```ts
{
  first: string;
  second: number;
}
```

---

# Generic Key-Value Store

---

Example

```ts
class KeyValue<K, V> {
  constructor(
    public key: K,
    public value: V,
  ) {}
}
```

---

Usage

```ts
const item = new KeyValue<string, number>("age", 25);
```

---

Result

```ts
{
  key: "age",
  value: 25
}
```

---

# Constructor with Generics

Generics can be used inside constructors.

---

Example

```ts
class Box<T> {
  constructor(public value: T) {}
}
```

---

Usage

```ts
const box = new Box<string>("Hello");
```

---

Output

```ts
box.value;
```

Type:

```ts
string;
```

---

# Generic Class Methods

Methods automatically gain access to class generics.

---

Example

```ts
class Box<T> {
  constructor(public value: T) {}

  getValue(): T {
    return this.value;
  }
}
```

---

Usage

```ts
const box = new Box<number>(100);

console.log(box.getValue());
```

Output

```text
100
```

---

Return Type:

```ts
number;
```

---

# Generic Repository Pattern

One of the most common enterprise patterns.

---

Entity

```ts
type User = {
  id: number;

  name: string;
};
```

---

Repository

```ts
class Repository<T> {
  private items: T[] = [];

  add(item: T) {
    this.items.push(item);
  }

  getAll() {
    return this.items;
  }
}
```

---

Usage

```ts
const users = new Repository<User>();
```

---

Add User

```ts
users.add({
  id: 1,
  name: "Prashant",
});
```

---

Retrieve

```ts
users.getAll();
```

Type:

```ts
User[]
```

---

Very common in:

```text
Backend Systems
ORMs
Repositories
Services
```

---

# Generic Cache Example

---

```ts
class Cache<T> {
  private data: Record<string, T> = {};

  set(key: string, value: T) {
    this.data[key] = value;
  }

  get(key: string) {
    return this.data[key];
  }
}
```

---

Usage

```ts
const userCache = new Cache<string>();

userCache.set("username", "Prashant");
```

---

Retrieve

```ts
userCache.get("username");
```

Type:

```ts
string;
```

---

# Generic Class + Generic Method

A class can have:

```text
Class Generics
```

and

```text
Method Generics
```

simultaneously.

---

Example

```ts
class Storage<T> {
  private data: T[] = [];

  add(item: T) {
    this.data.push(item);
  }

  convert<U>(value: U): U {
    return value;
  }
}
```

---

Usage

```ts
const store = new Storage<string>();
```

---

Class Generic

```ts
T = string;
```

---

Method Generic

```ts
U = number;
```

---

Independent.

---

# Generic Class vs Generic Interface

---

Generic Interface

```ts
interface Box<T> {
  value: T;
}
```

---

Describes:

```text
Structure
```

---

Generic Class

```ts
class Box<T> {
  constructor(public value: T) {}
}
```

---

Provides:

```text
Implementation
```

---

# Real World Example

API Service

---

Response Type

```ts
type User = {
  id: number;

  name: string;
};
```

---

Service

```ts
class ApiService<T> {
  constructor(private data: T) {}

  getData(): T {
    return this.data;
  }
}
```

---

Usage

```ts
const service = new ApiService<User>({
  id: 1,
  name: "Prashant",
});
```

---

Retrieve

```ts
service.getData();
```

Type:

```ts
User;
```

---

# Common Mistakes

---

## Using any Instead of Generics

Bad

```ts
class Storage {
  data: any[];
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
class Storage<T>
```

---

## Creating Duplicate Classes

Bad

```ts
StringStorage;

NumberStorage;

UserStorage;
```

---

Use:

```ts
Storage<T>;
```

instead.

---

## Forgetting Generic Type

Wrong

```ts
const store = new Storage();
```

---

May result in:

```ts
unknown;
```

or weak inference.

---

Prefer:

```ts
new Storage<string>();
```

---

# Interview Questions

---

## Q1

What is a Generic Class?

### Answer

```text
A class that accepts
type parameters.
```

---

## Q2

Why use Generic Classes?

### Answer

```text
To create reusable,
type-safe classes.
```

---

## Q3

Can Generic Classes have methods?

### Answer

```text
Yes.
```

---

## Q4

Can Generic Classes have multiple type parameters?

### Answer

```text
Yes.
```

Example:

```ts
class Pair<T,U>
```

---

## Q5

Difference between Generic Interface and Generic Class?

### Answer

```text
Interface:
Structure

Class:
Implementation
```

---

# Cheat Sheet

```ts
class Storage<T> {}
```

---

```ts
new Storage<string>();
```

---

```ts
new Storage<number>();
```

---

```ts
class Pair<T,U>
```

---

```ts
class Repository<T>
```

---

```ts
class Cache<T>
```

---

```ts
getValue(): T
```

---

# Key Takeaways

- Generic Classes allow classes to work with multiple data types.
- They provide reusability while maintaining type safety.
- `T` acts as a type placeholder.
- Generic Classes eliminate duplicate class implementations.
- Multiple generic parameters are supported.
- Constructors, properties and methods can all use generic types.
- Generic Classes are widely used in repositories, services, caches and frameworks.
- Generic Classes form the foundation of many enterprise TypeScript architectures.
- Prefer Generic Classes over `any` whenever type information should be preserved.
- Understanding Generic Classes is essential before learning Generic Constraints and Advanced Generics.

---


---\n*Last refined on April 29, 2026*
