---
sidebar_label: 'Pointers Part 4D'
sidebar_position: 16
---

# Dynamic Memory Allocation for 2D Arrays

#### Why Do We Need Dynamic 2D Arrays?

Static 2D arrays require size at compile time:

```cpp
int arr[3][4];
```

But when size is known only at runtime:

```cpp
int rows, cols;
cin >> rows >> cols;
```

we must use **dynamic memory allocation**.

---

### Step 1: Create Row Pointers

```cpp
int** arr = new int*[rows];
```

##### Memory

```text
arr
 │
 ▼

┌─────┐
│  ?  │
├─────┤
│  ?  │
├─────┤
│  ?  │
└─────┘
```

Each location will store the address of a row.

---

### Step 2: Create Individual Rows

```cpp
for(int i = 0; i < rows; i++)
{
    arr[i] = new int[cols];
}
```

##### Memory Layout

```text
arr
 │
 ▼

┌─────────┐ ───► [ ][ ][ ][ ]
├─────────┤ ───► [ ][ ][ ][ ]
├─────────┤ ───► [ ][ ][ ][ ]
└─────────┘
```

---

### Complete Allocation

```cpp
int** arr = new int*[rows];

for(int i = 0; i < rows; i++)
{
    arr[i] = new int[cols];
}
```

---

### Taking Input

```cpp
for(int i = 0; i < rows; i++)
{
    for(int j = 0; j < cols; j++)
    {
        cin >> arr[i][j];
    }
}
```

---

### Printing Output

```cpp
for(int i = 0; i < rows; i++)
{
    for(int j = 0; j < cols; j++)
    {
        cout << arr[i][j] << " ";
    }

    cout << endl;
}
```

---

### How Does `arr[i][j]` Work Internally?

Compiler converts:

```cpp
arr[i][j]
```

into:

```cpp
*(*(arr + i) + j)
```

##### Example

```cpp
arr[2][3]
```

means:

```cpp
*(*(arr + 2) + 3)
```

---

### Memory Deallocation

Every `new` must have a matching `delete`.

---

#### Step 1: Delete Each Row

```cpp
for(int i = 0; i < rows; i++)
{
    delete[] arr[i];
}
```

---

#### Step 2: Delete Row Pointer Array

```cpp
delete[] arr;
```

---

### Complete Deallocation

```cpp
for(int i = 0; i < rows; i++)
{
    delete[] arr[i];
}

delete[] arr;
```

---

### Common Mistake

Wrong:

```cpp
delete[] arr;
```

Only row pointers are deleted.

Actual row data remains in memory.

Result:

```text
Memory Leak
```

---

### Complete Program

```cpp
#include <iostream>
using namespace std;

int main()
{
    int rows, cols;

    cin >> rows >> cols;

    int** arr = new int*[rows];

    for(int i = 0; i < rows; i++)
    {
        arr[i] = new int[cols];
    }

    for(int i = 0; i < rows; i++)
    {
        for(int j = 0; j < cols; j++)
        {
            cin >> arr[i][j];
        }
    }

    for(int i = 0; i < rows; i++)
    {
        for(int j = 0; j < cols; j++)
        {
            cout << arr[i][j] << " ";
        }

        cout << endl;
    }

    for(int i = 0; i < rows; i++)
    {
        delete[] arr[i];
    }

    delete[] arr;

    return 0;
}
```

---

### Static vs Dynamic 2D Array

| Feature                    | Static 2D Array | Dynamic 2D Array |
| -------------------------- | --------------- | ---------------- |
| Size Known at Compile Time | Yes             | No               |
| Runtime Size               | No              | Yes              |
| Stored In                  | Stack           | Heap             |
| Manual Deletion Required   | No              | Yes              |

---

### Key Takeaways

- Use `int**` to create dynamic 2D arrays.
- First allocate row pointers.
- Then allocate each row separately.
- `arr[i][j]` internally becomes `*(*(arr+i)+j)`.
- Every `new` must have a matching `delete`.
- Delete rows first, then delete the row pointer array.
- Forgetting deletion causes memory leaks.

---

---

### Jagged Arrays (Dynamic 2D Arrays with Variable Columns)

#### What Is a Jagged Array?

A Jagged Array is a 2D array where:

```text
Each row can have a different number of columns.
```

Unlike a normal 2D array:

```text
3 × 4

[ ][ ][ ][ ]
[ ][ ][ ][ ]
[ ][ ][ ][ ]
```

where every row has the same number of columns,

a jagged array can have:

```text
Row 0 → 2 columns
Row 1 → 5 columns
Row 2 → 3 columns
```

Example:

```text
[ ][ ]
[ ][ ][ ][ ][ ]
[ ][ ][ ]
```

---

### Why Do We Need Jagged Arrays?

Useful when every row does not require the same amount of data.

Examples:

- Student marks (different number of subjects)
- Graph adjacency lists
- Sparse data structures
- Dynamic tables
- Variable-length records

---

### Creating a Jagged Array

#### Step 1: Create Row Pointers

```cpp
int rows = 3;

int** arr = new int*[rows];
```

Memory:

```text
arr
 │
 ▼

┌─────┐
│  ?  │
├─────┤
│  ?  │
├─────┤
│  ?  │
└─────┘
```

---

#### Step 2: Allocate Different Column Sizes

```cpp
arr[0] = new int[2];
arr[1] = new int[5];
arr[2] = new int[3];
```

Memory:

```text
arr
 │
 ▼

┌─────────┐ ───► [ ][ ]
├─────────┤ ───► [ ][ ][ ][ ][ ]
├─────────┤ ───► [ ][ ][ ]
└─────────┘
```

Notice:

```text
Every row has a different size.
```

---

### Complete Example

```cpp
#include <iostream>
using namespace std;

int main()
{
    int rows = 3;

    int** arr = new int*[rows];

    arr[0] = new int[2];
    arr[1] = new int[5];
    arr[2] = new int[3];

    arr[0][0] = 10;
    arr[0][1] = 20;

    arr[1][0] = 30;
    arr[1][1] = 40;
    arr[1][2] = 50;
    arr[1][3] = 60;
    arr[1][4] = 70;

    arr[2][0] = 80;
    arr[2][1] = 90;
    arr[2][2] = 100;

    cout << arr[1][3] << endl;

    for(int i = 0; i < rows; i++)
    {
        delete[] arr[i];
    }

    delete[] arr;

    return 0;
}
```

##### Output

```text
60
```

---

### Runtime Jagged Array

Suppose each row size is entered by the user.

```cpp
int rows;

cin >> rows;

int** arr = new int*[rows];

int* colSize = new int[rows];
```

Take size of each row:

```cpp
for(int i = 0; i < rows; i++)
{
    cin >> colSize[i];

    arr[i] = new int[colSize[i]];
}
```

Example Input:

```text
3
2
5
3
```

Meaning:

```text
Row 0 → 2 columns
Row 1 → 5 columns
Row 2 → 3 columns
```

---

### Taking Input

```cpp
for(int i = 0; i < rows; i++)
{
    for(int j = 0; j < colSize[i]; j++)
    {
        cin >> arr[i][j];
    }
}
```

---

### Printing Output

```cpp
for(int i = 0; i < rows; i++)
{
    for(int j = 0; j < colSize[i]; j++)
    {
        cout << arr[i][j] << " ";
    }

    cout << endl;
}
```

---

### Memory Layout

Example:

```text
rows = 3

sizes:
2
5
3
```

Memory:

```text
arr
 │
 ▼

┌─────────┐ ───► [10][20]
├─────────┤ ───► [30][40][50][60][70]
├─────────┤ ───► [80][90][100]
└─────────┘
```

---

### Deallocating a Jagged Array

Exactly same as dynamic 2D arrays.

```cpp
for(int i = 0; i < rows; i++)
{
    delete[] arr[i];
}

delete[] arr;

delete[] colSize;
```

---

### Jagged Array vs Normal Dynamic 2D Array

| Feature               | Dynamic 2D Array | Jagged Array  |
| --------------------- | ---------------- | ------------- |
| Same Columns Per Row  | Yes              | No            |
| Memory Efficient      | No               | Yes           |
| Flexible              | Limited          | High          |
| Allocation Complexity | Simple           | Slightly More |

---

### Key Takeaways

- A jagged array is a 2D array where each row can have a different number of columns.
- Implemented using `int**`.
- Each row is allocated separately.
- More memory efficient when row sizes vary.
- Commonly used in graphs, sparse structures, and variable-length datasets.
- Deallocation is the same as a dynamic 2D array:
  - Delete each row first.
  - Then delete the row pointer array.

---
