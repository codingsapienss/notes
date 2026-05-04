# Interfaces with Classes

> In previous chapters, we learned:
>
> - Classes
> - Access Modifiers
> - Getters & Setters
> - Inheritance
>
> However, inheritance is not always the best way to define object behavior.
>
> Sometimes we want to say:
>
> ```text
> Any class that wants to be a Vehicle
> must implement these methods.
> ```
>
> without providing any implementation.
>
> This is where:
>
> ```ts
> interface;
> ```
>
> and
>
> ```ts
> implements;
> ```
>
> become extremely useful.
>
> This chapter covers:
>
> - Interfaces with Classes
> - implements Keyword
> - Multiple Interfaces
> - Polymorphism

---

### What is an Interface?

An Interface defines:

```text
A Contract
```

that a class must follow.

---

Example:

```ts
interface Animal {
  makeSound(): void;
}
```

---

Meaning:

```text
Any class implementing Animal
must provide makeSound().
```

---

Notice:

```ts
interface Animal {
  makeSound(): void;
}
```

contains:

```text
What should exist
```

NOT

```text
How it should work
```

---

### Why Do We Need Interfaces?

Suppose we have:

```text
Dog
Cat
Lion
```

All should have:

```ts
makeSound();
```

---

But:

```text
Implementation differs
```

---

Dog:

```text
Woof
```

---

Cat:

```text
Meow
```

---

Lion:

```text
Roar
```

---

An Interface helps define:

```text
Common Structure
```

without forcing implementation.

---

### implements Keyword

A class uses:

```ts
implements;
```

to follow an interface contract.

---

### Basic Example

Interface

```ts
interface Animal {
  makeSound(): void;
}
```

---

Class

```ts
class Dog implements Animal {
  makeSound() {
    console.log("Woof!");
  }
}
```

---

Usage

```ts
const dog = new Dog();

dog.makeSound();
```

Output

```text
Woof!
```

---

### What Happens Internally?

Interface

```ts
interface Animal {
  makeSound(): void;
}
```

tells TypeScript:

```text
Any implementing class
must define makeSound()
```

---

If Dog forgets:

```ts
class Dog implements Animal {}
```

---

Error

```text
Class 'Dog'
incorrectly implements interface 'Animal'
```

---

Because:

```text
Contract Broken
```

---

### Interface with Properties

Interfaces can define properties.

---

Example

```ts
interface User {
  id: number;

  name: string;
}
```

---

Class

```ts
class Employee implements User {
  constructor(
    public id: number,
    public name: string,
  ) {}
}
```

---

Usage

```ts
const emp = new Employee(1, "Prashant");
```

---

Output

```text
Employee {
 id: 1,
 name: "Prashant"
}
```

---

### Interface with Methods

---

Example

```ts
interface Shape {
  area(): number;
}
```

---

Class

```ts
class Rectangle implements Shape {
  constructor(
    public width: number,
    public height: number,
  ) {}

  area() {
    return this.width * this.height;
  }
}
```

---

Usage

```ts
const rect = new Rectangle(10, 5);

console.log(rect.area());
```

Output

```text
50
```

---

### Interface with Multiple Members

---

Example

```ts
interface Vehicle {
  brand: string;

  start(): void;

  stop(): void;
}
```

---

Implementation

```ts
class Car implements Vehicle {
  constructor(public brand: string) {}

  start() {
    console.log("Car Started");
  }

  stop() {
    console.log("Car Stopped");
  }
}
```

---

Usage

```ts
const car = new Car("BMW");

car.start();
```

Output

```text
Car Started
```

---

### Class Can Implement Multiple Interfaces

Unlike inheritance:

```ts
extends
```

which supports:

```text
Single Inheritance
```

---

Interfaces support:

```text
Multiple Contracts
```

---

### Example

Interface 1

```ts
interface Flyable {
  fly(): void;
}
```

---

Interface 2

```ts
interface Swimmable {
  swim(): void;
}
```

---

Class

```ts
class Duck implements Flyable, Swimmable {
  fly() {
    console.log("Flying");
  }

  swim() {
    console.log("Swimming");
  }
}
```

---

Usage

```ts
const duck = new Duck();

duck.fly();

duck.swim();
```

Output

```text
Flying
Swimming
```

---

### Why Multiple Interfaces Matter?

Real World Example:

```text
User
```

might be:

```text
Serializable
Loggable
Cacheable
```

all at the same time.

---

Example

```ts
class User
implements
  Serializable,
  Loggable,
  Cacheable
```

---

A class can satisfy multiple behaviors.

---

### extends vs implements

One of the most important interview topics.

---

### extends

Used for:

```text
Inheritance
```

---

Example

```ts
class Dog
extends Animal
```

---

Meaning:

```text
Dog IS-A Animal
```

---

Dog inherits:

```text
Properties
Methods
Implementation
```

---

### implements

Used for:

```text
Contracts
```

---

Example

```ts
class Dog
implements Animal
```

---

Meaning:

```text
Dog follows Animal rules
```

---

Dog inherits:

```text
Nothing
```

---

Must implement everything itself.

