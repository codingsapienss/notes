# OOP Design Concepts

> In previous chapters, we learned:
>
> - Classes
> - Access Modifiers
> - Getters & Setters
> - Inheritance
> - Interfaces
> - Abstract Classes
>
> These are language features.
>
> However, writing good software requires understanding:
>
> ```text
> How to Design Systems Properly
> ```
>
> This chapter covers the most important Object-Oriented Design concepts:
>
> - Encapsulation
> - Abstraction
> - Inheritance
> - Polymorphism
> - Composition over Inheritance
>
> These concepts are frequently discussed in:
>
> - Interviews
> - System Design
> - Enterprise Applications
> - Framework Design

---

# The Four Pillars of OOP

Object-Oriented Programming is built upon:

```text
1. Encapsulation
2. Abstraction
3. Inheritance
4. Polymorphism
```

---

# 1. Encapsulation

---

## What is Encapsulation?

Encapsulation means:

```text
Bundling Data
+
Methods That Operate On Data
Inside A Single Unit
```

That unit is usually:

```text
A Class
```

---

## Real World Example

Without Encapsulation:

```ts
let balance = 1000;

balance = -50000;
```

---

Problem:

```text
Anyone can modify balance
Invalid state possible
```

---

With Encapsulation:

```ts
class BankAccount {
  private balance = 0;

  deposit(amount: number) {
    this.balance += amount;
  }

  getBalance() {
    return this.balance;
  }
}
```

---

Usage:

```ts
const account = new BankAccount();

account.deposit(1000);

console.log(account.getBalance());
```

Output:

```text
1000
```

---

Now:

```ts
account.balance;
```

is inaccessible.

---

## Benefits

```text
Data Protection
Controlled Access
Reduced Bugs
Better Maintainability
```

---

# 2. Abstraction

---

## What is Abstraction?

Abstraction means:

```text
Show What
Hide How
```

---

Users should see:

```text
What a system does
```

not

```text
How it works internally
```

---

## Real World Example

Using a Car:

```text
Steering
Brake
Accelerator
```

---

You don't need to know:

```text
Fuel Injection
Engine Timing
Combustion Process
```

---

Those details are hidden.

---

## Example

Interface:

```ts
interface Payment {
  pay(amount: number): void;
}
```

---

Implementation:

```ts
class CreditCard implements Payment {
  pay(amount: number) {
    console.log(`Paid ${amount}`);
  }
}
```

---

Usage:

```ts
const payment = new CreditCard();

payment.pay(100);
```

---

User only sees:

```ts
pay();
```

---

Not:

```text
API Calls
Encryption
Database Updates
```

---

## Benefits

```text
Reduced Complexity
Cleaner APIs
Loose Coupling
Better Flexibility
```

---

# 3. Inheritance

---

## What is Inheritance?

Inheritance allows:

```text
One Class
to acquire
properties and methods
from another class.
```

---

Example:

```ts
class Animal {
  eat() {
    console.log("Eating");
  }
}
```

---

```ts
class Dog extends Animal {}
```

---

Usage:

```ts
const dog = new Dog();

dog.eat();
```

Output:

```text
Eating
```

---

Dog inherited:

```text
eat()
```

from:

```text
Animal
```

---

## Benefits

```text
Code Reuse
Reduced Duplication
Hierarchical Relationships
```

---

## Drawbacks

Overusing inheritance creates:

```text
Deep Hierarchies
Tight Coupling
Complex Systems
```

---

Example:

```text
Animal
  ↓
FlyingAnimal
  ↓
FlyingSwimmingAnimal
  ↓
FlyingSwimmingTalkingAnimal
```

---

This becomes difficult to maintain.

---

# 4. Polymorphism

---

## What is Polymorphism?

Word Meaning:

```text
Poly  = Many

Morph = Forms
```

Meaning:

```text
Same Interface
Different Behaviors
```

---

## Example

Interface:

```ts
interface Animal {
  makeSound(): void;
}
```

---

Implementation:

```ts
class Dog implements Animal {
  makeSound() {
    console.log("Woof");
  }
}
```

---

```ts
class Cat implements Animal {
  makeSound() {
    console.log("Meow");
  }
}
```

---

Function:

```ts
function playSound(animal: Animal) {
  animal.makeSound();
}
```

---

Usage:

```ts
playSound(new Dog());
```

Output:

```text
Woof
```

---

Usage:

```ts
playSound(new Cat());
```

Output:

```text
Meow
```

---

Same function.

Different behavior.

---

This is:

```text
Polymorphism
```

---

## Benefits

```text
Flexible Systems
Reusable Logic
Less Conditional Code
Easy Extensibility
```

---

# The Biggest Modern OOP Principle

# Composition Over Inheritance

---

## What is Composition?

Composition means:

```text
Building Objects
Using Smaller Objects
```

instead of:

```text
Large Inheritance Trees
```

---

## Traditional Inheritance Approach

Example:

