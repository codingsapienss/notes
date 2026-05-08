# Type Declaration Files (`.d.ts`) & DefinitelyTyped

> So far, we have learned:
>
> - TypeScript Fundamentals
> - Types
> - Interfaces
> - Classes
> - Generics
> - Utility Types
>
> However, real-world applications rarely use only code that we write ourselves.
>
> Most projects depend on:
>
> - npm packages
> - third-party libraries
> - browser APIs
> - Node.js APIs
>
> The biggest question becomes:
>
> ```text
> How does TypeScript know
> the types of external libraries?
> ```
>
> The answer is:
>
> ```text
> Type Declaration Files (.d.ts)
> ```
>
> and
>
> ```text
> DefinitelyTyped
> ```

---

### The Problem

Suppose we install:

```bash
npm install lodash
```

---

Usage

```ts
import _ from "lodash";

_.chunk([1, 2, 3, 4], 2);
```

---

Question:

```text
How does TypeScript know:

chunk() exists?

What parameters it accepts?

What it returns?
```

---

Because:

```text
JavaScript itself
does not contain type information.
```

---

TypeScript needs:

```text
Extra Type Definitions
```

---

### What is a Type Declaration File?

A Type Declaration File contains:

```text
Type Information Only
```

---

Extension:

```text
.d.ts
```

---

Examples

```text
index.d.ts
react.d.ts
express.d.ts
node.d.ts
```

---

These files tell TypeScript:

```text
Functions
Classes
Interfaces
Variables
Modules
```

exist and what their types are.

---

### Why `.d.ts` Files Exist

JavaScript Example

```js
function add(a, b) {
  return a + b;
}
```

---

TypeScript cannot know:

```text
a type
b type
return type
```

---

Declaration File

```ts
declare function add(a: number, b: number): number;
```

---

Now TypeScript knows:

```text
Parameters
Return Type
```

without needing implementation.

---

### Important Rule

A declaration file contains:

```text
Types Only
```

---

Example

```ts
declare function add(a: number, b: number): number;
```

---

Notice:

```text
No function body
```

---

Only:

```text
Type Information
```

---

### How TypeScript Uses `.d.ts`

Suppose:

```ts
declare function greet(name: string): void;
```

---

When TypeScript sees:

```ts
greet("Prashant");
```

It performs:

```text
Compile-time Validation
```

---

But at runtime:

```text
Actual JavaScript Implementation
is executed.
```

---

### Real World Example

Consider:

```ts
setTimeout(() => {}, 1000);
```

---

Question:

```text
Where is setTimeout defined?
```

---

Answer:

Inside browser declaration files.

---

TypeScript already has:

```ts
declare function setTimeout(callback: Function, delay?: number): number;
```

---

That is why:

```ts
setTimeout("hello");
```

produces an error.

---

### What Does `declare` Mean?

One of the most important keywords.

---

Syntax

```ts
declare;
```

means:

```text
Trust Me.

This thing exists somewhere else.
```

---

Example

```ts
declare const API_URL: string;
```

---

Meaning:

```text
API_URL exists at runtime.

TypeScript only needs
its type information.
```

---

### Module Declaration Example

Suppose you use:

```ts
import logo from "./logo.png";
```

---

TypeScript Error:

```text
Cannot find module
'./logo.png'
```

---

Why?

Because TypeScript does not know:

```text
What a PNG file exports.
```

---

Solution

Create:

```ts
images.d.ts;
```

---

```ts
declare module "*.png" {
  const value: string;

  export default value;
}
```

---

Now:

```ts
import logo from "./logo.png";
```

works correctly.

---

### Understanding DefinitelyTyped

One of the most important TypeScript ecosystem concepts.

---

### What is DefinitelyTyped?

DefinitelyTyped is:

```text
A Huge Open Source Repository
containing Type Definitions
for JavaScript Libraries.
```

---

Repository:

:contentReference[oaicite:0]{index=0}

---

It provides type definitions for:

```text
React
Express
Lodash
Jest
Node.js
Moment
Thousands More
```

---

### Why Do We Need DefinitelyTyped?

Many libraries were originally written in:

```text
JavaScript
```

---

Example

```bash
npm install lodash
```

---

Lodash itself:

```text
May not include TypeScript types
```

---

So we install:

```bash
npm install -D @types/lodash
```

---

Now TypeScript gets:

```text
Lodash Type Definitions
```

from DefinitelyTyped.

---

### Understanding @types Packages

Convention:

```text
@types/library-name
```

---

Examples

```bash
npm install -D @types/node
```

---

```bash
npm install -D @types/react
```

---

```bash
npm install -D @types/express
```

---

```bash
npm install -D @types/lodash
```

---

