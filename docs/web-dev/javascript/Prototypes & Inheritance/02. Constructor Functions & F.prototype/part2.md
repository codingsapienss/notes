# `F.prototype` in Depth

> Now that we understand **constructor functions** and how the **`new` operator** works internally, we can finally understand one of the most misunderstood concepts in JavaScript:
>
> ```javascript
> F.prototype;
> ```
>
> Many developers confuse:
>
> - `prototype`
> - `__proto__`
> - `[[Prototype]]`
>
> In reality, they all have completely different jobs.
>
> This chapter explains exactly **what `F.prototype` is**, **why it exists**, and **how JavaScript uses it internally**.

---

### Prerequisites

Before reading this chapter, you should understand:

- Constructor Functions
- `new`
- Objects
- Prototype Chain
- `[[Prototype]]`
- `prototype`
- `__proto__`

---

### Why Do We Need `F.prototype`?

Suppose we have

```javascript
function Rabbit(name) {
  this.name = name;
}
```

and we create

```javascript
const rabbit1 = new Rabbit("White");
const rabbit2 = new Rabbit("Black");
```

Question:

```text
How does JavaScript know
what prototype these objects should use?
```

The answer is

```text
Rabbit.prototype
```

---

### What is `F.prototype`?

`F.prototype` is simply a **normal property** that exists on every function.

Example

```javascript
function Rabbit() {}

console.log(Rabbit.prototype);
```

Output

```javascript
{
  constructor: Rabbit;
}
```

---

Notice

```text
prototype
```

is

```text
NOT

the prototype of the function.
```

Instead,

it is an object that **will become the prototype of future objects created using `new`**.

---

### Definition

`F.prototype` is a property of a constructor function that specifies the object to be assigned as the `[[Prototype]]` of every new object created with `new F()`.

---

### Important Rule

The most important sentence in this entire chapter is:

```text
F.prototype is NOT the prototype
of the function.

It becomes the prototype
of objects created by

new F()
```

---

### Visual Representation

```text
function Rabbit

│

├── prototype
│
▼
Prototype Object

▲

│

[[Prototype]]

│

rabbit
```

Notice

```text
Rabbit.prototype

↓

rabbit.[[Prototype]]
```

---

### Step-by-Step Example

Constructor

```javascript
function Rabbit(name) {
  this.name = name;
}
```

Prototype

```javascript
Rabbit.prototype = {
  eats: true,
};
```

Now create

```javascript
const rabbit = new Rabbit("White");
```

---

### What Happens Internally?

JavaScript performs

##### Step 1

Create

```javascript
{
}
```

---

##### Step 2

Set

```text
newObject.[[Prototype]]

↓

Rabbit.prototype
```

---

##### Step 3

Execute

```javascript
Rabbit.call(newObject, "White");
```

---

##### Step 4

Return

```text
newObject
```

---

Visualization

```text
Rabbit()

│

├── prototype

│

▼

{

    eats: true

}

▲

│

[[Prototype]]

│

rabbit
```

---

### Complete Memory Diagram

```text
Rabbit Function

│

├── prototype

│

▼

Prototype Object

┌────────────────────┐

│ eats : true        │

└────────────────────┘

▲

│

[[Prototype]]

│

rabbit

┌────────────────────┐

│ name : "White"     │

└────────────────────┘
```

---

### Accessing Prototype Properties

```javascript
function Rabbit(name) {
  this.name = name;
}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit("White");

console.log(rabbit.eats);
```

Output

```text
true
```

Search

```text
rabbit

↓

No eats

↓

Rabbit.prototype

↓

Found
```

---

### Every New Object Shares the Same Prototype

```javascript
const rabbit1 = new Rabbit("White");

const rabbit2 = new Rabbit("Black");
```

Memory

```text
rabbit1

↓

Rabbit.prototype

↑

rabbit2
```

One prototype.

Many objects.

---

### Why Is This Useful?

Suppose

```javascript
Rabbit.prototype.jump = function () {
  console.log("Jump");
};
```

Now

```javascript
rabbit1.jump();

rabbit2.jump();
```

Both work.

The function exists only once.

---

Visualization

```text
Rabbit.prototype

│

├── jump()

│

▲

│

rabbit1

rabbit2

rabbit3

rabbit4
```

One function.

Thousands of objects.

---

### `F.prototype` Is Used Only Once

This is another extremely important rule.

JavaScript uses

```javascript
F.prototype;
```

only when

```javascript
new F();
```

is executed.

After the object is created,

JavaScript never looks at

