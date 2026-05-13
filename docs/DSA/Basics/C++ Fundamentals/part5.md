---
sidebar_label: 'Control Flow & Decision Making'
sidebar_position: 5
---

# Control Flow & Decision Making

> By default, a program executes statements from top to bottom.
>
> However, real-world programs often need to make decisions:
>
> - Is the user eligible to vote?
> - Is the password correct?
> - Is a number positive or negative?
>
> Control flow statements allow programs to choose different execution paths based on conditions.

---

### What is Control Flow?

Control Flow determines:

```text
Which statements execute
When they execute
How many times they execute
```

---

#### Default Flow

```cpp
cout << "A";
cout << "B";
cout << "C";
```

##### Output

```text
ABC
```

Execution:

```text
A
↓
B
↓
C
```

---

### Conditional Statements

Conditional statements allow execution of code only when a condition is true.

---

### if Statement

#### Syntax

```cpp
if(condition)
{
    // code
}
```

---

#### Example

```cpp
int age = 20;

if(age >= 18)
{
    cout << "Eligible to Vote";
}
```

##### Output

```text
Eligible to Vote
```

---

#### How It Works

```text
Condition Checked
       ↓
     True
       ↓
 Execute Block
```

---

### if Statement (False Condition)

```cpp
int age = 15;

if(age >= 18)
{
    cout << "Eligible";
}
```

##### Output

```text
No Output
```

---

Because:

```text
Condition = False
```

---

### if-else Statement

Used when two possible paths exist.

---

#### Syntax

```cpp
if(condition)
{
    // true block
}
else
{
    // false block
}
```

---

#### Example

```cpp
int age = 15;

if(age >= 18)
{
    cout << "Eligible";
}
else
{
    cout << "Not Eligible";
}
```

##### Output

```text
Not Eligible
```

---

#### Flow Diagram

```text
Condition
    │
 ┌──┴──┐
 │     │
True False
 │     │
 A     B
```

---

### else if Ladder

Used when multiple conditions must be checked.

---

#### Syntax

```cpp
if(condition1)
{
}
else if(condition2)
{
}
else if(condition3)
{
}
else
{
}
```

---

#### Example

```cpp
int marks = 75;

if(marks >= 90)
{
    cout << "Grade A";
}
else if(marks >= 80)
{
    cout << "Grade B";
}
else if(marks >= 70)
{
    cout << "Grade C";
}
else
{
    cout << "Fail";
}
```

##### Output

```text
Grade C
```

---

#### Important Point

As soon as one condition becomes true:

```text
Remaining conditions are skipped.
```

---

### Nested if

An `if` statement inside another `if`.

---

#### Example

```cpp
int age = 20;
bool hasLicense = true;

if(age >= 18)
{
    if(hasLicense)
    {
        cout << "Can Drive";
    }
}
```

##### Output

```text
Can Drive
```

---

#### Flow

```text
Age Check
    ↓
License Check
    ↓
Result
```

---

### switch Statement

Used when comparing one variable against multiple fixed values.

---

#### Syntax

```cpp
switch(variable)
{
    case value1:
        break;

    case value2:
        break;

    default:
}
```

---

#### Example

```cpp
int day = 2;

switch(day)
{
    case 1:
        cout << "Monday";
        break;

    case 2:
        cout << "Tuesday";
        break;

    case 3:
        cout << "Wednesday";
        break;

    default:
        cout << "Invalid";
}
```

##### Output

```text
Tuesday
```

---

### Why break is Important?

Without:

```cpp
break;
```

execution continues into the next case.

---

#### Example

```cpp
int day = 1;

switch(day)
{
    case 1:
        cout << "Monday";

    case 2:
        cout << "Tuesday";

    case 3:
        cout << "Wednesday";
}
```

##### Output

```text
MondayTuesdayWednesday
```

---

This behavior is called:

```text
Fallthrough
```

---

### default Case

Executed when no case matches.

---

#### Example

```cpp
int day = 10;

switch(day)
{
    case 1:
        cout << "Monday";
        break;

    default:
        cout << "Invalid Day";
}
```

##### Output

```text
Invalid Day
```

---

### if-else vs switch

| Feature              | if-else | switch                  |
| -------------------- | ------- | ----------------------- |
| Range Checking       | Yes     | No                      |
| Multiple Conditions  | Yes     | Limited                 |
| Readability          | Good    | Better for fixed values |
| Supports Expressions | Yes     | No                      |

---

### break Statement

Used to immediately exit a loop or switch.

---

#### Example

```cpp
for(int i=1;i<=10;i++)
{
    if(i==5)
    {
        break;
    }

    cout << i << " ";
}
```

##### Output

```text
1 2 3 4
```

---

### continue Statement

Used to skip the current iteration and move to the next one.

---

#### Example

```cpp
for(int i=1;i<=5;i++)
{
    if(i==3)
    {
        continue;
    }

    cout << i << " ";
}
```

##### Output

```text
1 2 4 5
```

---

### Ternary Operator

Short form of if-else.

---

#### Syntax

```cpp
condition ? value1 : value2;
```

---

#### Example

```cpp
int age = 20;

string result =
(age >= 18)
? "Eligible"
: "Not Eligible";

cout << result;
```

##### Output

```text
Eligible
```

---

### Common Beginner Mistakes

---

#### Using = Instead of ==

Wrong

```cpp
if(age = 18)
```

---

Correct

```cpp
if(age == 18)
```

---

### Forgetting break in switch

Wrong

```cpp
case 1:
    cout << "Monday";
```

May cause fallthrough.

---

### Writing Multiple if Instead of else if

Wrong

```cpp
if(marks >= 90)
{
}

if(marks >= 80)
{
}
```

Both conditions may execute.

---

Better

```cpp
if(...)
{
}
else if(...)
{
}
```

---

### Interview Questions

#### Q1. Difference between if and switch?

##### Answer

`if` can evaluate ranges and complex expressions.

`switch` works with fixed values.

---

#### Q2. What is fallthrough?

##### Answer

Execution of subsequent switch cases when `break` is omitted.

---

#### Q3. What does break do?

##### Answer

Immediately exits the current loop or switch.

---

#### Q4. What does continue do?

##### Answer

Skips the current iteration and moves to the next one.

---

#### Q5. When should switch be preferred?

##### Answer

When comparing one variable against multiple fixed values.

---

### Cheat Sheet

```cpp
if(condition)
{
}
```

```cpp
if(condition)
{
}
else
{
}
```

```cpp
if(...)
{
}
else if(...)
{
}
else
{
}
```

```cpp
switch(value)
{
    case 1:
        break;

    default:
}
```

```cpp
break;
```

```cpp
continue;
```

```cpp
condition ? A : B;
```

---

### Key Takeaways

- Control flow determines program execution paths.
- `if` executes code when a condition is true.
- `if-else` provides two possible execution paths.
- `else if` is used for multiple conditions.
- Nested `if` statements allow hierarchical decisions.
- `switch` is useful for fixed-value comparisons.
- `break` prevents fallthrough in switch statements.
- `continue` skips the current iteration.
- The ternary operator provides a compact form of if-else.
- Choosing the right decision-making statement improves readability and maintainability.

---