These packages contain:

```text
Only .d.ts Files
```

---

No runtime code.

---

### Example — Node.js Types

Suppose:

```ts
console.log(process.env.PORT);
```

---

Without Node Types

```text
Cannot find name 'process'
```

---

Install

```bash
npm install -D @types/node
```

---

Now TypeScript understands:

```ts
process;
```

because:

```text
Node Type Definitions
were added.
```

---

### Example — Express Types

Install

```bash
npm install express
```

---

Then

```bash
npm install -D @types/express
```

---

Now TypeScript understands:

```ts
Request
Response
NextFunction
Express App
```

---

Example

```ts
import { Request, Response } from "express";
```

---

Without:

```text
@types/express
```

TypeScript would not know these types.

---

### Libraries With Built-In Types

Modern libraries often include their own declaration files.

---

Example

```bash
npm install axios
```

---

No need for:

```bash
@types/axios
```

---

Because Axios already ships with:

```text
Built-in Type Definitions
```

---

### How to Check if Types Exist

Look inside:

```text
node_modules/package-name
```

---

If package contains:

```text
index.d.ts
```

or

```json
{
  "types": "index.d.ts"
}
```

inside package.json

---

Then:

```text
Types are built-in
```

---

No need for:

```text
@types package
```

---

### Creating Your Own Declaration File

Suppose JavaScript file:

```js
// math.js

function add(a, b) {
  return a + b;
}

module.exports = {
  add,
};
```

---

TypeScript doesn't know types.

---

Create

```text
math.d.ts
```

---

```ts
declare module "./math" {
  export function add(a: number, b: number): number;
}
```

---

Now TypeScript understands:

```ts
import { add } from "./math";
```

correctly.

---

### Common Real-World `.d.ts` Files

---

React

```text
react/index.d.ts
```

---

Node

```text
node/index.d.ts
```

---

Express

```text
express/index.d.ts
```

---

Jest

```text
jest/index.d.ts
```

---

These files power:

```text
Autocomplete
Type Checking
IntelliSense
Compile-Time Safety
```

---

### Benefits of Declaration Files

---

#### Type Safety

```ts
user.name.toUpperCase();
```

TypeScript validates.

---

#### Autocomplete

IDE can suggest:

```text
Methods
Properties
Functions
```

---

#### Better Documentation

Types become:

```text
Self-Documenting APIs
```

---

#### Early Error Detection

Errors appear:

```text
At Compile Time
```

instead of runtime.

---

### Common Mistakes

---

#### Installing Library But Not Types

Install

```bash
npm install express
```

---

Forget

```bash
npm install -D @types/express
```

---

Result

```text
Missing Type Definitions
```

---

#### Creating Implementation in `.d.ts`

Wrong

```ts
declare function add() {
}
```

---

Declaration files contain:

```text
No Implementation
```

---

Correct

```ts
declare function add(): void;
```

---

#### Confusing `.ts` and `.d.ts`

`.ts`

```text
Contains Implementation
```

---

`.d.ts`

```text
Contains Types Only
```

---

### Interview Questions

---

#### Q1

What is a `.d.ts` file?

#### Answer

```text
A Type Declaration File
that contains type information
without implementation.
```

---

#### Q2

What does `declare` mean?

#### Answer

```text
This value exists elsewhere.
TypeScript should trust it.
```

---

#### Q3

What is DefinitelyTyped?

#### Answer

```text
An open-source repository
containing type definitions
for JavaScript libraries.
```

---

#### Q4

What is `@types/react`?

#### Answer

```text
React type definitions
from DefinitelyTyped.
```

---

#### Q5

Do `.d.ts` files generate JavaScript?

#### Answer

```text
No.
```

---

### Cheat Sheet

```text
.d.ts
```

↓

```text
Type Declaration File
```

---

```ts
declare function add(): void;
```

---

```ts
declare const API_URL: string;
```

---

```bash
npm install -D @types/node
```

---

```bash
npm install -D @types/express
```

---

```bash
npm install -D @types/lodash
```

---

```text
DefinitelyTyped
```

↓

```text
Community Type Definitions
```

---

### Key Takeaways

- `.d.ts` files contain type information only.
- Declaration files help TypeScript understand JavaScript code.
- `declare` tells TypeScript that something exists elsewhere.
- DefinitelyTyped provides type definitions for thousands of JavaScript libraries.
- `@types/*` packages usually come from DefinitelyTyped.
- Many modern libraries ship with built-in type definitions.
- `.d.ts` files improve autocomplete, type safety and developer experience.
- No JavaScript is generated from declaration files.
- Understanding declaration files is essential when working with external libraries.
- Type declarations form the foundation of the TypeScript ecosystem.
