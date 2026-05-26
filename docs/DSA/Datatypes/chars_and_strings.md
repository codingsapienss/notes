---
sidebar_label: 'Chars & Strings'
sidebar_position: 1
---

# Characters and Strings

**Topics Covered**

- Characters (`char`)
- ASCII and Internal Storage
- Character Arrays
- Strings
- String Literals
- Null Character
- Input Methods
- Output Methods
- Memory Layout
- Character Array vs String Class
- Array of Characters vs Array of Strings
- Dynamic Length Handling
- Important STL Functions
- Common Bugs
- Hidden Behavior
- Interview Questions
- Best Practices
- Cheat Sheet

---

# Introduction

Strings look simple:

```cpp
string name="Prashant";
```

but internally they involve:

- arrays
- pointers
- memory
- null termination
- dynamic allocation
- object management

Many C++ bugs come from misunderstanding strings and characters.

---

# Character (`char`)

## Intuition

A character stores exactly one symbol.

Examples:

```text
A
B
a
1
$
#
```

---

## Definition

`char` is a fundamental data type used to store a single character.

Syntax:

```cpp
char ch='A';
```

---

## Internal Storage

Characters are stored internally as integers using ASCII values.

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

Output:

```text
A
65
```

---

## Code Explanation

```cpp
(int)ch
```

converts character into integer.

---

# Character Array

## Definition

Character array is an array of characters.

Syntax:

```cpp
char ch[10];
```

---

## Initialization

```cpp
char ch[10]={'a'};
```

Memory:

```text
Index:

0 1 2 3 4 5 ...

Value:

a \0 \0 \0 \0 \0
```

Remaining values automatically become:

```cpp
'\0'
```

---

## Example

```cpp
char ch[5]={'H','e','l','l','o'};
```

Memory:

```text
H e l l o
```

Notice:

```text
No null character
```

This is dangerous.

---

Correct:

```cpp
char ch[]="Hello";
```

Memory:

```text
H e l l o \0
```

---

# String Literal

## Definition

String literals are enclosed in double quotes.

Example:

```cpp
"Hello"
```

---

## Important Hidden Detail

String literals are:

```text
Read Only
```

Wrong:

```cpp
char *ptr="Hello";

ptr[0]='M';
```

Undefined behavior.

---

Correct:

```cpp
char arr[]="Hello";

arr[0]='M';
```

Output:

```text
Mello
```

---

# Why?

String literal stored internally:

```text
Read-only memory segment
```

Character array:

```text
Stack memory
```

modifiable.

---

# Null Character

## Definition

Null character:

```cpp
'\0'
```

ASCII value:

```text
0
```

Purpose:

Marks end of string.

---

# Why Null Character Exists

Suppose:

```cpp
char ch[]="Prashant";
```

Memory:

```text
P r a s h a n t \0
```

When printing:

```cpp
cout<<ch;
```

C++ reads:

```text
P
r
a
s
h
a
n
t

stop at '\0'
```

---

# Example

```cpp
char arr[]={'a','\0','b','\0','c'};

cout<<arr;
```

Output:

```text
a
```

Reason:

Printing stops at first null.

---

# Input Into Character Array

## Method 1

```cpp
char name[20];

cin>>name;
```

Input:

```text
Prashant
```

Output:

```text
Prashant
```

---

## Hidden Behavior

Input:

```text
Prashant Sharma
```

Output:

```text
Prashant
```

---

## Why?

`cin` stops at:

- Space

```cpp
' '
```

- Tab

```cpp
'\t'
```

- New line

```cpp
'\n'
```

---

Execution:

Input:

```text
Prashant Sharma
```

Memory:

```text
P r a s h a n t \0
```

Remaining:

```text
Sharma
```

still exists in input buffer.

---

# Safe Input Using getline()

```cpp
char name[50];

cin.getline(name,50);
```

Input:

```text
Prashant Sharma
```

Output:

```text
Prashant Sharma
```

---

# Buffer Overflow Problem

Wrong:

```cpp
char name[5];

cin>>name;
```

Input:

```text
Prashant
```

Problem:

Memory:

```text
P r a s h a n t
```

Array:

```text
Only 5 positions
```

Result:

```text
Buffer overflow
```

Possible:

- Segmentation fault
- Memory corruption
- Undefined behavior

---

# Output

## Character

```cpp
char ch='A';

cout<<ch;
```

Output:

```text
A
```

---

## Character Array

```cpp
char name[]="Prashant";

cout<<name;
```

Output:

```text
Prashant
```

---

## Important Hidden Behavior

Character arrays behave differently.

Example:

```cpp
int arr[]={1,2,3};

cout<<arr;
```

Output:

```text
Address
```

---

But:

```cpp
char arr[]="Hello";

cout<<arr;
```

Output:

```text
Hello
```

Reason:

`cout` has special handling for character arrays.

---

# Strings (`string`)

## Definition

C++ string is a class from STL.

Header:

```cpp
#include<string>
```

Syntax:

```cpp
string s="Hello";
```

---

## Important Correction

Wrong:

```text
String is 1D character array
```

Correct:

```text
C++ string is an STL class which internally manages dynamic character arrays.
```

---

# Internal Working

```cpp
string s="Hello";
```

Internally:

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

String object stores:

- pointer
- size
- capacity

---

# Size vs Capacity

Example:

```cpp
string s="Hello";
```

Possible:

```text
Size=5

Capacity=15
```

---

# Dynamic Length Handling

Character array:

```cpp
char arr[20];
```

Fixed size.

String:

```cpp
string s;
```

Can grow automatically.

Example:

```cpp
s+="Hello";
s+="World";
```

---

# How Length Is Determined In Character Array

For character arrays:

```cpp
strlen()
```

works by scanning:

```text
until '\0'
```

Example:

```cpp
char ch[]="Hello";
```

Memory:

```text
H e l l o \0
```

Length:

```text
5
```

---

## Internal Working

```text
Count++

until

'\0'
```

Complexity:

```text
O(N)
```

---

# Why String Doesn't Need Size

Character array:

```cpp
char arr[20];
```

Needs memory reservation.

String:

```cpp
string s;
```

internally allocates dynamically.

---

# Array Of Characters vs Array Of Strings

---

## Array of Characters

```cpp
char arr[]="Hello";
```

Memory:

```text
H e l l o \0
```

---

## Array of Strings

```cpp
string arr[3]=
{
"Hello",
"Hi",
"Bye"
};
```

Memory:

```text
arr[0]

↓

Hello

arr[1]

↓

Hi

arr[2]

↓

Bye
```

---

# Important STL String Functions

---

## length()

```cpp
string s="Hello";

cout<<s.length();
```

Output:

```text
5
```

---

## size()

```cpp
cout<<s.size();
```

---

## empty()

```cpp
cout<<s.empty();
```

---

## push_back()

```cpp
s.push_back('A');
```

---

## pop_back()

```cpp
s.pop_back();
```

---

## substr()

```cpp
string s="Prashant";

cout<<s.substr(2,4);
```

Output:

```text
asha
```

---

## find()

```cpp
cout<<s.find("sha");
```

Output:

```text
3
```

---

## erase()

```cpp
s.erase(2,3);
```

---

## insert()

```cpp
s.insert(2,"ABC");
```

---

## reverse()

```cpp
reverse(
s.begin(),
s.end()
);
```

---

# Complexity Table

| Operation     | Complexity     |
| ------------- | -------------- |
| Access        | O(1)           |
| Push Back     | O(1) amortized |
| Length        | O(1)           |
| Insert Middle | O(N)           |
| Erase Middle  | O(N)           |

---

# Common Bugs

---

## Bug 1

Wrong:

```cpp
char arr[5]="Hello";
```

Problem:

Needs:

```text
6 positions
```

because:

```text
H e l l o \0
```

Correct:

```cpp
char arr[6]="Hello";
```

---

## Bug 2

Wrong:

```cpp
char *ptr="Hello";

ptr[0]='M';
```

---

## Bug 3

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

Fix:

```cpp
getline(cin,name);
```

---

# Interview Questions

## Q1

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
| 1 byte           | Dynamic             |

---

## Q2

Why null character important?

Answer:

Marks end of character array.

---

## Q3

Difference between character array and string?

Answer:

| Character Array | String             |
| --------------- | ------------------ |
| Fixed           | Dynamic            |
| Manual handling | Automatic          |
| Uses '\0'       | Managed internally |

---

## Q4

Why string class preferred?

Answer:

- Dynamic size
- Rich functions
- Safer
- Easier manipulation

---

# Cheat Sheet

```cpp
char ch='A';

char arr[]="Hello";

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
```

---

# Key Takeaways

- char stores one character
- Character arrays depend on '\0'
- cin stops at spaces
- String literals are read-only
- String class manages memory dynamically
- Character arrays and strings behave differently
- Buffer overflow is dangerous
- String functions simplify manipulation

---
