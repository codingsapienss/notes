# Part 3F — Native Prototype Exercises

---

## Section 1 — Property Lookup & Prototype Chain

### Exercise 1 — Basic Property Lookup

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  __proto__: animal,
};

console.log(rabbit.eats);
```

---

### Exercise 2 — Own Property vs Prototype

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  eats: false,
  __proto__: animal,
};

console.log(rabbit.eats);
```

---

### Exercise 3 — Writing Property

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  __proto__: animal,
};

rabbit.eats = false;

console.log(rabbit.eats);
console.log(animal.eats);
```

---

### Exercise 4 — Delete Own Property

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  eats: false,
  __proto__: animal,
};

delete rabbit.eats;

console.log(rabbit.eats);
```

---

### Exercise 5 — Delete Prototype Property

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  __proto__: animal,
};

delete animal.eats;

console.log(rabbit.eats);
```

---

### Exercise 6 — Deep Prototype Chain

```javascript
const grandParent = {
  a: 1,
};

const parent = {
  __proto__: grandParent,
};

const child = {
  __proto__: parent,
};

console.log(child.a);
```

---

### Exercise 7 — Property Shadowing

```javascript
const grandParent = {
  name: "Grand",
};

const parent = {
  name: "Parent",
  __proto__: grandParent,
};

const child = {
  __proto__: parent,
};

console.log(child.name);
```

---

### Exercise 8 — in Operator

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  __proto__: animal,
};

console.log("eats" in rabbit);
console.log("jump" in rabbit);
```

---

### Exercise 9 — hasOwnProperty

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  __proto__: animal,
};

console.log(rabbit.hasOwnProperty("eats"));
console.log("eats" in rabbit);
```

---

### Exercise 10 — Reading Undefined Property

```javascript
const animal = {};

const rabbit = {
  __proto__: animal,
};

console.log(rabbit.walk);
```

---

## Section 2 — Constructor Functions & F.prototype

### Exercise 11 — Basic Constructor

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();

console.log(rabbit.eats);
```

---

### Exercise 12 — Change Prototype After Object Creation

```javascript
function Rabbit() {}

Rabbit.prototype = {
  eats: true,
};

const rabbit = new Rabbit();

Rabbit.prototype = {
  jumps: true,
};

console.log(rabbit.eats);
console.log(rabbit.jumps);
```

---

### Exercise 13 — Modify Existing Prototype

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

### Exercise 14 — Delete Prototype Property

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

### Exercise 15 — Constructor Property

```javascript
function Rabbit() {}

const rabbit = new Rabbit();

console.log(rabbit.constructor === Rabbit);
```

---

### Exercise 16 — Replacing Prototype

```javascript
function Rabbit() {}

Rabbit.prototype = {
  jumps: true,
};

const rabbit = new Rabbit();

console.log(rabbit.constructor === Rabbit);
```

---

### Exercise 17 — Fix Constructor

```javascript
function Rabbit() {}

Rabbit.prototype = {
  jumps: true,
  constructor: Rabbit,
};

const rabbit = new Rabbit();

console.log(rabbit.constructor === Rabbit);
```

---

### Exercise 18 — Create Object Using Constructor

```javascript
function Rabbit(name) {
  this.name = name;
}

const rabbit = new Rabbit("White");

const rabbit2 = new rabbit.constructor("Black");

console.log(rabbit2.name);
```

---

## Section 3 — Native Prototypes

### Exercise 19 — Object Prototype

```javascript
const obj = {};

console.log(obj.toString);
```

---

### Exercise 20 — Array Prototype

```javascript
const arr = [1, 2, 3];

console.log(arr.map);
```

---

### Exercise 21 — Function Prototype

```javascript
function hello() {}

console.log(hello.call);
```

---

### Exercise 22 — Wrapper Objects

```javascript
const str = "Hello";

console.log(str.toUpperCase());
```

---

### Exercise 23 — Temporary Wrapper

```javascript
const str = "Hello";

str.test = 10;

console.log(str.test);
```

---

### Exercise 24 — Null Wrapper

```javascript
const value = null;

console.log(value.toString());
```

---

### Exercise 25 — Undefined Wrapper

```javascript
const value = undefined;

console.log(value.valueOf());
```

---

## Section 4 — Native Prototype Modification

### Exercise 26 — Add Method

```javascript
Array.prototype.first = function () {
  return this[0];
};

const arr = [1, 2, 3];

console.log(arr.first());
```

---

