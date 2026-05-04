# Access Modifiers

> One of the biggest advantages of Classes is the ability to control:
>
> ```text
> Who can access what?
> ```
>
> In real-world applications, not every property should be publicly accessible.
>
> For example:
>
> ```text
> Bank Account Balance
> User Password
> Internal System IDs
> Authentication Tokens
> ```
>
> We need a mechanism to control visibility.
>
> TypeScript provides:
>
> - public
> - private
> - protected
> - #private fields
> - readonly
>
> These are called:
>
> ```text
> Access Modifiers
> ```

---

### Why Access Modifiers?

Consider:

```ts
class BankAccount {
  balance = 1000;
}
```

---

Create object:

```ts
const account = new BankAccount();
```

---

Anyone can do:

```ts
account.balance = -500000;
```

---

Problem:

```text
Invalid State
Business Rules Broken
Data Corruption
```

---

We need:

```text
Controlled Access
```

---

### public Modifier

---

#### What is public?

```text
Accessible Everywhere
```

---

This is the default modifier in TypeScript.

---

#### Example

```ts
class User {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

---

Usage

```ts
const user = new User("Prashant");

console.log(user.name);
```

---

Output

```text
Prashant
```

---

Modify

```ts
user.name = "John";
```

Valid.

---

### public is Default

These are identical:

```ts
class User {
  name: string;
}
```

---

```ts
class User {
  public name: string;
}
```

---

Most developers omit:

```ts
public;
```

because it is implied.

---

### public Access Diagram

```text
Class
 │
 ├── Inside Class     ✅
 ├── Outside Class    ✅
 └── Child Class      ✅
```

---

### private Modifier

---

#### What is private?

```text
Accessible Only
Inside The Same Class
```

---

Outside access is prohibited.

---

### Example

```ts
class User {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }
}
```

---

Create object:

```ts
const user = new User("123456");
```

---

Attempt

```ts
console.log(user.password);
```

Error.

---

```text
Property 'password'
is private
```

---

### private Access Diagram

```text
Class
 │
 ├── Inside Class     ✅
 ├── Outside Class    ❌
 └── Child Class      ❌
```

---

### Accessing private Inside Class

Private members can still be used internally.

---

Example

```ts
class User {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }

  showPassword() {
    console.log(this.password);
  }
}
```

---

Valid because:

```text
Same Class
```

---

### Real World Example

---

```ts
class BankAccount {
  private balance: number;

  constructor(balance: number) {
    this.balance = balance;
  }

  deposit(amount: number) {
    this.balance += amount;
  }

  getBalance() {
    return this.balance;
  }
}
```

---

Usage

```ts
const account = new BankAccount(1000);

account.deposit(500);

