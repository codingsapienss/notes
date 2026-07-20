# Reading vs Writing Properties in the Prototype Chain

> One of the most important things to understand about JavaScript prototypes is **how property lookup works**.
>
> When you write:
>
> ```javascript
> obj.name;
> ```
>
> JavaScript follows a well-defined algorithm to determine where `name` comes from.
>
> This chapter explains:
>
> - How property lookup works
> - Reading vs writing properties
> - Property shadowing
> - Deleting properties
> - Getter and Setter behavior
> - The complete lookup algorithm

---

### Why Should We Learn This?

Consider this example:

```javascript
const animal = {
  eats: true,
};

const rabbit = {};

Object.setPrototypeOf(rabbit, animal);

console.log(rabbit.eats);
```

Output

```text
true
```

Question:

```text
Where did "eats" come from?
```

It doesn't exist inside

```javascript
rabbit;
```

Yet JavaScript found it.

How?

Because JavaScript searched the **Prototype Chain**.

---

### Reading a Property

Suppose

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  jumps: true,
};

Object.setPrototypeOf(rabbit, animal);
```

Memory

```text
rabbit
│
├── jumps : true
│
▼
animal
│
├── eats : true
│
▼
Object.prototype
│
▼
null
```

---

Now read

```javascript
rabbit.jumps;
```

JavaScript checks

```text
rabbit

↓

Found

↓

Return true
```

---

Now read

```javascript
rabbit.eats;
```

JavaScript checks

```text
rabbit

↓

Not Found

↓

animal

↓

Found

↓

Return true
```

---

Now read

```javascript
rabbit.run;
```

JavaScript checks

```text
rabbit

↓

animal

↓

Object.prototype

↓

null

↓

undefined
```

---

### Property Lookup Algorithm

Whenever JavaScript evaluates

```javascript
object.property;
```

it performs the following steps.

##### Step 1

Look inside the object itself.

---

##### Step 2

If found

```text
Return immediately.
```

---

##### Step 3

Otherwise,

follow

```text
[[Prototype]]
```

to the next object.

---

##### Step 4

Repeat until

```text
null
```

---

##### Step 5

If nowhere found

```javascript
undefined;
```

is returned.

---

### Visual Representation

```text
rabbit

↓

animal

↓

Object.prototype

↓

null
```

Searching

```javascript
rabbit.eats;
```

becomes

```text
rabbit

↓

❌

↓

animal

↓

✅

↓

Return
```

---

Searching

```javascript
rabbit.walk;
```

becomes

```text
rabbit

↓

❌

↓

animal

↓

❌

↓

Object.prototype

↓

❌

↓

null

↓

undefined
```

---

### Writing a Property

Reading and writing behave differently.

Suppose

```javascript
const animal = {
  eats: true,
};

const rabbit = {};

Object.setPrototypeOf(rabbit, animal);
```

Now execute

```javascript
rabbit.eats = false;
```

Many beginners think

```text
animal.eats
```

changes.

It does **not**.

---

Memory before

```text
rabbit
│
▼
animal
│
└── eats : true
```

---

Memory after

```javascript
rabbit.eats = false;
```

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

A **new property** is created inside

```text
rabbit
```

The prototype remains unchanged.

---

### Why?

JavaScript follows this rule:

```text
Reading

↓

Search Prototype Chain

-------------------------

Writing

↓

Always write into
the current object
```

This prevents accidental modification of shared prototype objects.

---

### Property Shadowing

When an object creates a property with the same name as one in its prototype,

the object's property **hides** the inherited one.

This is called

```text
Property Shadowing
```

Example

```javascript
const animal = {
  eats: true,
};

const rabbit = {};

Object.setPrototypeOf(rabbit, animal);

rabbit.eats = false;

console.log(rabbit.eats);
```

Output

```text
false
```

---

Prototype still contains

```javascript
animal.eats;
```

Output

```text
true
```

The object's own property takes priority.

---

Visualization

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

Search

```javascript
rabbit.eats;
```

JavaScript finds

```text
rabbit.eats
```

first.

It never reaches

```text
animal.eats
```

---

### Deleting Properties

Suppose

```javascript
delete rabbit.eats;
```

What happens?

Only the object's own property is removed.

---

Before

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

---

After

```text
rabbit
│
▼
animal
│
├── eats : true
```

Now

```javascript
console.log(rabbit.eats);
```

Output

```text
true
```

because JavaScript again searches the prototype.

---

### Deleting Prototype Properties

Suppose

```javascript
delete animal.eats;
```

Now

```text
rabbit

