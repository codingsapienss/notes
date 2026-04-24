# Typing APIs (`fetch`, Axios, AxiosResponse & Error Handling)

> In real-world applications, one of the most common tasks is:
>
> ```text
> Communicating With APIs
> ```
>
> Examples:
>
> - Fetching Users
> - Loading Products
> - Authentication
> - Payments
> - Dashboard Data
>
> TypeScript helps us make API communication:
>
> ```text
> Type Safe
> Predictable
> Easier To Maintain
> ```

---

# Why API Typing Matters

Consider:

```ts
const response = await fetch("/users");

const data = await response.json();

console.log(data.name);
```

---

Problem:

```text
TypeScript has no idea
what data looks like.
```

---

Type becomes:

```ts
any;
```

or

```ts
unknown;
```

(depending on configuration)

---

This means:

```ts
data.xyz.abc.def;
```

may compile.

---

But fail at runtime.

---

# The Goal

Instead of:

```text
Unknown Data
```

we want:

```text
Strongly Typed Data
```

---

Example

```ts
{
  id: number;
  name: string;
  email: string;
}
```

---

TypeScript can then:

```text
Validate Fields
Provide Autocomplete
Catch Errors Early
```

---

# Creating API Models

Suppose API returns:

```json
{
  "id": 1,
  "name": "Prashant",
  "email": "test@gmail.com"
}
```

---

Create a Type

```ts
interface User {
  id: number;

  name: string;

  email: string;
}
```

---

This becomes:

```text
Source Of Truth
```

for API data.

---

# Typing fetch()

---

Basic Fetch

```ts
const response = await fetch("/users/1");

const data = await response.json();
```

---

Problem

```ts
data;
```

has weak typing.

---

# Type Assertion Approach

```ts
const response =
  await fetch("/users/1");

const data =
  await response.json()
  as User;
```

---

Now:

```ts
data.name;
```

works.

---

```ts
data.email;
```

works.

---

```ts
data.salary;
```

Error.

---

Because:

```ts
salary;
```

does not exist in:

```ts
User;
```

---

# Complete Example

```ts
interface User {
  id: number;

  name: string;

  email: string;
}
```

---

```ts
async function getUser() {

  const response =
    await fetch("/users/1");

  const user =
    await response.json()
    as User;

  return user;
}
```

---

Usage

```ts
const user = await getUser();

console.log(user.name);
```

---

TypeScript knows:

```ts
user;
```

is:

```ts
User;
```

---

# Typing Array Responses

Suppose API returns:

```json
[
  {
    "id": 1,
    "name": "A"
  },
  {
    "id": 2,
    "name": "B"
  }
]
```

---

Model

```ts
interface User {
  id: number;

  name: string;
}
```

---

Fetch

```ts
const users =
  await response.json()
  as User[];
```

---

Type

```ts
User[]
```

---

Usage

```ts
users[0].name;
```

Autocomplete available.

---

# Generic API Response Model

Very common.

---

Backend Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Prashant"
  }
}
```

---

Create Generic Type

```ts
interface ApiResponse<T> {
  success: boolean;

  data: T;
}
```

---

User Model

```ts
interface User {
  id: number;

  name: string;
}
```

---

Usage

```ts
type UserResponse = ApiResponse<User>;
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

Very common in enterprise applications.

---

# Introduction to Axios

Axios is one of the most popular HTTP libraries.

---

Installation

```bash
npm install axios
```

---

Simple Request

```ts
import axios from "axios";

const response = await axios.get("/users");
```

---

Question:

```text
How do we type the response?
```

---

# AxiosResponse

Axios provides:

```ts
AxiosResponse<T>;
```

---

Syntax

```ts
AxiosResponse<User>;
```

---

Meaning:

```text
Response Data
contains User
```

---

# Example

User Model

```ts
interface User {
  id: number;

  name: string;
}
```

---

Request

```ts
const response = await axios.get<User>("/users/1");
```

---

Type of:

```ts
response.data;
```

becomes:

```ts
User;
```

---

Usage

```ts
console.log(response.data.name);
```

Autocomplete available.

---

# How Axios Generics Work

---

Request

```ts
axios.get<User>("/users/1");
```

---

Internally

```ts
AxiosResponse<User>;
```

---

Result

```ts
response.data;
```

↓

```ts
User;
```

---

# Array Response Example

Model

```ts
interface User {
  id: number;

  name: string;
}
```

---

Request

```ts
const response = await axios.get<User[]>("/users");
```

