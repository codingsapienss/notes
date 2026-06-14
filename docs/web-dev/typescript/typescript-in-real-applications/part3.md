# Async TypeScript (Promise Types & Async/Await)

> Modern applications spend a significant amount of time performing:
>
> - API Requests
> - Database Queries
> - File Operations
> - Authentication
> - Payment Processing
>
> These operations take time.
>
> We cannot block the application while waiting.
>
> This is why JavaScript and TypeScript provide:
>
> ```text
> Asynchronous Programming
> ```
>
> using:
>
> ```ts
> Promise;
> async;
> await;
> ```
>
> Understanding Promise Types is essential for:
>
> - React
> - Angular
> - Node.js
> - NestJS
> - Express
> - Backend Development

---

### Why Do We Need Async Programming?

Consider:

```ts
const user = fetch("/users/1");

console.log(user);
```

Output:

```text
Promise { <pending> }
```

---

Why?

Because:

```text
Network Requests
Take Time
```

---

The browser cannot stop execution and wait.

---

Instead:

```text
Request Starts
Execution Continues
Response Arrives Later
```

---

### Synchronous vs Asynchronous

---

#### Synchronous

```ts
console.log("A");

console.log("B");

console.log("C");
```

Output

```text
A
B
C
```

---

Each statement waits for the previous one.

---

#### Asynchronous

```ts
console.log("A");

setTimeout(() => {
  console.log("B");
}, 1000);

console.log("C");
```

Output

```text
A
C
B
```

---

Because:

```text
setTimeout runs later
```

---

### What is a Promise?

A Promise represents:

```text
A Future Value
```

---

Something that:

```text
Will be available later
```

---

### Promise States

A Promise can be in three states.

---

#### Pending

```text
Operation Still Running
```

---

#### Fulfilled

```text
Operation Successful
```

---

#### Rejected

```text
Operation Failed
```

---

Visualization

```text
Promise
   │
   ▼

 Pending
   │
 ┌─┴─┐
 │   │
 ▼   ▼

Success Failure

Fulfilled Rejected
```

---

### Creating a Promise

---

Example

```ts
const promise = new Promise<string>((resolve, reject) => {
  resolve("Success");
});
```

---

Notice:

```ts
Promise<string>;
```

---

This means:

```text
Promise resolves
to a string
```

---

### Promise Type Syntax

```ts
Promise<T>;
```

---

Examples

```ts
Promise<string>;
```

---

```ts
Promise<number>;
```

---

```ts
Promise<boolean>;
```

---

```ts
Promise<User>;
```

---

### Promise Example

---

```ts
const promise: Promise<number> = new Promise((resolve) => {
  resolve(100);
});
```

---

Resolved Value

```ts
number;
```

---

TypeScript knows:

```text
Promise returns number
```

---

### Consuming Promises with then()

---

Example

```ts
promise.then((value) => {
  console.log(value);
});
```

Output

```text
100
```

---

Type of:

```ts
value;
```

↓

```ts
number;
```

---

because:

```ts
Promise<number>;
```

---

### Real API Example

---

```ts
fetch("/users/1")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  });
```

---

Works.

---

But:

```text
Can become hard to read
```

for multiple async operations.

---

### Async/Await

Modern TypeScript uses:

```ts
async;
await;
```

---

These keywords make asynchronous code look synchronous.

---

### async Function

---

Example

```ts
async function greet() {
  return "Hello";
}
```

---

Question:

What is the return type?

---

Answer:

```ts
Promise<string>;
```

---

Important Rule

Every:

```ts
async function
```

always returns:

```ts
Promise;
```

---

Even if:

```ts
return "Hello";
```

---

TypeScript converts it internally to:

```ts
Promise.resolve("Hello");
```

---

### Example

```ts
async function getAge() {
  return 25;
}
```

---

Return Type

```ts
Promise<number>;
```

---

Not:

```ts
number;
```

---

### Understanding await

`await` waits for a Promise to finish.

---

Example

```ts
const result = await Promise.resolve("Hello");
```

---

Type

```ts
string;
```

---

Notice:

```ts
Promise<string>;
```

↓

```ts
string;
```

---

`await` unwraps the Promise.

---

### First Async/Await Example

---

```ts
async function getMessage() {
  const result = await Promise.resolve("Hello");

  return result;
}
```

---

Return Type

```ts
Promise<string>;
```

---

Inside Function

```ts
result;
```

↓

```ts
string;
```

---

### API Example Using Fetch

---

Model

```ts
interface User {
  id: number;

  name: string;

  email: string;
}
```

---

Function

```ts
async function getUser()
: Promise<User> {

  const response =
    await fetch(
      "/users/1"
    );

  const user =
    await response.json()
    as User;

  return user;
}
```

---

Return Type

```ts
Promise<User>;
```

---

Usage

```ts
const user = await getUser();
```

---

Type

```ts
User;
```

---

### Why Explicit Return Types Matter

Bad

```ts
async function getUser() {}
```