```ts
class Animal {
  eat() {}
}
```

---

```ts
class FlyingAnimal extends Animal {
  fly() {}
}
```

---

```ts
class FlyingSwimmingAnimal extends FlyingAnimal {
  swim() {}
}
```

---

Problem:

```text
Deep Class Hierarchies
Tight Coupling
Hard To Change
```

---

# Composition Approach

Create behaviors separately.

---

```ts
class FlyBehavior {
  fly() {
    console.log("Flying");
  }
}
```

---

```ts
class SwimBehavior {
  swim() {
    console.log("Swimming");
  }
}
```

---

```ts
class Duck {
  constructor(
    public flyBehavior: FlyBehavior,

    public swimBehavior: SwimBehavior,
  ) {}
}
```

---

Usage:

```ts
const duck = new Duck(new FlyBehavior(), new SwimBehavior());

duck.flyBehavior.fly();

duck.swimBehavior.swim();
```

---

Output:

```text
Flying
Swimming
```

---

## Why Composition is Better?

Instead of:

```text
IS-A Relationship
```

Inheritance focuses on:

```text
Dog IS-A Animal
```

---

Composition focuses on:

```text
HAS-A Relationship
```

---

Example:

```text
Duck HAS-A FlyBehavior
Duck HAS-A SwimBehavior
```

---

This is usually more flexible.

---

# Real World Example

React Components

React does NOT use:

```text
Deep Inheritance Trees
```

---

Instead:

```text
Component Composition
```

---

Example:

```tsx
<Card>
  <Header />
  <Body />
  <Footer />
</Card>
```

---

This is:

```text
Composition
```

---

# Another Example

Car System

---

Bad Design

```ts
class Vehicle {}

class Car extends Vehicle {}

class SportsCar extends Car {}

class RacingSportsCar extends SportsCar {}
```

---

Good Design

```ts
class Engine {}

class GPS {}

class Turbo {}
```

---

```ts
class Car {
  constructor(
    public engine: Engine,
    public gps: GPS,
    public turbo: Turbo,
  ) {}
}
```

---

More flexible.

---

# When To Use What?

---

## Use Encapsulation When

```text
Protecting Internal State
```

Examples:

```text
Bank Accounts
User Passwords
Tokens
```

---

## Use Abstraction When

```text
Complex Logic
Must Be Hidden
```

Examples:

```text
Payment Systems
Database Access
API Clients
```

---

## Use Inheritance When

```text
True IS-A Relationship Exists
```

Examples:

```text
Dog → Animal
Car → Vehicle
```

---

## Use Polymorphism When

```text
Same Action
Different Implementations
```

Examples:

```text
Payment Methods
Animals
Notifications
```

---

## Use Composition When

```text
Behavior Changes Frequently
```

Examples:

```text
React Components
Game Objects
Large Applications
```

---

# Modern Industry Recommendation

Historically:

```text
Inheritance First
```

---

Modern Software Design:

```text
Composition First
```

---

Reason:

```text
Less Coupling
Better Reusability
More Flexible Systems
```

---

# Real World Mapping

| Concept       | Example                    |
| ------------- | -------------------------- |
| Encapsulation | Bank Account               |
| Abstraction   | Payment Gateway            |
| Inheritance   | Dog extends Animal         |
| Polymorphism  | Multiple Payment Providers |
| Composition   | React Components           |

---

# Interview Questions

---

## Q1

What are the four pillars of OOP?

### Answer

```text
Encapsulation
Abstraction
Inheritance
Polymorphism
```

---

## Q2

What is Encapsulation?

### Answer

```text
Bundling data and methods
while protecting internal state.
```

---

## Q3

What is Abstraction?

### Answer

```text
Showing important details
while hiding implementation.
```

---

## Q4

What is Polymorphism?

### Answer

```text
Same interface,
different implementations.
```

---

## Q5

What is Composition?

### Answer

```text
Building objects using
other objects instead of
deep inheritance.
```

---

## Q6

Why is Composition preferred over Inheritance?

### Answer

```text
More flexible,
less coupled,
easier to maintain.
```

---

# Cheat Sheet

```text
Encapsulation
=
Protect Data
```

---

```text
Abstraction
=
Hide Complexity
```

---

```text
Inheritance
=
IS-A
```

---

```text
Polymorphism
=
Same Interface
Different Behavior
```

---

```text
Composition
=
HAS-A
```

---

# Key Takeaways

- Encapsulation protects internal state.
- Abstraction hides implementation details.
- Inheritance enables code reuse through IS-A relationships.
- Polymorphism enables multiple implementations behind a common interface.
- Composition builds objects from smaller reusable pieces.
- Modern TypeScript applications prefer Composition over deep inheritance.
- Good software design focuses on flexibility and maintainability rather than excessive class hierarchies.
- Understanding these principles is more important than memorizing syntax.
- These concepts appear frequently in interviews and real-world system design discussions.

---
 


---\n*Last refined on April 30, 2026*