↓

animal

↓

Object.prototype
```

No object contains

```text
eats
```

Output

```javascript
undefined;
```

---

### Reading vs Writing Summary

| Operation | Prototype Chain Used? |
| --------- | --------------------- |
| Read      | ✅ Yes                |
| Write     | ❌ No                 |
| Delete    | Only current object   |
| Lookup    | Yes                   |

---

### Getters and Setters

There is one important exception.

Suppose

```javascript
const user = {
  set name(value) {
    console.log(value);
  },
};

const admin = {};

Object.setPrototypeOf(admin, user);

admin.name = "John";
```

Output

```text
John
```

Why?

The setter exists inside

```text
user
```

JavaScript finds it through the prototype chain.

Instead of creating a new property,

it executes the setter.

---

Visualization

```text
admin

↓

user

↓

Setter Found

↓

Execute Setter
```

---

### Getters

Similarly

```javascript
const user = {
  get fullName() {
    return "John Doe";
  },
};

const admin = {};

Object.setPrototypeOf(admin, user);

console.log(admin.fullName);
```

Output

```text
John Doe
```

Again,

JavaScript finds the getter through the prototype chain.

---

### Complete Algorithm

Reading

```text
Object

↓

Own Property?

↓

Yes → Return

↓

No

↓

Prototype

↓

Found?

↓

Yes → Return

↓

No

↓

Next Prototype

↓

...

↓

null

↓

undefined
```

---

Writing

```text
Object

↓

Setter Exists?

↓

Yes

↓

Execute Setter

↓

No

↓

Create/Update
Own Property
```

---

### Real-World Example

```javascript
const person = {
  speak() {
    console.log("Hello");
  },
};

const john = {
  name: "John",
};

Object.setPrototypeOf(john, person);

john.speak();
```

Search

```text
john

↓

No speak()

↓

person

↓

Found

↓

Execute
```

---

### Common Mistakes

#### Mistake 1

Thinking

```javascript
rabbit.eats = false;
```

modifies

```javascript
animal.eats;
```

Wrong.

It creates a new property inside

```text
rabbit
```

---

#### Mistake 2

Thinking

```javascript
delete rabbit.eats;
```

deletes the prototype property.

Wrong.

Only the object's own property is removed.

---

#### Mistake 3

Thinking property lookup copies properties.

Wrong.

JavaScript **never copies** properties during lookup.

It simply follows references through the prototype chain.

---

### Advantages of This Design

- Prevents accidental modification of shared prototypes.
- Supports inheritance.
- Saves memory.
- Allows method sharing.
- Enables dynamic lookup.

---

### Interview Questions

#### Q1. How does JavaScript search for a property?

**Answer**

It first checks the object itself. If the property is not found, it follows the prototype chain until the property is found or `null` is reached.

---

#### Q2. What happens when writing to an inherited property?

**Answer**

JavaScript creates or updates the property on the current object. The prototype is not modified (unless a setter is involved).

---

#### Q3. What is Property Shadowing?

**Answer**

Property shadowing occurs when an object defines a property with the same name as one in its prototype, hiding the inherited property.

---

#### Q4. What does `delete` remove?

**Answer**

`delete` removes only the object's own property. It does not remove properties from the prototype chain.

---

#### Q5. Why are getters and setters special?

**Answer**

During assignment or access, JavaScript can find getters and setters through the prototype chain and execute them instead of creating or reading a normal property.

---

### Key Takeaways

- Reading a property follows the **prototype chain** until the property is found or `null` is reached.
- Writing to a property creates or updates it on the **current object**, not on its prototype.
- Property shadowing occurs when an object defines a property with the same name as an inherited one.
- `delete` removes only the object's own property.
- Getters and setters are exceptions because they can be inherited and executed through the prototype chain.
- Understanding the difference between reading and writing properties is essential for reasoning about JavaScript inheritance and object behavior.

---
