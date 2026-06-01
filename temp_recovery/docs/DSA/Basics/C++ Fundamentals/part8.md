---
sidebar_label: 'Characters and Strings (In Depth)'
sidebar_position: 8
---

# Characters and Strings (In Depth)

**Topics Covered**

- Characters (`char`)
- ASCII and Internal Storage
- Character Arrays
- C-Style Strings
- String Literals
- Null Character (`'\0'`)
- Input Methods
- Output Methods
- Memory Layout
- Character Array vs String Literal vs `std::string`
- Read-only vs Writable Memory
- Array of Characters vs Array of Strings
- Dynamic Length Handling
- Important STL String Functions
- Important C String Functions
- Buffer Overflow
- Hidden Behavior
- Common Bugs
- Interview Questions
- Best Practices
- Cheat Sheet

---

### Introduction

Strings in C++ look simple:

```cpp
string name="Prashant";
```

but internally they involve:

- arrays
- pointers
- memory management
- null terminators
- heap allocation
- object management
- compiler behavior

Many serious bugs in C and C++ happen because developers do not properly understand:

- character arrays
- string literals
- C-style strings
- writable vs read-only memory
- null termination

This chapter explains everything deeply.

---

### The 4 Most Important Concepts

Most beginners confuse these:

```cpp
'A'
```

```cpp
"Hello"
```

```cpp
char arr[]="Hello";
```

```cpp
string s="Hello";
```

These are NOT the same.

---

### Quick Overview

| Concept           | Example              | Meaning                          |
| ----------------- | -------------------- | -------------------------------- |
| Character Literal | `'A'`                | Single character                 |
| String Literal    | `"Hello"`            | Read-only null-terminated string |
| Character Array   | `char arr[10]`       | Array storing characters         |
| C-Style String    | `char arr[]="Hello"` | Null-terminated character array  |
| C++ String        | `string s="Hello"`   | Dynamic string object            |

---

### Character (`char`)

#### Definition

`char` is a primitive data type used to store a single character.

---

## Syntax

```cpp
char ch='A';
```

---

## Important Rule

Characters use:

```cpp
''
```

single quotes.

---

## Internal Storage

Characters are internally stored using ASCII values.

Example:

```cpp
char ch='A';
```

Internally:

```text
'A'

↓

65
```

Memory:

```text
Address    Value

1000       65
```

---

## ASCII Table

| Character | ASCII Value |
| --------- | ----------- |
| A         | 65          |
| B         | 66          |
| a         | 97          |
| b         | 98          |
| 0         | 48          |
| 1         | 49          |

---

## Example

```cpp
#include<iostream>
using namespace std;

int main()
{
    char ch='A';

    cout<<ch<<endl;

    cout<<(int)ch;
}
```

Expected Output:

```text
A
65
```

---

## Code Explanation

```cpp
(int)ch
```

typecasts character into integer.

---

## Character Literal vs String Literal

---

## Character Literal

```cpp
'A'
```

Meaning:

```text
Single character
```

Size:

```text
1 byte
```

---

## String Literal

```cpp
"Hello"
```

Meaning:

```text
Sequence of characters ending with '\0'
```

Internally:

```text
H e l l o \0
```

---

## Character Array

### Definition

Array capable of storing characters.

Syntax:

```cpp
char arr[10];
```

---

## Important Distinction

This:

```cpp
char arr[5]={'H','e','l','l','o'};
```

is NOT a proper C-style string.

It is ONLY:

```text
Character array
```

Reason:

```text
No '\0'
```

---

## Memory Layout

```cpp
char arr[5]={'H','e','l','l','o'};
```

Memory:

```text
Index:

0 1 2 3 4

Value:

H e l l o
```

Notice:

```text
No null terminator exists
```

---

## Dangerous Consequence

```cpp
cout<<arr;
```

Possible output:

```text
Hello▒╬@...
```

or even crash.

---

## Why Does This Happen?

`cout` assumes:

```text
Character arrays are null terminated
```

So printing continues until it accidentally finds:

```cpp
'\0'
```

somewhere later in memory.

This is:

```text
Undefined Behavior
```

---

### Correct Manual Initialization

```cpp
char arr[6]={'H','e','l','l','o','\0'};
```

Memory:

```text
Index:

0 1 2 3 4 5

Value:

H e l l o \0
```

---

### Expected Output

```cpp
cout<<arr;
```

Output:

```text
Hello
```

---

### Best Initialization Method

```cpp
char arr[]="Hello";
```

Compiler automatically adds:

```cpp
'\0'
```

Internally:

```text
H e l l o \0
```

Actual size becomes:

