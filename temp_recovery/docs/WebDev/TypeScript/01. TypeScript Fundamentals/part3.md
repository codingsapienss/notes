# Functions

> Functions are one of the most important concepts in TypeScript.
>
> TypeScript enhances JavaScript functions by adding:
>
> - Parameter Types
> - Return Types
> - Optional Parameters
> - Default Parameters
> - Function Signatures
> - Better Type Safety
>
> Understanding functions properly is essential before learning:
>
> - Interfaces
> - Classes
> - Generics
> - React Components
> - API Development

---

# What is a Function?

A function is a reusable block of code designed to perform a specific task.

---

## Example

```ts
function greet() {
  console.log("Hello World");
}
```

---

Calling the function:

```ts
greet();
```

Output:

```text
Hello World
```

---

# Why Do We Need Functions?

Without functions:

```ts
console.log("Welcome");
console.log("Welcome");
console.log("Welcome");
```

Repeated code.

---

With functions:

```ts
function welcome() {
  console.log("Welcome");
}

welcome();
welcome();
welcome();
```

Reusable and cleaner.

---

# Function Syntax

```ts
function functionName(parameters): ReturnType {
  // code
}
```

---

## Example

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

---

# Anatomy of a Function

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

| Part            | Value    |
| --------------- | -------- |
| Keyword         | function |
| Name            | add      |
| Parameters      | a, b     |
| Parameter Types | number   |
| Return Type     | number   |
| Body            | {}       |

---

# Parameter Types

TypeScript allows explicit parameter typing.

---

## Example

```ts
function greet(name: string) {
  console.log(name);
}
```

---

Valid:

```ts
greet("Prashant");
```

---

Invalid:

```ts
greet(100);
```

Error:

```text
Argument of type 'number'
is not assignable to parameter of type 'string'
```

---

# Multiple Parameters

```ts
function add(a: number, b: number) {
  return a + b;
}
```

---

Valid:

```ts
add(10, 20);
```

Output:

```text
30
```

---

Invalid:

```ts
add("10", 20);
```

Compilation Error.

---

# Return Types

Functions may return values.

---

## Example

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

---

Return Type:

```ts
number;
```

---

# Why Specify Return Types?

TypeScript can infer return types.

However, explicit return types:

- Improve readability
- Improve maintainability
- Catch mistakes earlier

---

# Example

```ts
function multiply(a: number, b: number): number {
  return a * b;
}
```

---

# Type Inference for Returns

```ts
function multiply(a: number, b: number) {
  return a * b;
}
```

TypeScript automatically infers:

```ts
number;
```

---

# Void Functions

Some functions return nothing.

---

## Example

```ts
function printMessage(): void {
  console.log("Hello");
}
```

---

Return Type:

```ts
void
```

Meaning:

```text
No value returned
```

---

# Example

```ts
function greet(): void {
  console.log("Welcome");
}
```

---

# What Happens if We Return Something?

```ts
function greet(): void {
  return "hello";
}
```

Error:

```text
Type 'string'
is not assignable to type 'void'
```

---

# Never Type

One of the most misunderstood types.

---

## What is never?

Represents:

```text
A function that never successfully finishes.
```

---

# Example 1

Infinite Loop

```ts
function runForever(): never {
  while (true) {}
}
```

---

Function never exits.

---

# Example 2

Always Throws Error

```ts
function throwError(): never {
  throw new Error("Something went wrong");
}
```

---

Execution stops immediately.

---

# Difference Between void and never

| Feature                 | void | never |
| ----------------------- | ---- | ----- |
| Returns Value           | No   | No    |
| Function Finishes       | Yes  | Never |
| Execution Ends Normally | Yes  | No    |

---

## void Example

```ts
function print(): void {
  console.log("Hello");
}
```

Returns:

```text
Nothing
```

but function finishes.

---

## never Example

```ts
function crash(): never {
  throw new Error();
}
```

Function never completes.

---

# Optional Parameters

Sometimes parameters are not required.

---

## Syntax

```ts
parameter?: Type
```

---

## Example

```ts
function greet(name?: string) {
  console.log(name);
}
```

---

Valid

```ts
greet();
```

---

Valid

```ts
greet("Prashant");
```

---

# What is the Type Internally?

```ts
name?: string
```

becomes:

```ts
string | undefined;
```

Internally.

---

# Example

```ts
function greet(name?: string) {
  if (name) {
    console.log(name);
  }
}
```

---

# Multiple Optional Parameters

