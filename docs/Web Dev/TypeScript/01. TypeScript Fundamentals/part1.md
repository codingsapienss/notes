# Introduction to TypeScript

---

### What is TypeScript?

TypeScript is an:

```text
Open-source programming language developed by Microsoft
```

that builds on top of:

```text
JavaScript
```

and adds:

- Static Typing
- Better Tooling
- Compile-Time Error Checking
- Modern Language Features
- Improved Maintainability

---

#### Simple Definition

You can think of TypeScript as:

```text
JavaScript + Type Safety
```

Example:

```ts
let username: string = "Prashant";

username = "John"; // ✅ Valid

username = 123; // ❌ Error
```

TypeScript catches the mistake before the code runs.

---

### Why Was TypeScript Created?

JavaScript was originally designed for:

```text
Small browser scripts
```

but today JavaScript is used for:

- Frontend Applications
- Backend APIs
- Mobile Applications
- Desktop Applications
- Cloud Services
- Enterprise Software

As applications grew larger, JavaScript introduced several problems:

- Runtime Errors
- Poor Refactoring Support
- Weak Documentation
- Difficult Maintenance
- Harder Team Collaboration

TypeScript solves many of these issues.

---

### Problems with JavaScript

---

#### Example 1

```js
function add(a, b) {
  return a + b;
}

console.log(add(10, 20));
console.log(add("10", 20));
```

Output:

```text
30
1020
```

JavaScript allows both.

This can easily introduce bugs.

---

#### Example 2

```js
const user = {
  name: "Prashant",
};

console.log(user.age.toString());
```

Output:

```text
Runtime Error
```

The application crashes while running.

---

### How TypeScript Helps

TypeScript checks code:

```text
Before Execution
```

Example:

```ts
const user = {
  name: "Prashant",
};

console.log(user.age);
```

TypeScript immediately shows:

```text
Property 'age' does not exist
```

No need to wait until runtime.

---

### JavaScript vs TypeScript

| Feature         | JavaScript | TypeScript   |
| --------------- | ---------- | ------------ |
| Typing          | Dynamic    | Static       |
| Error Detection | Runtime    | Compile Time |
| IntelliSense    | Limited    | Excellent    |
| Refactoring     | Harder     | Easier       |
| Large Projects  | Difficult  | Better       |
| OOP Support     | Basic      | Enhanced     |
| Interfaces      | ❌         | ✅           |
| Generics        | ❌         | ✅           |

---

### Dynamic Typing vs Static Typing

This is one of the most important concepts.

---

#### Dynamic Typing

JavaScript is:

```text
Dynamically Typed
```

Meaning:

```js
let value = "hello";

value = 100;

value = true;
```

All are valid.

The variable can hold different types during execution.

---

#### Static Typing

TypeScript is:

```text
Statically Typed
```

Example:

```ts
let value: string = "hello";

value = "world"; // ✅

value = 100; // ❌ Error
```

Once the type is defined:

```text
TypeScript enforces it.
```

---

### What is a Type?

A type defines:

```text
What kind of value a variable can store.
```

Examples:

```ts
string;
number;
boolean;
```

---

```ts
let username: string = "Prashant";
```

Here:

```text
Type = string
```

---

```ts
let age: number = 25;
```

Here:

```text
Type = number
```

---

### What is Type Safety?

Type Safety means:

```text
Operations are only allowed on compatible types.
```

Example:

```ts
let age: number = 25;

age.toUpperCase();
```

Error:

```text
Property 'toUpperCase' does not exist on type 'number'
```

TypeScript prevents invalid operations.

---

### TypeScript is NOT a New Runtime

Many beginners think:

```text
Browser runs TypeScript
```

This is wrong.

Browsers understand:

```text
JavaScript
```

only.

---

### TypeScript Compilation Process

---

#### Step 1

Write TypeScript

```ts
let username: string = "Prashant";
```

---

#### Step 2

TypeScript Compiler

```text
tsc
```

checks:

- Types
- Errors
- Syntax

---

#### Step 3

Compiler removes TypeScript-specific code.

Generated JavaScript:

```js
let username = "Prashant";
```

---

#### Step 4

Browser runs JavaScript.

---

### TypeScript Compilation Flow

```text
TypeScript Code
        ↓
 TypeScript Compiler (tsc)
        ↓
 JavaScript Code
        ↓
 Browser / Node.js
```

