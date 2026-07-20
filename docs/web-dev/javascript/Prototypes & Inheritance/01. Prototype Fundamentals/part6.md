# Prototype Behavior & Common Interview Scenarios

> In the previous chapters, we learned:
>
> - Prototype Chains
> - `[[Prototype]]`
> - `__proto__`
> - `prototype`
> - Property Lookup
> - `this`
> - Property Enumeration
>
> In this chapter, we'll combine all of these concepts to understand some of the **most common JavaScript prototype interview questions**.
>
> Almost every JavaScript interview contains at least one question from this chapter.

---

### Why Learn These Scenarios?

Many developers memorize prototype rules without understanding them.

For example,

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();

Rabbit.prototype = {};

console.log(rabbit.eats);
```

Some people answer

```text
undefined
```

Others answer

```text
true
```

Only one is correct.

To answer correctly, we need to understand **how JavaScript stores prototype references internally.**

---

### Mental Model Before We Start

Always remember one thing:

```text
Objects never copy prototypes.

They only store a reference
to a prototype object.
```

Visualization

```text
rabbit

│

▼

Prototype Object
```

Not

```text
rabbit

↓

Copy of Prototype
```

This single idea explains almost every prototype question.

---

### Scenario 1 — Replacing the Prototype Object

Consider

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();

Rabbit.prototype = {};

console.log(rabbit.eats);
```

---

#### Step 1

Initially

```javascript
Rabbit.prototype = {
  eats: true,
};
```

Memory

```text
Rabbit.prototype

↓

Object A

┌──────────────┐
│ eats : true  │
└──────────────┘
```

---

#### Step 2

Create

```javascript
const rabbit = new Rabbit();
```

JavaScript internally does

```text
rabbit

↓

[[Prototype]]

↓

Object A
```

Notice

Rabbit stores a **reference**

not a copy.

---

#### Step 3

Now execute

```javascript
Rabbit.prototype = {};
```

Memory becomes

```text
Rabbit.prototype

↓

Object B

┌──────────────┐
│              │
└──────────────┘
```

But

```text
rabbit

↓

Object A
```

still points to

```text
Object A
```

Nothing changed inside rabbit.

---

#### Final Memory Diagram

```text
                Rabbit.prototype

                      │

                      ▼

                 Object B
                 (empty)



rabbit

│

▼

Object A

┌──────────────┐
│ eats : true  │
└──────────────┘
```

---

#### Output

```javascript
console.log(rabbit.eats);
```

Output

```text
true
```

---

### Rule

Replacing

```javascript
Constructor.prototype;
```

creates an entirely new prototype object.

Existing objects continue using the old one.

Only **future objects** use the new prototype.

---

### Scenario 2 — Modifying the Existing Prototype

Now consider

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();

Rabbit.prototype.eats = false;

console.log(rabbit.eats);
```

---

#### Step 1

Initially

```text
Rabbit.prototype

↓

Object A

┌──────────────┐
│ eats : true  │
└──────────────┘
```

---

#### Step 2

Rabbit stores

```text
rabbit

↓

Object A
```

---

#### Step 3

Execute

```javascript
Rabbit.prototype.eats = false;
```

Did we replace the prototype?

No.

We modified

```text
Object A
```

directly.

---

Memory now

```text
Rabbit.prototype

↓

Object A

┌──────────────┐
│ eats : false │
└──────────────┘


rabbit

↓

Object A
```

Both still reference the same object.

---

#### Output

```text
false
```

---

### Rule

Changing

```javascript
Rabbit.prototype.property;
```

modifies the shared prototype object.

Every existing object immediately sees the change.

---

### Replace vs Modify

These two statements are completely different.

Replacing

```javascript
Rabbit.prototype = {};
```

creates

```text
New Object
```

---

Modifying

```javascript
Rabbit.prototype.eats = false;
```

changes

```text
Existing Object
```

This difference is one of the most frequently asked interview questions.

---

### Scenario 3 — Deleting an Own Property

Suppose

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  eats: false,
};

Object.setPrototypeOf(rabbit, animal);

delete rabbit.eats;

console.log(rabbit.eats);
```

---

#### Before Deletion

Memory

```text
rabbit

│

├── eats : false

│

▼

animal

│

├── eats : true
```

Searching

```javascript
rabbit.eats;
```

JavaScript finds

```text
rabbit.eats
```

first.

---

#### Delete

```javascript
delete rabbit.eats;
```

Memory

```text
rabbit

│

▼

animal

│

├── eats : true
```

Now

```text
rabbit
```

doesn't contain

```text
eats
```

---

Search

