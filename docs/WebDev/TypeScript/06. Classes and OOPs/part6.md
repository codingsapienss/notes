# Abstract Classes

> In previous chapters, we learned:
>
> - Inheritance (`extends`)
> - Interfaces (`implements`)
>
> However, there is a middle ground between:
>
> ```text
> Interface
> ```
>
> and
>
> ```text
> Normal Class
> ```
>
> Sometimes we want:
>
> - Some common implementation
> - Some methods that MUST be implemented by child classes
>
> This is where:
>
> ```ts
> abstract class
> ```
>
> becomes useful.
>
> Abstract Classes are one of the most common OOP interview topics.

---

# Why Do We Need Abstract Classes?

Suppose we are building an Animal System.

Every animal can:

```text
Eat
Sleep
```

But every animal makes a different sound.

```text
Dog  → Woof
Cat  → Meow
Lion → Roar
```

---

Creating a normal parent class:

```ts
class Animal {
  eat() {
    console.log("Eating...");
  }

  makeSound() {
    // ???
  }
}
```

---

Problem:

```text
Animal itself does not know
how to make a sound.
```

---

We need:

```text
Force child classes
to provide implementation.
```

---

This is exactly why:

```ts
abstract;
```

exists.

---

# What is an Abstract Class?

An Abstract Class is:

```text
A class that cannot
be instantiated directly.
```

---

It acts as:

```text
A Base Blueprint
```

for child classes.

---

Syntax

```ts
abstract class Animal {}
```

---

# Important Rule

You CANNOT create an object of an abstract class.

---

Example

```ts
abstract class Animal {}
```

---

Wrong

```ts
const animal = new Animal();
```

---

Error

```text
Cannot create an instance
of an abstract class.
```

---

Why?

Because:

```text
Animal is incomplete.
```

---

Only child classes can be instantiated.

---

# Abstract Methods

The biggest feature of abstract classes.

---

An Abstract Method:

```text
Has Declaration
But No Implementation
```

---

Syntax

```ts
abstract methodName(): void;
```

---

Example

```ts
abstract class Animal {
  abstract makeSound(): void;
}
```

---

Notice:

```ts
abstract makeSound(): void;
```

No body.

No implementation.

---

# Why?

Because:

```text
Every child class
will implement it differently.
```

---

# Implementing Abstract Methods

---

Abstract Class

```ts
abstract class Animal {
  abstract makeSound(): void;
}
```

---

Child Class

```ts
class Dog extends Animal {
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

# What Happens If Child Class Doesn't Implement?

Example

```ts
abstract class Animal {
  abstract makeSound(): void;
}
```

---

Wrong

```ts
class Dog extends Animal {}
```

---

Error

```text
Non-abstract class
'Dog' does not implement
inherited abstract member.
```

---

Because:

```text
Contract Broken
```

---

# Abstract Class with Normal Methods

Abstract classes can contain:

```text
Normal Methods
```

and

```text
Abstract Methods
```

together.

---

Example

```ts
abstract class Animal {
  eat() {
    console.log("Eating...");
  }

  abstract makeSound(): void;
}
```

---

Child

```ts
class Dog extends Animal {
  makeSound() {
    console.log("Woof!");
  }
}
```

---

Usage

```ts
const dog = new Dog();

dog.eat();

dog.makeSound();
```

Output

```text
Eating...
Woof!
```

---

Notice:

```text
eat()
```

was inherited.

---

```text
makeSound()
```

was implemented.

---

# Real World Mental Model

Think of:

```text
Vehicle
```

---

Every vehicle:

```text
Start Engine
Stop Engine
```

---

But:

```text
Car
Bike
Truck
```

all start differently.

---

Abstract Class

```ts
abstract class Vehicle {
  abstract start(): void;

  stop() {
    console.log("Stopped");
  }
}
```

---

Car

```ts
class Car extends Vehicle {
  start() {
    console.log("Car Started");
  }
}
```

---

Usage

```ts
const car = new Car();

car.start();

car.stop();
```

Output

```text
Car Started
Stopped
```

---

# Abstract Properties

Not only methods.

Properties can also be abstract.

---

Example

```ts
abstract class Animal {
  abstract name: string;
}
```

---

Child

```ts
class Dog extends Animal {
  name = "Tommy";
}
```

---

Valid.

---

# Multiple Abstract Methods

---

Example

```ts
abstract class Shape {
  abstract area(): number;

  abstract perimeter(): number;
}
```

---

Implementation

```ts
class Rectangle extends Shape {
  constructor(
    public width: number,
    public height: number,
  ) {
    super();
  }

  area() {
    return this.width * this.height;
  }