---

### What is tsc?

`tsc` stands for:

```text
TypeScript Compiler
```

Install TypeScript:

```bash
npm install -g typescript
```

---

Check version:

```bash
tsc --version
```

---

Compile file:

```bash
tsc app.ts
```

Generated:

```text
app.js
```

---

### Example Compilation

TypeScript:

```ts
let price: number = 100;
```

Generated JavaScript:

```js
let price = 100;
```

Notice:

```text
Type information is removed.
```

---

### What is Type Erasure?

One of the most important TypeScript concepts.

---

TypeScript Types:

```ts
let username: string = "Prashant";
```

During compilation:

```js
let username = "Prashant";
```

---

The type:

```text
string
```

disappears.

This process is called:

```text
Type Erasure
```

---

### Why Does Type Erasure Happen?

Because:

```text
JavaScript Engine
```

does not understand:

```ts
string;
number;
interface;
type;
generic;
```

---

TypeScript exists only during:

```text
Development Time
```

---

After compilation:

```text
Only JavaScript remains.
```

---

### TypeScript Exists in Two Phases

---

#### Development Phase

TypeScript helps with:

- Errors
- IntelliSense
- Refactoring
- Auto-completion
- Type Checking

---

Example:

```ts
let age: number = 25;
```

---

#### Runtime Phase

Only JavaScript executes.

```js
let age = 25;
```

---

### Does TypeScript Improve Performance?

Common Interview Question.

Answer:

```text
No
```

TypeScript does NOT make code faster.

---

Why?

Because:

```text
TypeScript is removed during compilation.
```

Only JavaScript runs.

---

TypeScript improves:

- Developer Experience
- Maintainability
- Reliability

Not runtime speed.

---

### Advantages of TypeScript

---

#### Better Error Detection

Errors found before execution.

---

#### Excellent IDE Support

Features:

- Autocomplete
- Refactoring
- Navigation
- Rename Support

---

#### Easier Maintenance

Large codebases become manageable.

---

#### Self Documentation

Example:

```ts
function createUser(name: string, age: number): void {}
```

The function explains itself.

---

#### Better Team Collaboration

Types clearly communicate:

```text
Expected Inputs
Expected Outputs
```

---

### Limitations of TypeScript

---

#### Extra Build Step

Need compilation:

```text
TS → JS
```

---

#### Learning Curve

Need to learn:

- Types
- Interfaces
- Generics
- Advanced Type System

---

#### Not Runtime Validation

Example:

```ts
const data = JSON.parse(apiResponse);
```

TypeScript cannot guarantee:

```text
API actually returned correct data.
```

Runtime validation may still be needed.

---

### Real World Example

Without TypeScript:

```js
function createUser(user) {
  return user.name.toUpperCase();
}
```

Possible runtime crash.

---

With TypeScript:

```ts
type User = {
  name: string;
};

function createUser(user: User) {
  return user.name.toUpperCase();
}
```

Safer and easier to maintain.

---

### When Should You Use TypeScript?

Use TypeScript for:

- React Applications
- Node.js APIs
- Enterprise Applications
- Large Projects
- Team Projects
- Long-term Maintainability

---

For:

```text
Tiny scripts
Small experiments
```

JavaScript may be enough.

---

### Interview Questions

---

#### Q1

What is TypeScript?

#### Answer

```text
A statically typed superset of JavaScript developed by Microsoft.
```

---

#### Q2

Does TypeScript run in browsers?

#### Answer

```text
No.
Browsers run JavaScript.
TypeScript must be compiled first.
```

---

#### Q3

What is tsc?

#### Answer

```text
TypeScript Compiler.
```

---

#### Q4

What is Type Erasure?

#### Answer

```text
Removal of TypeScript type information during compilation.
```

---

#### Q5

Does TypeScript improve runtime performance?

#### Answer

```text
No.
It improves development experience and code quality.
```

---

### Key Takeaways

- TypeScript is a superset of JavaScript.
- TypeScript adds static typing to JavaScript.
- TypeScript catches errors during development.
- Browsers do not understand TypeScript directly.
- TypeScript must be compiled into JavaScript.
- `tsc` is the TypeScript compiler.
- Type information is removed during compilation (Type Erasure).
- TypeScript improves maintainability, tooling, and developer productivity.
- TypeScript does not improve runtime performance.
- TypeScript is widely used in modern frontend and backend applications.