### Exercise 27 — Modify String Prototype

```javascript
String.prototype.sayHi = function () {
  return "Hi";
};

console.log("JavaScript".sayHi());
```

---

### Exercise 28 — Prototype Pollution

```javascript
Object.prototype.country = "India";

const user = {
  name: "John",
};

console.log(user.country);
```

---

### Exercise 29 — for...in

```javascript
Object.prototype.country = "India";

const user = {
  name: "John",
};

for (const key in user) {
  console.log(key);
}
```

---

### Exercise 30 — Polyfill

Implement your own polyfill for:

```javascript
String.prototype.repeat();
```

---

## Section 5 — Borrowing Methods

### Exercise 31

```javascript
const obj = {
  0: "Hello",
  1: "World",
  length: 2,
};

obj.join = Array.prototype.join;

console.log(obj.join(" "));
```

---

### Exercise 32

```javascript
const obj = {
  0: "A",
  1: "B",
  length: 2,
};

console.log(Array.prototype.join.call(obj, "-"));
```

---

### Exercise 33

```javascript
const obj = {
  0: "A",
  1: "B",
  length: 2,
};

const arr = Array.prototype.slice.call(obj);

console.log(arr);
```

---

### Exercise 34

```javascript
const obj = {
  0: 10,
  1: 20,
  length: 2,
};

Array.prototype.forEach.call(obj, console.log);
```

---

### Exercise 35

```javascript
const obj = Object.create(null);

console.log(Object.prototype.hasOwnProperty.call(obj, "name"));
```

---

## Section 6 — Interview Questions

36. Explain the difference between `prototype` and `[[Prototype]]`.

37. Why does JavaScript use prototypes instead of copying methods?

38. Why is `Object.prototype` at the top of almost every prototype chain?

39. Why do `null` and `undefined` not have wrapper objects?

40. Why does `"abc".toUpperCase()` work?

41. What happens internally when `new` is used?

42. Why is `constructor` sometimes lost?

43. Why is replacing `prototype` different from modifying it?

44. Why is modifying native prototypes discouraged?

45. What is Prototype Pollution?

46. What is a Polyfill?

47. Why does `Array.prototype.join.call(obj)` work?

48. Why do some borrowed methods throw `TypeError`?

49. Difference between `in` and `hasOwnProperty()`?

50. Trace the complete prototype chain of:

- Object
- Array
- Function
- Date
- Map
- Set
- String
- Number
- Boolean

## Section 7 — Debugging Exercises

### Exercise 51 — Reading vs Writing

Predict the output.

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  __proto__: animal,
};

rabbit.eats = false;

delete rabbit.eats;

console.log(rabbit.eats);
```

---

### Exercise 52 — Prototype Shadowing

```javascript
const animal = {
  speed: 10,
};

const rabbit = {
  __proto__: animal,
};

rabbit.speed += 5;

console.log(rabbit.speed);
console.log(animal.speed);
```

---

### Exercise 53 — Constructor Puzzle

```javascript
function User() {}

const u1 = new User();

User.prototype = {
  age: 20,
};

const u2 = new User();

console.log(u1.age);
console.log(u2.age);
```

---

### Exercise 54 — Constructor Property

```javascript
function User() {}

User.prototype = {
  name: "Prototype",
};

const user = new User();

console.log(user.constructor);
```

---

### Exercise 55 — Lost Constructor

Fix the following code.

```javascript
function User() {}

User.prototype = {
  login() {},
};

const user = new User();

const another = new user.constructor();
```

---

### Exercise 56 — Prototype Chain

Draw the complete prototype chain.

```javascript
const arr = [];
```

---

### Exercise 57 — Function Prototype

Draw the complete prototype chain.

```javascript
function hello() {}
```

---

### Exercise 58 — Date Prototype

Draw the prototype chain.

```javascript
const today = new Date();
```

---

### Exercise 59 — Wrapper Objects

Draw the prototype chain.

```javascript
const str = "Hello";
```

---

### Exercise 60 — Explain

Why does this work?

```javascript
"Hello".trim();
```

---

### Exercise 61 — Explain

Why does this fail?

```javascript
null.toString();
```

---

### Exercise 62 — Explain

```javascript
const arr = [];

console.log(arr.toString());
```

Which object actually owns `toString()`?

---

### Exercise 63 — Explain

```javascript
const arr = [];