```text
6
```

because:

```text
5 characters + '\0'
```

---

### Important Compilation Rule

Correct:

```cpp
char arr[6]="Hello";
```

Required memory:

```text
H e l l o \0
```

Total:

```text
6 bytes
```

---

### Wrong Example

```cpp
char arr[5]="Hello";
```

---

### Why Wrong?

Needs:

```text
6 positions
```

because:

```text
Hello + '\0'
```

---

### Expected Result

Usually:

```text
Compilation Error
```

or compiler warning.

---

### Correct Mental Model

Without:

```cpp
'\0'
```

this:

```cpp
char arr[]={'H','e','l','l','o'};
```

is NOT a proper string.

It is ONLY:

```text
array of characters
```

---

### Null Character (`'\0'`)

#### Definition

Null character:

```cpp
'\0'
```

ASCII value:

```text
0
```

Purpose:

```text
Marks end of C-style string
```

---

### Why Null Character Exists

Suppose:

```cpp
char arr[]="Prashant";
```

Memory:

```text
P r a s h a n t \0
```

When printing:

```cpp
cout<<arr;
```

Execution:

```text
P
r
a
s
h
a
n
t

'\0' found

STOP
```

---

### Important Example

```cpp
char arr[]={'a','\0','b','\0','c'};

cout<<arr;
```

Expected Output:

```text
a
```

---

### Why?

Printing stops at first:

```cpp
'\0'
```

---

### String Literal

#### Definition

Text enclosed in:

```cpp
""
```

Example:

```cpp
"Hello"
```

---

### Internal Representation

```text
H e l l o \0
```

Compiler automatically appends:

```cpp
'\0'
```

---

### MOST IMPORTANT CONCEPT

String literals are:

```text
READ ONLY
```

---

### Dangerous Example

```cpp
char *ptr="Hello";

ptr[0]='M';
```

---

### Why Dangerous?

String literal stored in:

```text
Read-only memory segment
```

Attempting modification causes:

- Undefined behavior
- Segmentation fault
- Crash

---

### Internal Memory Layout

```text
ptr
 ↓
"H e l l o \0"
```

Pointer points to read-only memory.

---

### Correct Writable Version

```cpp
char arr[]="Hello";

arr[0]='M';

cout<<arr;
```

Expected Output:

```text
Mello
```

---

### Why Does This Work?

Because:

```cpp
char arr[]="Hello";
```

creates COPY of literal into writable memory.

Usually:

```text
Stack Memory
```

---

### Character Array vs String Literal

| Feature    | Character Array      | String Literal    |
| ---------- | -------------------- | ----------------- |
| Example    | `char arr[]="Hello"` | `"Hello"`         |
| Writable   | Yes                  | No                |
| Memory     | Stack                | Read-only segment |
| Can modify | Yes                  | No                |
| Has `\0`   | Yes                  | Yes               |

---

### C-Style String

#### Definition

A C-style string is:

```text
Character array ending with '\0'
```

---

### Important Rule

This:

```cpp
char arr[]="Hello";
```

IS a proper C-style string.

This:

```cpp
char arr[]={'H','e','l','l','o'};
```

is NOT.

---

### How Length Is Determined

C-style strings do NOT store length.

Functions like:

```cpp
strlen()
```

scan memory until:

```cpp
'\0'
```

---

### Example

```cpp
#include<iostream>
#include<cstring>

using namespace std;

int main()
{
    char arr[]="Hello";

    cout<<strlen(arr);
}
```

Expected Output:

```text
5
```

---

### Internal Working

Memory:

```text
H e l l o \0
```

Execution:

```text
H → count 1
e → count 2
l → count 3
l → count 4
o → count 5

'\0' found

STOP
```

---

### Complexity

```text
O(N)
```

because full scan required.

---

### Dangerous Example

```cpp
char arr[5]={'H','e','l','l','o'};

cout<<strlen(arr);
```

---

### Problem

No null terminator exists.

`strlen()` keeps scanning memory.

Undefined behavior.

---

## Input Into Character Array

---

## Method 1 — cin

```cpp
char name[20];

cin>>name;
```

Input:

```text
Prashant
```

Expected Output:

```text
Prashant
```

---

## Hidden Behavior

Input:

```text
Prashant Sharma
```

Expected Output:

```text
Prashant
```

---

## Why?

`cin` stops at:

- Space `' '`
- Tab `'\t'`
- Newline `'\n'`

---

### Internal Buffer Behavior

Input:

```text
Prashant Sharma
```

Stored:

```text
P r a s h a n t \0
```

Remaining buffer:

```text
Sharma
```

still exists in input stream.

