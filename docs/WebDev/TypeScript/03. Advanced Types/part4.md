# Type Assertions, `any`, `unknown`, and `never`

> TypeScript tries to infer and validate types automatically.
>
> However, there are situations where:
>
> - TypeScript doesn't know enough information.
> - We know more than TypeScript.
> - External APIs return unknown data.
> - DOM elements need specific types.
>
> In such cases, TypeScript provides:
>
> ```text
> Type Assertions
> ```
>
> Along with three extremely important special types:
>
> ```text
> any
> unknown
> never
> ```
>
> Understanding these properly is essential because they directly affect type safety.

---

### What is Type Assertion?

Type Assertion tells TypeScript:

```text
Trust me.
I know the type better than you do.
```

---

### Syntax

#### Modern Syntax

```ts
value as Type;
```

---

#### Alternative Syntax

```ts
<Type>value;
```

Older syntax.

Less commonly used.

---

### First Example

```ts
const value: unknown = "Hello TypeScript";
```

---

TypeScript only knows:

```ts
unknown;
```

---

This is invalid:

```ts
console.log(value.length);
```

Error.

---

TypeScript cannot guarantee:

```ts
value is a string
```

---

Use Assertion:

```ts
const text = value as string;

console.log(text.length);
```

Output:

```text
16
```

---

### What Happens Internally?

Consider:

```ts
const value = "Hello" as string;
```

---

TypeScript accepts:

```ts
string;
```

---

Generated JavaScript:

```js
const value = "Hello";
```

---

Important:

```text
Assertions disappear after compilation.
```

---

They only exist during:

```text
Compile Time
```

---

### Type Assertion Does NOT Convert Values

Very important interview topic.

---

Many beginners think:

```ts
const value = "123" as number;
```

means:

```text
Convert string into number
```

Wrong.

---

Type Assertions:

```text
DO NOT change values.
```

---

They only tell TypeScript:

```text
Treat this value as this type.
```

---

### Type Conversion vs Type Assertion

---

#### Type Conversion

Actually changes data.

```ts
const value = Number("123");
```

Result:

```ts
123;
```

(Number)

---

#### Type Assertion

```ts
const value = "123" as unknown as number;
```

---

Result:

```text
Still a string at runtime.
```

---

No conversion happened.

---

### DOM Example

One of the most common use cases.

---

Consider:

```ts
const input = document.getElementById("username");
```

---

TypeScript infers:

```ts
HTMLElement | null;
```

---

Problem:

```ts
input.value;
```

Error.

---

Because:

```text
Not every HTMLElement
has a value property.
```

---

Use Assertion:

```ts
const input = document.getElementById("username") as HTMLInputElement;
```

---

Now:

```ts
console.log(input.value);
```

Valid.

---

### Type Assertion with Objects

---

Example

```ts
type User = {
  name: string;
};
```

---

```ts
const data = {
  name: "Prashant",
};
```

---

Assertion

```ts
const user = data as User;
```

---

Now:

```ts
user.name;
```

is fully typed.

---

### Double Assertion

Sometimes TypeScript refuses direct assertions.

---

Example

```ts
const value = "hello";
```

---

Invalid

```ts
const num = value as number;
```

Error.

---

TypeScript knows:

```text
string and number
are unrelated
```

---

Developers sometimes use:

```ts
const num = value as unknown as number;
```

---

This is called:

```text
Double Assertion
```

---

### Why Is Double Assertion Dangerous?

Because:

```ts
const value = "hello";

const num = value as unknown as number;

console.log(num.toFixed(2));
```

---

Runtime Crash.

---

TypeScript trusted us.

---

Reality:

```text
Value was still a string.
```

---

### The any Type

---

#### What is any?

`any` disables TypeScript type checking.

---

Example

```ts
let value: any;
```

---

Now anything is allowed.

---

```ts
value = "hello";
```

---

```ts
value = 100;
```

---

```ts
value = true;
```

---

All valid.

---

### Dangerous Example

```ts
let value: any = "hello";

value.toUpperCase();
```

Valid.

---

```ts
value = 100;

value.toUpperCase();
```

Still valid to TypeScript.

---

Runtime Crash.

---

Because:

```text
Type Safety is disabled.
```

---

### Why Does any Exist?

Useful when:

```text
Migrating JavaScript to TypeScript
```

or

```text
Working with unknown third-party code
```

---

But:

```text
Avoid using any whenever possible.
```

---

### Problems with any

---

TypeScript cannot help:

```ts
let value: any;
```

---

No:

```text
Autocomplete
Type Checking
Refactoring Support
Safety
```

---

You lose most benefits of TypeScript.

---

### The unknown Type

