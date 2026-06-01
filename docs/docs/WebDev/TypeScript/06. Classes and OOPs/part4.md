# Inheritance

> One of the biggest advantages of Object-Oriented Programming is:
>
> ```text
> Code Reusability
> ```
>
> Instead of rewriting the same properties and methods again and again, we can create:
>
> ```text
> Parent Classes
> ```
>
> and allow other classes to inherit their functionality.
>
> This concept is called:
>
> ```text
> Inheritance
> ```
>
> In TypeScript, inheritance is implemented using:
>
> ```ts
> extends
> ```
>
> keyword.

---

# What is Inheritance?

Inheritance allows one class to:

```text
Acquire Properties and Methods
from another class.
```

---

# Real World Example

```text
Animal
 │
 ├── Dog
 ├── Cat
 └── Lion
```

All animals may have:

```text
name
age
eat()
sleep()
```

---

Instead of duplicating code:

```ts
class Dog {}
class Cat {}
class Lion {}
```

we create:

```ts
Animal;
```

once and reuse it.

---

# Parent Class vs Child Class

---

## Parent Class

Also called:

```text
Base Class
Super Class
```

---

Example

```ts
class Animal {}
```

---

## Child Class

Also called:

```text
Derived Class
Subclass
```

---

Example

```ts
class Dog extends Animal {}
```

---

Relationship:

```text
Animal
  ↑
 Dog
```

---

# extends Keyword

Inheritance is created using:

```ts
extends
```

---

Example

```ts
class Animal {
  eat() {
    console.log("Eating...");
  }
}

class Dog extends Animal {}
```

---

Create Object

```ts
const dog = new Dog();

dog.eat();
```

Output

```text
Eating...
```

---

Notice:

```text
Dog never defined eat()
```

It inherited it from:

```text
Animal
```

---

# Memory Visualization

```text
Animal
 │
 └── eat()
```

---

```text
Dog
 │
 └── inherits eat()
```

---

Object

```ts
const dog = new Dog();
```

Can access:

```ts
dog.eat();
```

because:

```text
Dog IS-A Animal
```

---

# Adding Child-Specific Methods

Child classes can have their own methods.

---

Example

```ts
class Animal {
  eat() {
    console.log("Eating...");
  }
}

class Dog extends Animal {
  bark() {
    console.log("Woof!");
  }
}
```

---

Usage

```ts
const dog = new Dog();

dog.eat();

dog.bark();
```

Output

```text
Eating...
Woof!
```

---

# Inheritance with Properties

---

Example

```ts
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

---

Child Class

```ts
class Dog extends Animal {}
```

---

Usage

```ts
const dog = new Dog("Tommy");