---

TypeScript infers.

---

Better

```ts
async function getUser(): Promise<User> {}
```

---

Benefits

```text
Clear Documentation
Better Safety
Better Refactoring
```

---

### Async Function Returning Arrays

---

Model

```ts
interface User {
  id: number;

  name: string;
}
```

---

Function

```ts
async function getUsers(): Promise<User[]> {
  const response = await fetch("/users");

  return (await response.json()) as User[];
}
```

---

Return Type

```ts
Promise<User[]>;
```

---

Usage

```ts
const users = await getUsers();
```

---

Type

```ts
User[]
```

---

### Generic API Response

Very common.

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

Function

```ts
async function getUser(): Promise<ApiResponse<User>> {
  const response = await fetch("/users/1");

  return (await response.json()) as ApiResponse<User>;
}
```

---

Return Type

```ts
Promise<ApiResponse<User>>;
```

---

Usage

```ts
const result = await getUser();
```

---

Type

```ts
result.data;
```

↓

```ts
User;
```

---

### Async Error Handling

---

Bad

```ts
const user = await getUser();
```

---

If request fails:

```text
Unhandled Exception
```

---

### Try Catch

```ts
try {
  const user = await getUser();
} catch (error) {
  console.log(error);
}
```

---

### Type of Error

TypeScript treats:

```ts
error;
```

as:

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

### Proper Error Narrowing

---

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

### Promise.all()

One of the most useful Promise APIs.

---

Problem

Need multiple requests.

---

Bad

```ts
const users = await getUsers();

const products = await getProducts();
```

---

Runs sequentially.

---

### Better

```ts
const [users, products] = await Promise.all([getUsers(), getProducts()]);
```

---

Runs concurrently.

---

Types

```ts
users;
```

↓

```ts
User[]
```

---

```ts
products;
```

↓

```ts
Product[]
```

---

### Promise.all Type Inference

Example

```ts
const result = await Promise.all([Promise.resolve("A"), Promise.resolve(100)]);
```

---

Type

```ts
[string, number];
```

---

Very powerful inference.

---

### Promise<void>

Sometimes functions return nothing.

---

Example

```ts
async function saveUser(): Promise<void> {
  console.log("Saved");
}
```

---

Meaning:

```text
Promise resolves
with no value
```

---

### Promise<never>

Rare.

Used when function never completes normally.

---

Example

```ts
async function fail(): Promise<never> {
  throw new Error();
}
```

---

Meaning:

```text
Function never
returns a value.
```

---

### Real World Service Layer

---

Model

```ts
interface User {
  id: number;

  name: string;
}
```

---

Service

```ts
class UserService {
  async getUser(id: number): Promise<User> {
    const response = await fetch(`/users/${id}`);

    return (await response.json()) as User;
  }
}
```

---

Usage

```ts
const service = new UserService();

const user = await service.getUser(1);
```

---

Type

```ts
User;
```

---

### Common Mistakes

---

#### Forgetting await

Wrong

```ts
const user = getUser();
```

---

Type

```ts
Promise<User>;
```

---

Not:

```ts
User;
```

---

Correct

```ts
const user = await getUser();
```

---

#### Returning Wrong Type

Wrong

```ts
async function getUser(): User {}
```

---

Correct

```ts
async function getUser(): Promise<User> {}
```

---

#### Ignoring Error Handling

Bad

```ts
await fetch("/users");
```

---

Always consider:

```ts
try/catch
```

---

### Interview Questions

---

#### Q1

What does an async function return?

#### Answer

```text
Always a Promise.
```

---

#### Q2

What does await do?

#### Answer

```text
Waits for a Promise
and unwraps its value.
```

---

#### Q3

What is Promise<T>?

#### Answer

```text
A Promise that resolves
to type T.
```

---

#### Q4

What is the type of error in catch?

#### Answer

```ts
unknown;
```

---

#### Q5

Why use Promise.all()?

#### Answer

```text
Run multiple async tasks
concurrently.
```

---

### Cheat Sheet

```ts
Promise<T>;
```

---

```ts
Promise<User>;
```

---

```ts
Promise<User[]>;
```

---

```ts
async function fn();
```

↓

```ts
Promise<...>
```

---

```ts
await promise;
```

↓

```ts
Resolved Value
```

---

```ts
Promise.all([...])
```

---

```ts
Promise<void>;
```

---

```ts
Promise<never>;
```

---

### Key Takeaways

- Promises represent future values.
- A Promise can be Pending, Fulfilled, or Rejected.
- `Promise<T>` represents a promise resolving to type `T`.
- Every `async` function automatically returns a Promise.
- `await` unwraps the resolved value of a Promise.
- API functions should use explicit Promise return types.
- Generic API models like `ApiResponse<T>` work well with async code.
- Errors inside `catch` are typed as `unknown`.
- `Promise.all()` allows concurrent execution with strong type inference.
- Async programming is a fundamental skill for modern TypeScript development.