console.log(arr.hasOwnProperty("push"));
```

Why?

---

### Exercise 64 — Explain

```javascript
console.log(Array.prototype.__proto__);
```

---

### Exercise 65 — Explain

```javascript
console.log(Function.prototype.__proto__);
```

---

### Exercise 66 — Explain

```javascript
console.log(Object.prototype.__proto__);
```

---

### Exercise 67 — Explain

```javascript
console.log(Array.__proto__);
```

---

### Exercise 68 — Explain

```javascript
console.log(Function.__proto__);
```

---

### Exercise 69 — Explain

```javascript
console.log(Object.__proto__);
```

---

### Exercise 70 — Explain

What is the difference between

```javascript
Array.prototype;
```

and

```javascript
Array.__proto__;
```

---

## Section 8 — Memory Diagram Exercises

### Exercise 71

Draw the memory diagram.

```javascript
const animal = {
  eats: true,
};

const rabbit = {
  __proto__: animal,
};
```

---

### Exercise 72

Draw the memory diagram.

```javascript
function User() {}

const user = new User();
```

---

### Exercise 73

Draw the memory diagram.

```javascript
class User {}

const user = new User();
```

---

### Exercise 74

Draw the memory diagram.

```javascript
const arr = [1, 2, 3];
```

---

### Exercise 75

Draw the complete lookup path.

```javascript
const arr = [1, 2, 3];

arr.map((x) => x * 2);
```

---

### Exercise 76

Draw the lookup path.

```javascript
const obj = {};

obj.toString();
```

---

### Exercise 77

Draw the lookup path.

```javascript
function hello() {}

hello.call(null);
```

---

### Exercise 78

Draw the lookup path.

```javascript
"hello".includes("h");
```

---

### Exercise 79

Draw the lookup path.

```javascript
new Date().getFullYear();
```

---

### Exercise 80

Draw the lookup path.

```javascript
new Map().set("a", 1);
```

---

## Section 9 — Coding Exercises

### Exercise 81

Implement your own constructor function.

```javascript
Person;
```

with

- name
- age
- greet()

---

### Exercise 82

Implement inheritance manually using

```javascript
Object.create();
```

---

### Exercise 83

Implement

```javascript
Student;
```

that inherits from

```javascript
Person;
```

without using `class`.

---

### Exercise 84

Write a polyfill for

```javascript
Array.prototype.first();
```

---

### Exercise 85

Write a polyfill for

```javascript
String.prototype.reverse();
```

---

### Exercise 86

Implement your own

```javascript
hasOwn();
```

function.

---

### Exercise 87

Create an object with **no prototype**.

Verify:

```javascript
toString;
hasOwnProperty;
constructor;
```

---

### Exercise 88

Borrow

```javascript
Array.prototype.map();
```

for an array-like object.

---

### Exercise 89

Borrow

```javascript
Array.prototype.filter();
```

for an array-like object.

---

### Exercise 90

Borrow

```javascript
Array.prototype.reduce();
```

for an array-like object.

---

## Section 10 — Challenge Problems

### Challenge 91

Predict every output.

```javascript
const animal = {
  eat() {
    return "eat";
  },
};

const rabbit = Object.create(animal);

rabbit.eat = function () {
  return "rabbit eat";
};

delete rabbit.eat;

console.log(rabbit.eat());
```

---

### Challenge 92

Without executing the code, draw the prototype chain.

```javascript
function A() {}

function B() {}

B.prototype = Object.create(A.prototype);

const obj = new B();
```

---

### Challenge 93

Explain exactly what happens internally.

```javascript
new User("John");
```

Include every step performed by the JavaScript engine.

---

### Challenge 94

Explain the complete lookup process.

```javascript
user.sayHello();
```

---

### Challenge 95

Draw the prototype hierarchy for:

- Object
- Function
- Array
- Date
- Map
- Set
- RegExp
- Promise

---

### Challenge 96

Explain why JavaScript classes still use prototypes internally.

---

### Challenge 97

Explain why

```javascript
typeof User;
```

returns

```text
function
```

for a class.

---

### Challenge 98

Explain the difference between:

- Own Property
- Inherited Property
- Prototype Property

---

### Challenge 99

Trace the execution of

```javascript
Array.prototype.join.call(obj);
```

step by step.

---

### Challenge 100 — Master Question

Without executing the code, explain every memory allocation, every prototype link, every property lookup, and every function call.

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function () {
  return `${this.name} is eating`;
};

const rabbit = new Animal("Rabbit");

console.log(rabbit.eat());
```