---

### Safe Full-Line Input

```cpp
char name[50];

cin.getline(name,50);
```

Input:

```text
Prashant Sharma
```

Expected Output:

```text
Prashant Sharma
```

---

### Buffer Overflow Problem

#### Dangerous Example

```cpp
char name[5];

cin>>name;
```

Input:

```text
Prashant
```

---

### Problem

Memory allocated:

```text
Only 5 bytes
```

Input requires:

```text
9 bytes
```

including:

```cpp
'\0'
```

---

### Possible Results

- Memory corruption
- Crash
- Segmentation fault
- Undefined behavior

---

### Output Behavior

---

### Character Output

```cpp
char ch='A';

cout<<ch;
```

Expected Output:

```text
A
```

---

### Character Array Output

```cpp
char arr[]="Hello";

cout<<arr;
```

Expected Output:

```text
Hello
```

---

### Important Hidden Behavior

This works because:

```cpp
cout
```

has special overload for:

```cpp
char*
```

---

### Compare With Integer Array

```cpp
int arr[]={1,2,3};

cout<<arr;
```

Expected Output:

```text
Memory Address
```

---

### Why?

Only character pointers treated specially as strings.

---

### C++ String (`std::string`)

#### Definition

C++ string is an STL class.

Header:

```cpp
#include<string>
```

Syntax:

```cpp
string s="Hello";
```

---

### Important Correction

Wrong:

```text
String is 1D character array
```

Correct:

```text
std::string is a class that internally manages dynamic character arrays.
```

---

### Internal Structure

```cpp
string s="Hello";
```

Internally object stores:

- Pointer
- Size
- Capacity

Memory:

```text
String Object

↓

Pointer

↓

Heap Memory

↓

H e l l o \0
```

---

### Dynamic Resizing

Character array:

```cpp
char arr[20];
```

Fixed size.

---

String:

```cpp
string s;
```

Dynamic size.

Can grow automatically.

---

### Example

```cpp
string s="Hello";

s+=" World";

cout<<s;
```

Expected Output:

```text
Hello World
```

---

### Size vs Capacity

```cpp
string s="Hello";
```

Possible:

```text
Size = 5

Capacity = 15
```

---

### Why Extra Capacity?

To reduce repeated reallocations.

Same concept as vector.

---

### Character Array vs C++ String

| Feature                | Character Array | C++ String         |
| ---------------------- | --------------- | ------------------ |
| Size                   | Fixed           | Dynamic            |
| Memory Management      | Manual          | Automatic          |
| Null Terminator Needed | Yes             | Internally managed |
| Safer                  | No              | Yes                |
| Rich Functions         | No              | Yes                |
| Easy Manipulation      | Difficult       | Easy               |

---

### Array of Characters vs Array of Strings

---

### Array of Characters

```cpp
char arr[]="Hello";
```

Represents:

```text
Single string
```

Memory:

```text
H e l l o \0
```

---

### Array of Strings

```cpp
string arr[3]=
{
"Hello",
"Hi",
"Bye"
};
```

Contains:

```text
3 separate string objects
```

---

### Memory Model

```text
arr[0] → Hello

arr[1] → Hi

arr[2] → Bye
```

---

### Important STL String Functions

---

### length()

```cpp
string s="Hello";

cout<<s.length();
```

Expected Output:

```text
5
```

---

### size()

```cpp
cout<<s.size();
```

Expected Output:

```text
5
```

---

### empty()

```cpp
string s="";

cout<<s.empty();
```

Expected Output:

```text
1
```

---

### push_back()

```cpp
string s="Hell";

s.push_back('o');

cout<<s;
```

Expected Output:

```text
Hello
```

---

### pop_back()

```cpp
string s="Hello";

s.pop_back();

cout<<s;
```

Expected Output:

```text
Hell
```

---

### substr()

```cpp
string s="Prashant";

cout<<s.substr(2,4);
```

Expected Output:

```text
asha
```

---

### find()

```cpp
string s="Prashant";

cout<<s.find("sha");
```

Expected Output:

```text
3
```

---

### erase()

```cpp
string s="Prashant";

s.erase(2,3);

cout<<s;
```

Expected Output:

```text
Prant
```

---

### insert()

```cpp
string s="Prant";

s.insert(2,"ASH");

cout<<s;
```

Expected Output:

```text
PrASHant
```

---

### reverse()

```cpp
#include<algorithm>

reverse(
s.begin(),
s.end()
);
```

---

### Example

```cpp
string s="Hello";

reverse(
s.begin(),
s.end()
);

cout<<s;
```

Expected Output:

```text
olleH
```

---