console.log(account.getBalance());
```

---

Output

```text
1500
```

---

Attempt

```ts
account.balance = 0;
```

Error.

---

### Why Use private?

Protects:

```text
Internal State
Business Rules
Sensitive Data
```

---

Examples:

```text
Password
JWT Token
Account Balance
Database Connection
```

---

### protected Modifier

---

#### What is protected?

```text
Accessible:
Inside Class
+
Inside Child Classes
```

---

But NOT outside.

---

### Example

```ts
class Animal {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

---

Child Class

```ts
class Dog extends Animal {
  bark() {
    console.log(this.name);
  }
}
```

---

Valid.

---

Because:

```text
Child Class Can Access
protected Members
```

---

### Outside Access

```ts
const dog = new Dog("Tommy");

console.log(dog.name);
```

Error.

---

### protected Access Diagram

```text
Class
 │
 ├── Inside Class     ✅
 ├── Child Class      ✅
 └── Outside Class    ❌
```

---

### private vs protected

---

#### private

```ts
private balance: number;
```

---

Accessible:

```text
Current Class Only
```

---

#### protected

```ts
protected balance: number;
```

---

Accessible:

```text
Current Class
+
Derived Classes
```

---

### Example Comparison

```ts
class Parent {
  private a = 10;

  protected b = 20;
}
```

---

```ts
class Child extends Parent {
  test() {
    console.log(this.b);

    console.log(this.a);
  }
}
```

---

Result

```text
b → Valid

a → Error
```

---

### # Private Fields (JavaScript Private Fields)

Modern JavaScript introduced:

```ts
#property;
```

---

These are different from TypeScript private.

---

### Example

```ts
class User {
  #password: string;

  constructor(password: string) {
    this.#password = password;
  }
}
```

---

Attempt

```ts
user.#password;
```

Error.

---

### Why Was # Introduced?

TypeScript's:

```ts
private;
```

is only:

```text
Compile-Time Protection
```

---

Generated JavaScript may still contain:

```js
this.password;
```

---

But:

```ts
#password;
```

provides:

```text
True JavaScript Runtime Privacy
```

---

### TypeScript private vs #private

---

#### TypeScript private

```ts
private password: string;
```

Protection:

```text
Compile Time
```

---

#### JavaScript #private

```ts
#password: string;
```

Protection:

```text
Runtime + Compile Time
```

---

### readonly Modifier

---

#### What is readonly?

Allows:

```text
Read Access
```

but prevents:

```text
Modification
```

after initialization.

---

### Example

```ts
class User {
  readonly id: number;

  constructor(id: number) {
    this.id = id;
  }
}
```

---

Usage

```ts
const user = new User(101);
```

---

Read

```ts
console.log(user.id);
```

Valid.

---

Modify

```ts
user.id = 200;
```

Error.

---

```text
Cannot assign to readonly property
```

---

### Common Use Cases

Examples:

```text
Database IDs
Created At Timestamps
UUIDs
Order IDs
Employee IDs
```

These should never change.

---

### readonly with Constructor Shorthand

---

Example

```ts
class User {
  constructor(
    readonly id: number,
    public name: string,
  ) {}
}
```

---

Create

```ts
const user = new User(1, "Prashant");
```

---

Attempt

```ts
user.id = 5;
```

Error.

---

### Combining Modifiers

Very common.

---

Example

```ts
class User {
  public name: string;

  private password: string;

  protected role: string;

  readonly id: number;

  constructor(name: string, password: string, role: string, id: number) {
    this.name = name;
    this.password = password;
    this.role = role;
    this.id = id;
  }
}
```

---

### Access Summary Table

| Modifier  | Same Class | Child Class | Outside Class |
| --------- | ---------- | ----------- | ------------- |
| public    | ✅         | ✅          | ✅            |
| protected | ✅         | ✅          | ❌            |
| private   | ✅         | ❌          | ❌            |
| #private  | ✅         | ❌          | ❌            |
| readonly  | ✅ Read    | ✅ Read     | ✅ Read       |

---

### Constructor Shorthand with Access Modifiers

Very common in production.

---

Instead of:

```ts
class User {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
```

---

Write:

```ts
class User {
  constructor(public name: string) {}
}
```

---

Even multiple properties:

```ts
class User {
  constructor(
    public name: string,
    private password: string,
    readonly id: number,
  ) {}
}
```

---

TypeScript automatically creates properties.

---

### Real World Example

```ts
class Employee {
  constructor(
    readonly id: number,
    public name: string,
    protected department: string,
    private salary: number,
  ) {}

  getSalary() {
    return this.salary;
  }
}
```

---

Usage

```ts
const emp = new Employee(1, "Prashant", "Engineering", 100000);
```

---

Valid

```ts
emp.name;
```

---

Valid

```ts
emp.getSalary();
```

---

Invalid

```ts
emp.salary;
```

---

Invalid

```ts
emp.department;
```

---

### Common Mistakes

---

#### Using private When Child Class Needs Access

Wrong

```ts
private balance;
```

when subclass needs it.

---

Use:

```ts
protected balance;
```

---

#### Using readonly for Mutable Data

Wrong

```ts
readonly balance;
```

if balance changes.

---

Use readonly only for:

```text
Immutable Data
```

---

#### Assuming private Exists at Runtime

TypeScript:

```ts
private;
```

does not create runtime protection.

Use:

```ts
#private;
```

when true runtime privacy is required.

---

### Interview Questions

---

#### Q1

What is the default access modifier in TypeScript?

#### Answer

```text
public
```

---

#### Q2

Difference between private and protected?

#### Answer

```text
private:
Only current class.

protected:
Current class + child classes.
```

---

#### Q3

Can readonly properties be modified?

#### Answer

```text
No.
Only initialization is allowed.
```

---

#### Q4

Difference between private and #private?

#### Answer

```text
private:
Compile-time protection.

#private:
Runtime + compile-time protection.
```

---

#### Q5

When should protected be used?

#### Answer

```text
When derived classes need access
but external code should not.
```

---

### Cheat Sheet

```ts
public name: string;
```

---

```ts
private password: string;
```

---

```ts
protected role: string;
```

---

```ts
readonly id: number;
```

---

```ts
#token: string;
```

---

```ts
constructor(
  public name: string,
  private password: string
) {}
```

---

### Key Takeaways

- Access Modifiers control visibility of class members.
- `public` is the default modifier.
- `private` restricts access to the same class only.
- `protected` allows access inside child classes.
- `readonly` prevents modification after initialization.
- `#private` provides true JavaScript runtime privacy.
- Constructor shorthand can automatically create properties.
- Access modifiers help enforce encapsulation and protect internal state.
- Choosing the correct modifier improves maintainability and security.
- Access control is a fundamental OOP concept used heavily in production TypeScript applications.
