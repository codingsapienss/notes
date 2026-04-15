# Getters, Setters & Static Members

> In Part 6A and 6B, we learned:
>
> - Classes
> - Constructors
> - Methods
> - Access Modifiers
>
> However, directly exposing properties is not always ideal.
>
> Sometimes we need:
>
> - Validation before updating data
> - Computed properties
> - Controlled access to internal state
> - Shared class-level data
>
> TypeScript provides:
>
> - Getters
> - Setters
> - Static Properties
> - Static Methods
>
> to solve these problems.

---

# Why Do We Need Getters and Setters?

Consider:

```ts
class User {
  public age: number = 0;
}
```

---

Usage:

```ts
const user = new User();

user.age = -100;
```

---

Problem:

```text
Invalid State
```

Age should never be negative.

---

We need:

```text
Controlled Read Access
Controlled Write Access
```

---

This is where:

```text
Getters
Setters
```

become useful.

---

# What is a Getter?

A Getter is a special method used to:

```text
Read a value like a property
```

while executing custom logic behind the scenes.

---

# Getter Syntax

```ts
get propertyName() {
  return value;
}
```

---

# Basic Getter Example

```ts
class User {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }
}
```

---

Usage

```ts
const user = new User("Prashant");

console.log(user.name);
```

Output

```text
Prashant
```

---

Notice:

```ts
user.name;
```

NOT

```ts
user.name();
```

---

Getters behave like:

```text
Normal Properties
```

---

# How Getters Work Internally

When you write:

```ts
user.name;
```

TypeScript automatically calls:

```ts
get name()
```

---

Flow

```text
user.name
     ↓
get name()
     ↓
return _name
```

---

# Why Use Getters?

Useful when:

```text
Reading Data Requires Logic
```

---

Example

```ts
class User {
  constructor(
    public firstName: string,
    public lastName: string,
  ) {}

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

---

Usage

```ts
const user = new User("Prashant", "Sharma");

console.log(user.fullName);
```

Output

```text
Prashant Sharma
```

---

Notice:

```text
fullName
```

is never stored in memory.

It is:

```text
Computed Dynamically
```

---

# Computed Property Example

```ts
class Rectangle {
  constructor(
    public width: number,
    public height: number,
  ) {}

  get area() {
    return this.width * this.height;
  }
}
```

---

Usage

```ts
const rect = new Rectangle(10, 5);

console.log(rect.area);
```

Output

```text
50
```

---

No separate:

```ts
area;
```

property exists.

---

# What is a Setter?

A Setter is a special method used to:

```text
Control Property Updates
```

before data is stored.

---

# Setter Syntax

```ts
set propertyName(value) {
}
```

---

# Basic Setter Example

```ts
class User {
  private _age = 0;

  set age(value: number) {
    this._age = value;
  }
}
```

---

Usage

```ts
const user = new User();

user.age = 25;
```

Setter automatically runs.

---

# Validation Using Setters

One of the most common use cases.

---

Example

```ts
class User {
  private _age = 0;

  set age(value: number) {
    if (value < 0) {
      throw new Error("Age cannot be negative");
    }

    this._age = value;
  }

  get age() {
    return this._age;
  }
}
```

---

Valid

```ts
user.age = 25;
```

---

Invalid

```ts
user.age = -10;
```

Throws:

```text
Error:
Age cannot be negative
```

---

# Getter and Setter Together

Very common.

---

Example

```ts
class User {
  private _name = "";

  get name() {
    return this._name;
  }

  set name(value: string) {
    if (value.length < 3) {
      throw new Error("Name too short");
    }

    this._name = value;
  }
}
```

---

Usage

```ts
const user = new User();

user.name = "Prashant";

console.log(user.name);
```

Output

```text
Prashant
```

---

# Why Use Private Backing Variables?

Notice:

```ts
private _name
```

---

instead of:

```ts
name;
```

---

Why?

Because:

```ts
set name()
```

and

```ts
get name()
```

already use:

```ts
name;
```

as the public interface.

---

Convention:

```ts
_name;
_age;
_balance;
_salary;
```

represent:

```text
Internal Storage
```

---

# Real World Example

Bank Account

```ts
class BankAccount {
  private _balance = 0;

  get balance() {
    return this._balance;
  }

  set balance(value: number) {
    if (value < 0) {
      throw new Error("Balance cannot be negative");
    }

    this._balance = value;
  }
}
```

---

Usage

```ts
const account = new BankAccount();

account.balance = 5000;

console.log(account.balance);
```

Output

```text
5000
```

---

# When Should You Use Getters and Setters?

Use them when:

```text
Validation Needed
Computed Values
Controlled Access
Data Transformation
```

---

Avoid them when:

```text
Simple Property Access
```

is sufficient.

---

# What are Static Members?

Until now:

```ts
const user1 = new User();
const user2 = new User();
```

Every object gets its own properties.

---

Sometimes we need:

```text
One Shared Value
Across Entire Class
```

---

This is where:

```ts
static;
```

comes in.

---

# Static Properties

A Static Property belongs to:

```text
The Class
```

NOT:

```text
The Object
```

---

# Example

```ts
class User {
  static totalUsers = 0;