### Important C String Functions

Header:

```cpp
#include<cstring>
```

---

### strlen()

```cpp
char arr[]="Hello";

cout<<strlen(arr);
```

Expected Output:

```text
5
```

---

### strcpy()

```cpp
char src[]="Hello";

char dest[10];

strcpy(dest,src);

cout<<dest;
```

Expected Output:

```text
Hello
```

---

### strcat()

```cpp
char a[20]="Hello ";

char b[]="World";

strcat(a,b);

cout<<a;
```

Expected Output:

```text
Hello World
```

---

### strcmp()

```cpp
cout<<strcmp("ABC","ABC");
```

Expected Output:

```text
0
```

---

### strcmp Return Meaning

| Result | Meaning       |
| ------ | ------------- |
| 0      | Equal         |
| <0     | First smaller |
| >0     | First greater |

---

### sizeof vs strlen

---

### Example

```cpp
char arr[]="Hello";

cout<<sizeof(arr)<<endl;

cout<<strlen(arr);
```

Expected Output:

```text
6
5
```

---

### Why Different?

Memory:

```text
H e l l o \0
```

---

### sizeof()

Counts:

```text
Entire memory
```

including:

```cpp
'\0'
```

---

### strlen()

Counts:

```text
Characters before '\0'
```

---

### When To Use What

| Situation               | Recommended     |
| ----------------------- | --------------- |
| Modern C++              | `string`        |
| Competitive Programming | `string`        |
| Safe Development        | `string`        |
| Legacy C APIs           | Character Array |
| Embedded Systems        | Character Array |
| Manual Memory Control   | Character Array |

---

### Common Bugs

---

### Bug 1

Wrong:

```cpp
char arr[5]="Hello";
```

Needs:

```text
6 positions
```

because:

```text
H e l l o \0
```

---

### Bug 2

Wrong:

```cpp
char *ptr="Hello";

ptr[0]='M';
```

Reason:

```text
String literals are read-only
```

---

### Bug 3

Wrong:

```cpp
cin>>name;
```

Input:

```text
Prashant Sharma
```

Output:

```text
Prashant
```

---

### Fix

```cpp
getline(cin,name);
```

---

### Bug 4

Wrong:

```cpp
char arr[5]={'H','e','l','l','o'};

cout<<strlen(arr);
```

Reason:

```text
No '\0'
```

---

### Interview Questions

---

### Q1

Difference between:

```cpp
char ch='A';
```

and

```cpp
string s="A";
```

Answer:

| char             | string              |
| ---------------- | ------------------- |
| Single character | Multiple characters |
| 1 byte           | Dynamic object      |

---

### Q2

Why null character important?

Answer:

Marks end of C-style string.

---

### Q3

Difference between character array and string literal?

Answer:

| Character Array | String Literal    |
| --------------- | ----------------- |
| Writable        | Read-only         |
| Stack memory    | Read-only segment |
| Can modify      | Cannot modify     |

---

### Q4

Why string class preferred?

Answer:

- Dynamic size
- Rich functions
- Safer
- Easier manipulation

---

### Q5

Why does `cout<<charArray` print full string?

Answer:

Because `cout` has special overload for:

```cpp
char*
```

---

### Final Mental Model

---

### Character Literal

```cpp
'A'
```

```text
Single character
```

---

### String Literal

```cpp
"Hello"
```

```text
Read-only null-terminated character sequence
```

---

### Character Array

```cpp
char arr[10];
```

```text
Array capable of storing characters
```

---

### C-Style String

```cpp
char arr[]="Hello";
```

```text
Null-terminated character array
```

---

### C++ String

```cpp
string s="Hello";
```

```text
Dynamic string object
```

---

### Cheat Sheet

```cpp
char ch='A';

char arr[]="Hello";

char arr[6]={'H','e','l','l','o','\0'};

cin>>arr;

cin.getline(arr,50);

string s="Hello";

s.length();

s.size();

s.push_back('A');

s.pop_back();

s.substr(2,4);

s.find("abc");

s.erase(2,3);

s.insert(2,"ABC");

reverse(
s.begin(),
s.end()
);

strlen(arr);

strcpy(dest,src);

strcat(a,b);

strcmp(a,b);
```

---

### Key Takeaways

- Character arrays and strings are NOT identical
- `'\0'` is critical in C-style strings
- Missing null terminator causes undefined behavior
- String literals are read-only
- Character arrays are writable
- `std::string` is safest and preferred in modern C++
- `strlen()` depends on `'\0'`
- `sizeof()` and `strlen()` are different
- `cout` treats character arrays specially
- Buffer overflow is dangerous

---