Introduced as a safer alternative to:

```ts
any;
```

---

### What is unknown?

Represents:

```text
A value whose type is not yet known.
```

---

Example

```ts
let value: unknown;
```

---

Any value allowed:

```ts
value = "hello";
```

---

```ts
value = 100;
```

---

```ts
value = true;
```

---

All valid.

---

### Difference from any

Consider:

```ts
let value: unknown = "hello";
```

---

Attempt

```ts
value.toUpperCase();
```

Error.

---

TypeScript forces us to check first.

---

### Narrowing unknown

---

Example

```ts
let value: unknown = "hello";
```

---

```ts
if (typeof value === "string") {
  console.log(value.toUpperCase());
}
```

---

Valid.

---

TypeScript narrowed:

```ts
unknown;
```

↓

```ts
string;
```

---

### unknown vs any

| Feature            | any | unknown |
| ------------------ | --- | ------- |
| Stores Anything    | ✅  | ✅      |
| Type Safe          | ❌  | ✅      |
| Requires Narrowing | ❌  | ✅      |
| Recommended        | ❌  | ✅      |

---

### Real World Example

API Response

---

```ts
const response: unknown = await fetchData();
```

---

Now validate:

```ts
if (typeof response === "string") {
  console.log(response.length);
}
```

---

Safer.

---

### The never Type

One of the most misunderstood types.

---

### What is never?

Represents:

```text
A value that can never exist.
```

---

### Example 1

Function that always throws.

```ts
function throwError(): never {
  throw new Error("Something went wrong");
}
```

---

Function never returns.

---

### Example 2

Infinite Loop

```ts
function runForever(): never {
  while (true) {}
}
```

---

Never finishes.

---

### Difference Between void and never

---

#### void

```ts
function print(): void {
  console.log("Hello");
}
```

---

Function completes.

Returns nothing.

---

#### never

```ts
function crash(): never {
  throw new Error();
}
```

---

Function never completes.

---

### Visual Comparison

---

void

```text
Start
 ↓
Execute
 ↓
Finish
```

---

never

```text
Start
 ↓
Execute
 ↓
Never Returns
```

---

### never in Exhaustive Checks

Advanced but important.

---

Example

```ts
type Shape = "circle" | "square";
```

---

```ts
function processShape(shape: Shape) {
  switch (shape) {
    case "circle":
      return;

    case "square":
      return;

    default:
      const x: never = shape;
  }
}
```

---

If a new type is added:

```ts
| "triangle"
```

---

TypeScript immediately reports an error.

---

This technique is called:

```text
Exhaustive Checking
```

---

### Relationship Between any, unknown and never

---

#### any

```text
Can be anything.
```

---

#### unknown

```text
Can be anything,
but must be checked first.
```

---

#### never

```text
Can never be anything.
```

---

### Common Mistakes

---

#### Using any Everywhere

Bad

```ts
let data: any;
```

---

Use:

```ts
unknown;
```

instead.

---

#### Confusing Assertion with Conversion

Wrong

```ts
const num = "123" as number;
```

---

Assertions do not convert values.

---

#### Ignoring unknown Checks

Wrong

```ts
let value: unknown;

value.toUpperCase();
```

---

Must narrow first.

---

### Interview Questions

---

#### Q1

What is Type Assertion?

#### Answer

```text
A way to tell TypeScript
to treat a value as a specific type.
```

---

#### Q2

Does Type Assertion change values?

#### Answer

```text
No.
It only affects compile-time checking.
```

---

#### Q3

Difference between any and unknown?

#### Answer

```text
any:
No type safety.

unknown:
Requires validation before use.
```

---

#### Q4

What does never represent?

#### Answer

```text
A value that can never occur.
```

---

#### Q5

Difference between void and never?

#### Answer

```text
void:
Function completes.

never:
Function never returns.
```

---

### Cheat Sheet

```ts
value as string;
```

---

```ts
const input = document.getElementById("id") as HTMLInputElement;
```

---

```ts
let value: any;
```

---

```ts
let value: unknown;
```

---

```ts
function crash(): never {
  throw new Error();
}
```

---

```ts
typeof value === "string";
```

---

### Key Takeaways

- Type Assertions tell TypeScript to trust your type knowledge.
- Assertions do not perform runtime conversions.
- `any` disables type safety and should be avoided.
- `unknown` is a safer alternative to `any`.
- `unknown` requires narrowing before use.
- `never` represents impossible values or code paths.
- Functions that never return use the `never` type.
- Exhaustive checks often rely on `never`.
- Prefer `unknown` over `any` whenever possible.
- Understanding `any`, `unknown`, and `never` is essential for advanced TypeScript development.