console.log(dog.name);
```

Output

```text
Tommy
```

---

Property inherited successfully.

---

# Constructors in Inheritance

Things become more interesting when constructors exist.

---

Parent

```ts
class Animal {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

---

Child

```ts
class Dog extends Animal {}
```

---

Usage

```ts
const dog = new Dog("Tommy");
```

Works.

---

Because:

```text
Dog automatically uses
Animal's constructor.
```

---

# Child Constructor

Suppose Dog needs:

```text
name
breed
```

---

Example

```ts
class Animal {
  constructor(public name: string) {}
}
```

---

```ts
class Dog extends Animal {
  constructor(
    name: string,
    public breed: string,
  ) {}
}
```

---

Error.

---

```text
Constructors for derived classes
must contain a super call.
```

---

# What is super()?

When a child class defines its own constructor:

```text
Parent Constructor
must execute first.
```

---

This is done using:

```ts
super();
```

---

# Correct Example

```ts
class Animal {
  constructor(public name: string) {}
}
```

---

```ts
class Dog extends Animal {
  constructor(
    name: string,
    public breed: string,
  ) {
    super(name);
  }
}
```

---

Usage

```ts
const dog = new Dog("Tommy", "Labrador");
```

---

Output

```ts
console.log(dog.name);
console.log(dog.breed);
```

```text
Tommy
Labrador
```

---

# Why Must super() Come First?

Consider:

```ts
class Dog extends Animal {
  constructor(name: string) {
    console.log("Dog");
    super(name);
  }
}
```

---

Error.

---

Because:

```text
this cannot be used
before super()
```

---

Flow

```text
Create Parent Object
        ↓
Initialize Parent
        ↓
Initialize Child
```

---

Parent must exist first.

---

# Method Overriding

One of the most important OOP concepts.

---

# What is Method Overriding?

A child class can:

```text
Replace
```

the implementation of a parent method.

---

Parent

```ts
class Animal {
  makeSound() {
    console.log("Some Sound");
  }
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

dog.makeSound();
```

Output

```text
Woof!
```

---

Parent method overridden.

---

# Overriding Example

---

Parent

```ts
class Employee {
  work() {
    console.log("Working...");
  }
}
```

---

Child

```ts
class Developer extends Employee {
  work() {
    console.log("Writing Code...");
  }
}
```

---

Usage

```ts
const dev = new Developer();

dev.work();
```

Output

```text
Writing Code...
```

---

# Calling Parent Method using super

Sometimes we want:

```text
Parent Logic
+
Child Logic
```

---

Example

```ts
class Animal {
  makeSound() {
    console.log("Animal Sound");
  }
}
```

---

```ts
class Dog extends Animal {
  makeSound() {
    super.makeSound();

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
Animal Sound
Woof!
```

---

# super Keyword

The keyword:

```ts
super
```

refers to:

```text
Parent Class
```

---

Used for:

```ts
super();
```

Parent Constructor

---

```ts
super.method();
```

Parent Method

---

# Access Modifiers and Inheritance

---

Parent

```ts
class Animal {
  public a = 1;

  protected b = 2;

  private c = 3;
}
```

---

Child

```ts
class Dog extends Animal {
  test() {
    console.log(this.a);

    console.log(this.b);

    console.log(this.c);
  }
}
```

---

Result

```text
a → Valid

b → Valid

c → Error
```

---

Because:

```text
private
```

is not inherited.

---

# Multi-Level Inheritance

TypeScript supports:

```text
Inheritance Chain
```

---

Example

```ts
class Animal {}

class Dog extends Animal {}

class Labrador extends Dog {}
```

---

Hierarchy

```text
Animal
   ↑
 Dog
   ↑
Labrador
```

---

Labrador inherits:

```text
Animal
Dog
```

features.

---

# instanceof Operator

Used to check inheritance relationships.

---

Example

```ts
class Animal {}

class Dog extends Animal {}
```

---

Usage

```ts
const dog = new Dog();
```

---

```ts
console.log(dog instanceof Dog);
```

Output

```text
true
```

---

```ts
console.log(dog instanceof Animal);
```

Output

```text
true
```

---

Because:

```text
Dog IS-A Animal
```

---

# Real World Example

```ts
class Employee {
  constructor(public name: string) {}

  work() {
    console.log(`${this.name} is working`);
  }
}
```

---

```ts
class Developer extends Employee {
  constructor(
    name: string,
    public language: string,
  ) {
    super(name);
  }

  work() {
    console.log(
      `${this.name}
       writes ${this.language}`,
    );
  }
}
```

---

Usage

```ts
const dev = new Developer("Prashant", "TypeScript");

dev.work();
```

Output

```text
Prashant writes TypeScript
```

---

# Common Mistakes

---

## Forgetting super()

Wrong

```ts
class Dog extends Animal {
  constructor() {}
}
```

---

Error.

---

Always call:

```ts
super(...)
```

---

## Using this Before super()

Wrong

```ts
constructor() {

  this.name = "Tom";
  super();
}
```

---

Error.

---

Correct

```ts
constructor() {

  super();

  this.name = "Tom";
}
```

---

## Expecting private Members to Inherit

Wrong

```ts
this.password;
```

inside child class.

---

private members:

```text
Are Not Accessible
```

in child classes.

---

Use:

```ts
protected;
```

instead.

---

# Interview Questions

---

## Q1

What is Inheritance?

### Answer

```text
A mechanism where one class
acquires properties and methods
from another class.
```

---

## Q2

Which keyword is used for inheritance?

### Answer

```ts
extends
```

---

## Q3

What is Method Overriding?

### Answer

```text
Providing a new implementation
of a parent method in a child class.
```

---

## Q4

What is super()?

### Answer

```text
Calls the parent constructor.
```

---

## Q5

Can private members be inherited?

### Answer

```text
No.

Only public and protected
members are accessible.
```

---

## Q6

What does instanceof do?

### Answer

```text
Checks whether an object
belongs to a class hierarchy.
```

---

# Cheat Sheet

```ts
class Dog extends Animal {}
```

---

```ts
super(name);
```

---

```ts
super.method();
```

---

```ts
instanceof
```

---

```ts
override method()
```

(Conceptually overriding)

---

```ts
protected member
```

accessible in child classes.

---

# Key Takeaways

- Inheritance allows code reuse between classes.
- `extends` is used to create inheritance relationships.
- Child classes automatically inherit parent properties and methods.
- `super()` calls the parent constructor.
- `super.method()` calls a parent method.
- Method Overriding allows child classes to customize behavior.
- `private` members are not accessible in child classes.
- `protected` members are accessible in child classes.
- Multi-level inheritance is supported.
- `instanceof` helps identify inheritance relationships at runtime.
- Inheritance is one of the core pillars of Object-Oriented Programming.

---
 