```text
rabbit

↓

Not Found

↓

animal

↓

Found
```

---

Output

```text
true
```

---

### Rule

Deleting an own property simply exposes the inherited property again.

Nothing inside the prototype changes.

---

### Scenario 4 — Deleting the Prototype Property

Consider

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();

delete Rabbit.prototype.eats;

console.log(rabbit.eats);
```

---

#### Memory Before

```text
rabbit

↓

Prototype

↓

eats : true
```

---

Delete

```javascript
delete Rabbit.prototype.eats;
```

Now

```text
Prototype

↓

(no eats)
```

---

Searching

```text
rabbit

↓

Prototype

↓

No Property

↓

Object.prototype

↓

No Property

↓

null

↓

undefined
```

---

Output

```text
undefined
```

---

### Complete Comparison

| Operation                   | Existing Objects Affected? | Explanation                                                |
| --------------------------- | -------------------------- | ---------------------------------------------------------- |
| `Rabbit.prototype = {}`     | ❌ No                      | Existing objects still reference the old prototype object. |
| `Rabbit.prototype.x = ...`  | ✅ Yes                     | The shared prototype object is modified.                   |
| `delete rabbit.x`           | Falls back to prototype    | Removes only the object's own property.                    |
| `delete Rabbit.prototype.x` | ✅ Yes                     | Removes the property from the shared prototype object.     |

---

### Visualization

Replacing Prototype

```text
Before

rabbit

↓

Object A

After

Rabbit.prototype

↓

Object B

rabbit

↓

Object A
```

---

Modifying Prototype

```text
Rabbit.prototype

↓

Object A

↓

Property Changed

↓

rabbit sees updated value
```

---

Deleting Own Property

```text
rabbit

↓

(No Property)

↓

Prototype

↓

Property Found
```

---

Deleting Prototype Property

```text
rabbit

↓

Prototype

↓

No Property

↓

Object.prototype

↓

No Property

↓

undefined
```

---

### Why Does JavaScript Behave This Way?

Because JavaScript objects store

```text
References
```

not

```text
Copies
```

Changing a referenced object affects everyone using it.

Replacing the reference affects only future users.

---

### Common Mistakes

#### Mistake 1

Thinking

```javascript
Rabbit.prototype = {};
```

updates every existing object.

Wrong.

Only future objects use the new prototype.

---

#### Mistake 2

Thinking

```javascript
Rabbit.prototype.eats = false;
```

creates a new prototype.

Wrong.

It modifies the existing prototype object.

---

#### Mistake 3

Thinking

```javascript
delete rabbit.eats;
```

deletes the prototype property.

Wrong.

Only the object's own property is deleted.

---

#### Mistake 4

Confusing

```javascript
Rabbit.prototype = {};
```

with

```javascript
Rabbit.prototype.eats = false;
```

One replaces the object.

The other modifies the existing object.

---

### Best Practices

- Avoid replacing a constructor's prototype after creating instances unless you understand the consequences.
- Prefer modifying the existing prototype if you need to add shared methods.
- Be cautious when deleting prototype properties, as every instance sharing that prototype is affected.
- Remember that prototype relationships are reference-based, not copy-based.

---

### Interview Questions

#### Q1. Does changing `Constructor.prototype` affect existing objects?

**Answer**

No. Existing objects keep their original `[[Prototype]]` reference. Only objects created after the replacement use the new prototype.

---

#### Q2. Why does changing `Rabbit.prototype.eats` affect all rabbits?

**Answer**

Because all rabbits reference the same prototype object. Modifying that object changes what every instance sees.

---

#### Q3. What happens after deleting an object's own property?

**Answer**

JavaScript searches the prototype chain. If the property exists in the prototype, that value becomes visible again.

---

#### Q4. What happens after deleting a prototype property?

**Answer**

Every object sharing that prototype loses access to that property unless it exists higher in the prototype chain.

---

#### Q5. Which is more dangerous: replacing a prototype or modifying it?

**Answer**

They have different effects. Replacing the prototype disconnects future instances from the old prototype, while modifying it immediately affects all existing instances that reference it.

---

### Key Takeaways

- JavaScript objects store **references** to prototype objects, not copies.
- Replacing `Constructor.prototype` creates a new prototype object and does **not** affect existing instances.
- Modifying a property on the existing prototype affects all instances sharing that prototype.
- Deleting an object's own property reveals the inherited property again if one exists.
- Deleting a property from the prototype removes it for every object sharing that prototype.
- Understanding the difference between **replacing** a prototype and **modifying** a prototype is one of the most important prototype concepts for interviews.

---