---

### Comparison Table

| Feature            | extends     | implements |
| ------------------ | ----------- | ---------- |
| Purpose            | Inheritance | Contract   |
| Reuse Code         | ✅          | ❌         |
| Inherit Methods    | ✅          | ❌         |
| Inherit Properties | ✅          | ❌         |
| Multiple Allowed   | ❌          | ✅         |
| OOP Relationship   | IS-A        | CAN-DO     |

---

### Interface + Inheritance Together

Very common.

---

Example

```ts
class Animal {
  eat() {
    console.log("Eating");
  }
}
```

---

Interface

```ts
interface Flyable {
  fly(): void;
}
```

---

Class

```ts
class Bird extends Animal implements Flyable {
  fly() {
    console.log("Flying");
  }
}
```

---

Usage

```ts
const bird = new Bird();

bird.eat();

bird.fly();
```

Output

```text
Eating
Flying
```

---

Bird gets:

```text
eat()
```

from:

```text
Animal
```

---

and satisfies:

```text
fly()
```

from:

```text
Flyable
```

---

### What is Polymorphism?

One of the four pillars of OOP.

---

Word Meaning:

```text
Poly = Many

Morph = Forms
```

---

Meaning:

```text
Same Interface
Different Implementations
```

---

### Example

Interface

```ts
interface Animal {
  makeSound(): void;
}
```

---

Classes

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

```ts
class Lion implements Animal {
  makeSound() {
    console.log("Roar");
  }
}
```

---

All classes:

```text
Look the same externally
```

---

But behave differently.

---

### Polymorphic Function

```ts
function playSound(animal: Animal) {
  animal.makeSound();
}
```

---

Usage

```ts
playSound(new Dog());
```

Output

```text
Woof
```

---

Usage

```ts
playSound(new Cat());
```

Output

```text
Meow
```

---

Usage

```ts
playSound(new Lion());
```

Output

```text
Roar
```

---

Same function.

Different behavior.

---

This is:

```text
Runtime Polymorphism
```

---

### Why Polymorphism Matters?

Without polymorphism:

```ts
if (type === "dog") {
}

if (type === "cat") {
}

if (type === "lion") {
}
```

---

Huge code duplication.

---

With polymorphism:

```ts
animal.makeSound();
```

---

Clean.

Flexible.

Extensible.

---

### Real World Example

Payment Systems

---

Interface

```ts
interface Payment {
  pay(amount: number): void;
}
```

---

Implementation

```ts
class CreditCard implements Payment {
  pay(amount: number) {
    console.log(
      `Paid ${amount}
       via Credit Card`,
    );
  }
}
```

---

```ts
class PayPal implements Payment {
  pay(amount: number) {
    console.log(
      `Paid ${amount}
       via PayPal`,
    );
  }
}
```

---

Function

```ts
function processPayment(payment: Payment) {
  payment.pay(100);
}
```

---

Usage

```ts
processPayment(new CreditCard());
```

---

Output

```text
Paid 100 via Credit Card
```

---

Usage

```ts
processPayment(new PayPal());
```

---

Output

```text
Paid 100 via PayPal
```

---

### Common Mistakes

---

#### Confusing extends and implements

Wrong Thinking:

```text
implements inherits code
```

No.

---

```text
implements only enforces rules
```

---

#### Forgetting Required Members

Wrong

```ts
class Dog implements Animal {}
```

---

Must implement:

```ts
makeSound();
```

---

#### Using Interfaces for Code Reuse

Interfaces provide:

```text
Structure
```

not

```text
Implementation
```

---

Use:

```ts
extends
```

for code reuse.

---

### Interview Questions

---

#### Q1

What is an Interface?

#### Answer

```text
A contract that defines
the structure a class
must follow.
```

---

#### Q2

What does implements do?

#### Answer

```text
Makes a class satisfy
an interface contract.
```

---

#### Q3

Difference between extends and implements?

#### Answer

```text
extends:
Inheritance

implements:
Contract enforcement
```

---

#### Q4

Can a class implement multiple interfaces?

#### Answer

```text
Yes
```

---

#### Q5

What is Polymorphism?

#### Answer

```text
Same interface
Different implementations
```

---

### Cheat Sheet

```ts
interface Animal {
  makeSound(): void;
}
```

---

```ts
class Dog
implements Animal
```

---

```ts
class Bird
extends Animal
implements Flyable
```

---

```ts
interface Flyable {
  fly(): void;
}
```

---

```ts
implements;
```

=

```text
Contract
```

---

```ts
extends
```

=

```text
Inheritance
```

---

### Key Takeaways

- Interfaces define contracts, not implementations.
- Classes use `implements` to satisfy interface requirements.
- Interfaces can contain properties and methods.
- A class can implement multiple interfaces.
- `implements` does not provide code reuse.
- `extends` provides inheritance and code reuse.
- Polymorphism allows the same interface to have multiple implementations.
- Interfaces are heavily used in enterprise TypeScript applications.
- Polymorphism reduces conditional logic and improves extensibility.
- Interfaces and Classes together form the foundation of scalable OOP design.