```ts
function createUser(name: string, age?: number) {}
```

---

Valid

```ts
createUser("Prashant");
```

---

Valid

```ts
createUser("Prashant", 25);
```

---

# Important Rule

Optional parameters should come after required parameters.

---

Correct

```ts
function test(name: string, age?: number) {}
```

---

Incorrect

```ts
function test(age?: number, name: string) {}
```

Compilation Error.

---

# Default Parameters

Default values automatically apply when no value is provided.

---

## Example

```ts
function greet(name: string = "Guest") {
  console.log(name);
}
```

---

Call

```ts
greet();
```

Output:

```text
Guest
```

---

Call

```ts
greet("Prashant");
```

Output:

```text
Prashant
```

---

# Optional vs Default Parameters

---

Optional

```ts
function greet(name?: string) {}
```

Value:

```ts
undefined;
```

if not supplied.

---

Default

```ts
function greet(name = "Guest") {}
```

Value:

```ts
"Guest";
```

if not supplied.

---

# Function Expressions

Functions can be stored inside variables.

---

## Example

```ts
const add = function (a: number, b: number): number {
  return a + b;
};
```

---

Usage

```ts
add(10, 20);
```

Output:

```text
30
```

---

# Arrow Functions

Modern JavaScript and TypeScript heavily use Arrow Functions.

---

## Traditional Function

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

---

## Arrow Version

```ts
const add = (a: number, b: number): number => {
  return a + b;
};
```

---

# Short Arrow Syntax

```ts
const add = (a: number, b: number): number => a + b;
```

---

# Example

```ts
const square = (value: number): number => value * value;
```

---

Output

```ts
square(5);
```

```text
25
```

---

# Contextual Typing

TypeScript can infer parameter types based on context.

---

## Example

```ts
const names = ["Prashant", "John", "Alex"];

names.forEach((name) => {
  console.log(name);
});
```

---

TypeScript automatically infers:

```ts
name: string;
```

---

No explicit annotation required.

---

# Function Type Annotation

Functions themselves have types.

---

Example

```ts
let add: (a: number, b: number) => number;
```

---

Assign Function

```ts
add = (a, b) => a + b;
```

---

Valid.

---

# Callback Functions

Functions passed as arguments.

---

Example

```ts
function processUser(callback: () => void) {
  callback();
}
```

---

Usage

```ts
processUser(() => {
  console.log("Processing");
});
```

---

Output

```text
Processing
```

---

# Rest Parameters

Accept multiple values.

---

## Example

```ts
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

---

Call

```ts
sum(1, 2, 3, 4);
```

Output:

```text
10
```

---

# Common Mistakes

---

## Missing Return

```ts
function add(a: number, b: number): number {}
```

Error:

```text
Function lacks ending return statement.
```

---

## Wrong Parameter Type

```ts
function greet(name: string) {}

greet(100);
```

Error.

---

## Returning Wrong Type

```ts
function getAge(): number {
  return "25";
}
```

Error.

---

# Interview Questions

---

## Q1

Difference between void and never?

### Answer

```text
void:
Function finishes normally.

never:
Function never completes.
```

---

## Q2

What is an optional parameter?

### Answer

```ts
name?: string
```

Parameter may be omitted.

---

## Q3

What is a default parameter?

### Answer

A parameter with a predefined value.

---

## Q4

What are arrow functions?

### Answer

A shorter syntax for writing functions.

---

## Q5

Can TypeScript infer return types?

### Answer

Yes.

TypeScript can automatically infer return types.

---

# Cheat Sheet

```ts
function add(a: number, b: number): number {
  return a + b;
}
```

---

```ts
function print(): void {}
```

---

```ts
function crash(): never {
  throw new Error();
}
```

---

```ts
function greet(name?: string) {}
```

---

```ts
function greet(name = "Guest") {}
```

---

```ts
const add = (a: number, b: number): number => a + b;
```

---

```ts
function sum(...nums: number[]) {}
```

---

# Key Takeaways

- Functions are reusable blocks of code.
- TypeScript adds type safety to function parameters and return values.
- Return types can be explicit or inferred.
- `void` means no value is returned.
- `never` means execution never successfully completes.
- Optional parameters use `?`.
- Default parameters provide fallback values.
- Arrow Functions are widely used in modern TypeScript.
- Contextual Typing allows TypeScript to infer parameter types automatically.
- Functions themselves can have types.

---
 
 


---\n*Last refined on April 16, 2026*
