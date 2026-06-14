---
sidebar_label: 'Characters & ASCII'
sidebar_position: 7
---

# Characters & ASCII

> Characters are one of the most fundamental data types in C++.
>
> Every letter, digit, symbol, and special character stored in a program is represented internally using numeric values.
>
> Understanding characters and ASCII is extremely important before learning:
>
> - Strings
> - Character Arrays
> - Text Processing
> - Input Validation
> - Pattern Problems

---

### What is a Character?

A character is a single symbol such as:

```text
A
B
a
b
1
9
@
# 
$
```

In C++, characters are stored using:

```cpp
char
```

data type.

---

### Declaring Characters

#### Syntax

```cpp
char ch = 'A';
```

---

#### Example

```cpp
char grade = 'B';

cout << grade;
```

##### Output

```text
B
```

---

### Character Literals

Characters are enclosed inside:

```cpp
''
```

(single quotes)

---

#### Correct

```cpp
char ch = 'A';
```

---

#### Wrong

```cpp
char ch = "A";
```

Compilation Error

Because:

```cpp
"A"
```

is a string literal.

---

### Memory Occupied by char

```cpp
char ch = 'A';
```

Typically occupies:

```text
1 Byte
```

---

#### Verify

```cpp
cout << sizeof(char);
```

##### Output

```text
1
```

---

### How Characters Are Stored Internally

Computers understand only:

```text
0
1
```

They do not understand:

```text
A
B
C
```

directly.

---

Therefore:

```text
Every character is stored as a number.
```

---

### What is ASCII?

ASCII stands for:

```text
American Standard Code for Information Interchange
```

It assigns a numeric value to each character.

---

### ASCII Examples

| Character | ASCII Value |
| --------- | ----------- |
| A         | 65          |
| B         | 66          |
| C         | 67          |
| a         | 97          |
| b         | 98          |
| c         | 99          |
| 0         | 48          |
| 1         | 49          |
| 2         | 50          |

---

### Viewing ASCII Values

```cpp
char ch = 'A';

cout << (int)ch;
```

##### Output

```text
65
```

---

#### Example

```cpp
char ch = 'a';

cout << (int)ch;
```

##### Output

```text
97
```

---

### ASCII to Character Conversion

```cpp
int num = 65;

cout << char(num);
```

##### Output

```text
A
```

---

#### Example

```cpp
cout << char(97);
```

##### Output

```text
a
```

---

### Character Arithmetic

Since characters are stored as numbers:

```text
Character arithmetic is possible.
```

---

#### Example

```cpp
char ch = 'A';

cout << char(ch + 1);
```

##### Output

```text
B
```

---

#### Example

```cpp
char ch = 'a';

cout << char(ch + 2);
```

##### Output

```text
c
```

---

### Uppercase Letters Range

| Character | ASCII |
| --------- | ----- |
| A         | 65    |
| Z         | 90    |

---

Range:

```text
65 → 90
```

---

### Lowercase Letters Range

| Character | ASCII |
| --------- | ----- |
| a         | 97    |
| z         | 122   |

---

Range:

```text
97 → 122
```

---

### Digits Range

| Character | ASCII |
| --------- | ----- |
| 0         | 48    |
| 9         | 57    |

---

Range:

```text
48 → 57
```

---

### Character Comparison

Characters can be compared directly.

---

#### Example

```cpp
char ch = 'B';

if(ch == 'B')
{
    cout << "Match";
}
```

##### Output

```text
Match
```

---

### Checking Uppercase Character

```cpp
char ch = 'P';

if(ch >= 'A' && ch <= 'Z')
{
    cout << "Uppercase";
}
```

##### Output

```text
Uppercase
```

---

### Checking Lowercase Character

```cpp
char ch = 'm';

if(ch >= 'a' && ch <= 'z')
{
    cout << "Lowercase";
}
```

##### Output

```text
Lowercase
```

---

### Checking Digit

```cpp
char ch = '8';

if(ch >= '0' && ch <= '9')
{
    cout << "Digit";
}
```

##### Output

```text
Digit
```

---

### Converting Uppercase to Lowercase

ASCII Difference:

```text
a - A = 32
```

---

#### Example

```cpp
char ch = 'A';

ch = ch + 32;

cout << ch;
```

##### Output

```text
a
```

---

### Converting Lowercase to Uppercase

```cpp
char ch = 'a';

ch = ch - 32;

cout << ch;
```

##### Output

```text
A
```

---

### Better Modern Approach

Use:

```cpp
tolower()
toupper()
```

from:

```cpp
#include <cctype>
```

---

#### Example

```cpp
char ch = 'A';

cout << char(tolower(ch));
```

##### Output

```text
a
```

---

#### Example

```cpp
char ch = 'z';

cout << char(toupper(ch));
```

##### Output

```text
Z
```

---

### Special Characters

Characters can also store special symbols.

---

#### Example

```cpp
char ch = '@';

cout << ch;
```

##### Output

```text
@
```

---

### Escape Characters

Special characters represented using backslash.

---

| Escape Character | Meaning      |
| ---------------- | ------------ |
| `\n`             | New Line     |
| `\t`             | Tab          |
| `\\`             | Backslash    |
| `\"`             | Double Quote |
| `\'`             | Single Quote |

---

#### Example

```cpp
cout << "Hello\nWorld";
```

##### Output

```text
Hello
World
```

---

#### Example

```cpp
cout << "A\tB";
```

##### Output

```text
A       B
```

---

### char vs int

Characters are internally integers.

---

#### Example

```cpp
char ch = 'A';

cout << ch << endl;

cout << (int)ch;
```

##### Output

```text
A
65
```

---

### Common Beginner Mistakes

---

#### Using Double Quotes

Wrong

```cpp
char ch = "A";
```

---

Correct

```cpp
char ch = 'A';
```

---

#### Forgetting ASCII Nature

```cpp
char ch = 'A';

cout << ch + 1;
```

Output:

```text
66
```

not:

```text
B
```

because:

```cpp
ch + 1
```

becomes an integer expression.

---

Correct

```cpp
cout << char(ch + 1);
```

Output:

```text
B
```

---

### Interview Questions

#### Q1. What is ASCII?

##### Answer

A character encoding standard that assigns numeric values to characters.

---

#### Q2. What is the ASCII value of 'A'?

##### Answer

```text
65
```

---

#### Q3. What is the ASCII value of 'a'?

##### Answer

```text
97
```

---

#### Q4. Difference between `'A'` and `"A"`?

##### Answer

```cpp
'A'
```

is a character.

```cpp
"A"
```

is a string literal.

---

#### Q5. Why can characters participate in arithmetic operations?

##### Answer

Because characters are stored internally as integers (ASCII values).

---

### Cheat Sheet

```cpp
char ch = 'A';
```

```cpp
cout << (int)ch;
```

```cpp
cout << char(65);
```

```cpp
if(ch >= 'A' && ch <= 'Z')
```

```cpp
if(ch >= 'a' && ch <= 'z')
```

```cpp
if(ch >= '0' && ch <= '9')
```

```cpp
tolower(ch);

toupper(ch);
```

---

### Key Takeaways

- `char` stores a single character.
- Characters are enclosed in single quotes (`' '`).
- Every character is stored internally as an ASCII value.
- ASCII allows conversion between characters and numbers.
- Characters support arithmetic operations.
- Uppercase, lowercase, and digits occupy specific ASCII ranges.
- Character comparisons are widely used in input validation.
- Escape characters represent special formatting characters.
- `tolower()` and `toupper()` are preferred for case conversion.
- Understanding ASCII is essential before learning strings and character arrays.

---