  constructor() {
    User.totalUsers++;
  }
}
```

---

Create Objects

```ts
new User();
new User();
new User();
```

---

Output

```ts
console.log(User.totalUsers);
```

```text
3
```

---

# Memory Visualization

Normal Property

```ts
user.name;
```

Stored inside:

```text
Each Object
```

---

Static Property

```ts
User.totalUsers;
```

Stored inside:

```text
Class Itself
```

---

# Static Property Access

Correct

```ts
User.totalUsers;
```

---

Wrong

```ts
const user = new User();

user.totalUsers;
```

Error.

---

Because:

```text
Static Members
Belong To Class
```

---

# Static Methods

Just like static properties.

---

They belong to:

```text
Class
```

not objects.

---

# Example

```ts
class MathUtils {
  static add(a: number, b: number) {
    return a + b;
  }
}
```

---

Usage

```ts
console.log(MathUtils.add(10, 20));
```

Output

```text
30
```

---

No Object Needed

```ts
MathUtils.add();
```

works directly.

---

# Why Use Static Methods?

Useful for:

```text
Helper Functions
Utility Methods
Shared Logic
Factory Methods
```

---

Examples

```text
Math.max()
Number.isNaN()
Array.isArray()
```

All are static methods.

---

# Static Method Example

```ts
class Temperature {
  static celsiusToFahrenheit(celsius: number) {
    return (celsius * 9) / 5 + 32;
  }
}
```

---

Usage

```ts
console.log(Temperature.celsiusToFahrenheit(30));
```

Output

```text
86
```

---

# Static vs Instance Members

---

Instance Property

```ts
class User {
  name: string = "";
}
```

---

Access

```ts
const user = new User();

user.name;
```

---

Static Property

```ts
class User {
  static totalUsers = 0;
}
```

---

Access

```ts
User.totalUsers;
```

---

# Can Static Methods Access Instance Properties?

Consider:

```ts
class User {
  name = "Prashant";

  static printName() {
    console.log(this.name);
  }
}
```

---

Problem:

```text
Error
```

---

Why?

Because:

```text
Static Methods
Do Not Belong To Objects
```

---

They belong to:

```text
Class
```

---

# What Does this Mean in Static Methods?

Instance Method

```ts
greet() {
  console.log(this.name);
}
```

---

Here:

```text
this
```

refers to:

```text
Current Object
```

---

Static Method

```ts
static print() {}
```

---

Here:

```text
this
```

refers to:

```text
The Class Itself
```

---

Example

```ts
class User {
  static totalUsers = 5;

  static printCount() {
    console.log(this.totalUsers);
  }
}
```

---

Valid.

---

Output

```text
5
```

---

# Real World Example

```ts
class User {
  static totalUsers = 0;

  constructor(public name: string) {
    User.totalUsers++;
  }

  static getTotalUsers() {
    return User.totalUsers;
  }
}
```

---

Usage

```ts
new User("A");
new User("B");
new User("C");

console.log(User.getTotalUsers());
```

Output

```text
3
```

---

# Common Mistakes

---

## Accessing Static Members Through Objects

Wrong

```ts
const user = new User();

user.totalUsers;
```

---

Correct

```ts
User.totalUsers;
```

---

## Accessing Instance Properties in Static Methods

Wrong

```ts
static print() {
  console.log(this.name);
}
```

---

Because:

```text
No Object Exists
```

---

## Infinite Recursion in Getter

Wrong

```ts
get name() {
  return this.name;
}
```

---

Calls itself forever.

---

Correct

```ts
get name() {
  return this._name;
}
```

---

# Interview Questions

---

## Q1

What is a Getter?

### Answer

```text
A special method used to read
a value like a property.
```

---

## Q2

What is a Setter?

### Answer

```text
A special method used to control
property updates.
```

---

## Q3

Why use Setters?

### Answer

```text
Validation
Controlled Updates
Business Rules
```

---

## Q4

What is a Static Property?

### Answer

```text
A property that belongs
to the class itself.
```

---

## Q5

Can static methods access instance properties?

### Answer

```text
No.

Static methods belong
to the class,
not objects.
```

---

## Q6

What does this refer to inside a static method?

### Answer

```text
The Class Itself
```

---

# Cheat Sheet

```ts
get name() {
  return this._name;
}
```

---

```ts
set name(value) {
  this._name = value;
}
```

---

```ts
static totalUsers = 0;
```

---

```ts
static add(a,b) {
  return a+b;
}
```

---

```ts
User.totalUsers;
```

---

```ts
MathUtils.add(10, 20);
```

---

# Key Takeaways

- Getters allow controlled reading of data.
- Setters allow controlled updates and validation.
- Getters and Setters behave like normal properties.
- Private backing variables (`_name`, `_age`) are commonly used.
- Static members belong to the class, not objects.
- Static properties store shared data.
- Static methods provide utility and helper functionality.
- `this` inside static methods refers to the class itself.
- Static members are accessed using the class name.
- Getters, Setters and Static members are heavily used in production TypeScript applications.

---


---\n*Last refined on April 16, 2026*