  perimeter() {
    return 2 * (this.width + this.height);
  }
}
```

---

Usage

```ts
const rect = new Rectangle(10, 5);
```

---

Output

```ts
rect.area();
```

```text
50
```

---

# Constructors in Abstract Classes

Abstract classes can have constructors.

---

Example

```ts
abstract class Animal {
  constructor(public name: string) {}
}
```

---

Child

```ts
class Dog extends Animal {
  constructor(name: string) {
    super(name);
  }
}
```

---

Usage

```ts
const dog = new Dog("Tommy");
```

---

Output

```ts
console.log(dog.name);
```

```text
Tommy
```

---

# Abstract Class as a Type

Abstract classes can be used as types.

---

Example

```ts
abstract class Animal {
  abstract makeSound(): void;
}
```

---

```ts
class Dog extends Animal {
  makeSound() {
    console.log("Woof");
  }
}
```

---

Valid

```ts
let animal: Animal;

animal = new Dog();
```

---

Why?

Because:

```text
Dog IS-A Animal
```

---

# Polymorphism with Abstract Classes

---

Abstract Class

```ts
abstract class Animal {
  abstract makeSound(): void;
}
```

---

Children

```ts
class Dog extends Animal {
  makeSound() {
    console.log("Woof");
  }
}
```

---

```ts
class Cat extends Animal {
  makeSound() {
    console.log("Meow");
  }
}
```

---

Function

```ts
function play(animal: Animal) {
  animal.makeSound();
}
```

---

Usage

```ts
play(new Dog());
```

Output

```text
Woof
```

---

Usage

```ts
play(new Cat());
```

Output

```text
Meow
```

---

This is:

```text
Runtime Polymorphism
```

---

# Abstract Class vs Interface

One of the most common interview questions.

---

# Interface

```ts
interface Animal {
  makeSound(): void;
}
```

---

Provides:

```text
Contract Only
```

---

Cannot contain:

```text
Implementation
State
Constructors
```

(ignoring advanced edge cases)

---

# Abstract Class

```ts
abstract class Animal {
  eat() {
    console.log("Eating");
  }

  abstract makeSound(): void;
}
```

---

Provides:

```text
Contract
+
Implementation
```

---

# Comparison Table

| Feature               | Interface | Abstract Class |
| --------------------- | --------- | -------------- |
| Methods Declaration   | ✅        | ✅             |
| Method Implementation | ❌        | ✅             |
| Properties            | ✅        | ✅             |
| Constructors          | ❌        | ✅             |
| Access Modifiers      | ❌        | ✅             |
| State Storage         | ❌        | ✅             |
| Multiple Inheritance  | ✅        | ❌             |
| Code Reuse            | ❌        | ✅             |

---

# When to Use Interface?

Use Interface when:

```text
Only Contract Needed
```

Example:

```text
Payment Provider
Logger
Repository
Serializer
```

---

# When to Use Abstract Class?

Use Abstract Class when:

```text
Shared Logic Exists
```

Example:

```text
Vehicle
Animal
Employee
Shape
```

---

# Common Mistakes

---

## Instantiating Abstract Class

Wrong

```ts
new Animal();
```

---

Error.

---

Only child classes can be created.

---

## Forgetting Abstract Method Implementation

Wrong

```ts
class Dog extends Animal {}
```

---

Must implement:

```ts
makeSound();
```

---

## Using Abstract Class When Interface Is Enough

Bad

```text
Heavy hierarchy
for simple contracts
```

---

Prefer:

```ts
interface;
```

when no shared implementation exists.

---

# Interview Questions

---

## Q1

What is an Abstract Class?

### Answer

```text
A class that cannot
be instantiated directly
and may contain
abstract methods.
```

---

## Q2

What is an Abstract Method?

### Answer

```text
A method declaration
without implementation.
```

---

## Q3

Can Abstract Classes Have Normal Methods?

### Answer

```text
Yes.
```

---

## Q4

Can Abstract Classes Have Constructors?

### Answer

```text
Yes.
```

---

## Q5

Difference Between Interface and Abstract Class?

### Answer

```text
Interface:
Contract Only

Abstract Class:
Contract + Implementation
```

---

## Q6

Can Abstract Classes Be Used as Types?

### Answer

```text
Yes.
```

---

# Cheat Sheet

```ts
abstract class Animal {}
```

---

```ts
abstract makeSound(): void;
```

---

```ts
class Dog extends Animal {}
```

---

```ts
super(name);
```

---

```ts
let animal: Animal;
```

---

```ts
new Animal();
```

❌ Invalid

---

# Key Takeaways

- Abstract Classes are incomplete base classes.
- Abstract Classes cannot be instantiated directly.
- Abstract Methods provide declarations without implementation.
- Child classes must implement all abstract methods.
- Abstract Classes can contain normal methods and properties.
- Constructors are allowed in abstract classes.
- Abstract Classes support code reuse.
- Interfaces provide contracts only.
- Abstract Classes provide contracts plus implementation.
- Abstract Classes are heavily used in enterprise-level OOP designs.

---
 


---\n*Last refined on April 20, 2026*