---

Type

```ts
response.data;
```

↓

```ts
User[]
```

---

Usage

```ts
response.data[0].name;
```

---

# Generic API Service

Common enterprise pattern.

---

Response Model

```ts
interface ApiResponse<T> {
  success: boolean;

  data: T;
}
```

---

User Model

```ts
interface User {
  id: number;

  name: string;
}
```

---

Request

```ts
const response = await axios.get<ApiResponse<User>>("/users/1");
```

---

Type

```ts
response.data.data;
```

↓

```ts
User;
```

---

Very common pattern.

---

# Typing POST Requests

---

Model

```ts
interface CreateUser {
  name: string;

  email: string;
}
```

---

Request

```ts
await axios.post("/users", {
  name: "Prashant",
  email: "test@gmail.com",
});
```

---

Better

```ts
const payload: CreateUser = {
  name: "Prashant",

  email: "test@gmail.com",
};
```

---

```ts
await axios.post("/users", payload);
```

---

Now payload is validated.

---

# API Error Handling

One of the most important topics.

---

Bad

```ts
const response = await axios.get("/users");
```

---

If request fails:

```text
Application Crashes
```

---

# Try-Catch

```ts
try {
  const response = await axios.get("/users");
} catch (error) {
  console.log(error);
}
```

---

# Problem

Type of:

```ts
error;
```

is:

```ts
unknown;
```

---

Why?

Because:

```text
Anything can be thrown
```

---

# Narrowing Error Type

```ts
try {
} catch (error) {
  if (error instanceof Error) {
    console.log(error.message);
  }
}
```

---

Now:

```ts
error.message;
```

is safe.

---

# Axios Error Handling

Axios provides:

```ts
AxiosError;
```

---

Example

```ts
import { AxiosError } from "axios";
```

---

```ts
try {
  await axios.get("/users");
} catch (error) {
  if (error instanceof AxiosError) {
    console.log(error.response);
    console.log(error.message);
  }
}
```

---

Very common in production.

---

# Real World API Wrapper

```ts
import axios from "axios";
```

---

```ts
interface ApiResponse<T> {
  success: boolean;

  data: T;
}
```

---

```ts
interface User {
  id: number;

  name: string;
}
```

---

```ts
async function getUser(id: number) {
  const response = await axios.get<ApiResponse<User>>(`/users/${id}`);

  return response.data.data;
}
```

---

Usage

```ts
const user = await getUser(1);
```

---

Type

```ts
User;
```

---

Fully type-safe.

---

# Common Mistakes

---

## Using any

Bad

```ts
const data: any;
```

---

Prefer

```ts
User;
```

or

```ts
ApiResponse<User>;
```

---

## Ignoring Error Types

Bad

```ts
catch(error) {

  console.log(
    error.message
  );
}
```

---

Error is:

```ts
unknown;
```

---

Use

```ts
instanceof Error
```

---

## Not Creating API Models

Bad

```ts
response.data.name;
```

with no types.

---

Always create:

```ts
interface User
```

---

# Interview Questions

---

## Q1

Why type API responses?

### Answer

```text
Type Safety
Autocomplete
Compile-Time Validation
```

---

## Q2

What is AxiosResponse<T>?

### Answer

```text
A generic response type
provided by Axios.
```

---

## Q3

How do you type an API response?

### Answer

```ts
axios.get<User>();
```

---

## Q4

Why is catch(error) typed as unknown?

### Answer

```text
Anything can be thrown.
```

---

## Q5

What is a common generic API pattern?

### Answer

```ts
interface ApiResponse<T>
```

---

# Cheat Sheet

```ts
interface User {}
```

---

```ts
await response.json()
as User
```

---

```ts
axios.get<User>();
```

---

```ts
AxiosResponse<User>;
```

---

```ts
ApiResponse<T>;
```

---

```ts
User[]
```

---

```ts
error instanceof Error;
```

---

```ts
error instanceof AxiosError;
```

---

# Key Takeaways

- Always create models for API data.
- `fetch()` responses should be typed.
- Axios provides generic typing through `AxiosResponse<T>`.
- `axios.get<User>()` creates strongly typed responses.
- Generic API wrappers improve reusability.
- `ApiResponse<T>` is a very common enterprise pattern.
- Error handling should use proper type narrowing.
- `catch(error)` is typed as `unknown`.
- `AxiosError` helps handle HTTP-specific failures.
- Strongly typed APIs significantly reduce runtime bugs.

---
 
 
 
 