```javascript
F.prototype;
```

again.

---

Example

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();
```

Current relationship

```text
rabbit

↓

Object A
```

---

Now replace

```javascript
Rabbit.prototype = {
  jumps: true,
};
```

Current memory

```text
Rabbit.prototype

↓

Object B



rabbit

↓

Object A
```

---

Output

```javascript
console.log(rabbit.eats);
```

Output

```text
true
```

The existing rabbit still points to

```text
Object A
```

---

New object

```javascript
const rabbit2 = new Rabbit();
```

Memory

```text
rabbit

↓

Object A

----------------

rabbit2

↓

Object B
```

Different prototypes.

---

### Replacing vs Modifying

These two statements are very different.

---

Replacing

```javascript
Rabbit.prototype = {};
```

Creates

```text
New Prototype Object
```

Existing objects are unaffected.

---

Modifying

```javascript
Rabbit.prototype.eats = false;
```

Changes

```text
Existing Prototype Object
```

Every object sharing that prototype sees the update.

---

### Common Mistake

Many beginners think

```javascript
Rabbit.prototype

↓

rabbit
```

Wrong.

Correct relationship

```text
Rabbit Function

↓

prototype property

↓

Prototype Object

↓

[[Prototype]]

↓

rabbit
```

---

### Another Example

```javascript
function Animal() {}

Animal.prototype = {
  eat() {
    console.log("Eating");
  },
};

const dog = new Animal();

dog.eat();
```

Search

```text
dog

↓

No eat

↓

Animal.prototype

↓

Found

↓

Execute
```

---

### Internal Algorithm

Suppose

```javascript
new Rabbit();
```

JavaScript performs

```text
Create Object

↓

Set

[[Prototype]]

↓

Rabbit.prototype

↓

Execute Constructor

↓

Return Object
```

Notice

Only one step involves

```javascript
Rabbit.prototype;
```

Afterwards,

the object simply follows its own

```text
[[Prototype]]
```

reference.

---

### Why Doesn't JavaScript Copy Methods?

Suppose

```javascript
Rabbit.prototype.jump = function () {};
```

Without prototypes

```text
1000 Rabbits

↓

1000 jump()

Functions
```

With prototypes

```text
1000 Rabbits

↓

1 jump()

Function
```

Huge memory savings.

---

### Common Mistakes

#### Mistake 1

Thinking

```javascript
prototype;
```

is the prototype of the function.

Wrong.

It becomes the prototype of objects created by that function.

---

#### Mistake 2

Thinking changing

```javascript
Rabbit.prototype;
```

updates existing objects.

Wrong.

Only future objects use the new prototype.

---

#### Mistake 3

Confusing

```javascript
prototype;

__proto__[[Prototype]];
```

They all have different purposes.

---

### Best Practices

- Store shared methods on the prototype rather than inside the constructor.
- Avoid replacing the entire prototype after creating instances unless necessary.
- If you replace the prototype, remember to restore the `constructor` property (covered in the next chapter).
- Think of `F.prototype` as a **template for future objects**, not as something that existing objects continually reference through the function.

---

### Interview Questions

#### Q1. What is `F.prototype`?

**Answer**

It is a property of a constructor function. When `new F()` is called, the newly created object's `[[Prototype]]` is set to `F.prototype`.

---

#### Q2. Does every function have a `prototype` property?

**Answer**

Yes. Every normal function automatically has a `prototype` property. (Arrow functions are an exception because they cannot be used as constructors.)

---

#### Q3. When is `F.prototype` used?

**Answer**

Only during object creation with `new F()`. After that, the object follows its own `[[Prototype]]` reference.

---

#### Q4. What happens if `F.prototype` changes after objects are created?

**Answer**

Existing objects continue using the old prototype object. Only future objects created with `new F()` use the new `F.prototype`.

---

#### Q5. What is the difference between replacing and modifying `F.prototype`?

**Answer**

Replacing `F.prototype` creates a new prototype object and affects only future instances. Modifying properties on the existing prototype object affects all current instances that reference it.

---

### Key Takeaways

- `F.prototype` is a **property of constructor functions**, not of ordinary objects.
- It is **not** the prototype of the function itself.
- During `new F()`, JavaScript sets the new object's `[[Prototype]]` to `F.prototype`.
- `F.prototype` is consulted **only once**, during object creation.
- Replacing `F.prototype` affects only future instances.
- Modifying the existing prototype object affects every instance sharing it.
- `F.prototype` enables thousands of objects to share a single set of methods, making JavaScript memory-efficient.

---
