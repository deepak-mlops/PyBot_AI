import { User, KnowledgeBaseItem, Conversation, ChatMessage, Invoice, SubscriptionPlan } from '../src/types/index.js';
import { hashPassword } from './auth.js';

export interface DBUser extends User {
  passwordHash: string;
}

export interface UnansweredQuery {
  id: string;
  userId?: string;
  query: string;
  suggestedCategory: string;
  confidence: number;
  timestamp: string;
}

// In-memory persistent database store
class DatabaseStore {
  users: Map<string, DBUser> = new Map();
  kbItems: Map<string, KnowledgeBaseItem> = new Map();
  conversations: Map<string, Conversation> = new Map();
  messages: Map<string, ChatMessage[]> = new Map();
  invoices: Map<string, Invoice> = new Map();
  unanswered: UnansweredQuery[] = [];
  queryLogs: { id: string; category: string; timestamp: string; latencyMs: number }[] = [];

  constructor() {
    this.seedUsers();
    this.seedKnowledgeBase();
    this.seedConversations();
    this.seedInvoices();
    this.seedQueryLogs();
  }

  private seedUsers() {
    const adminUser: DBUser = {
      id: 'usr_admin_001',
      name: 'Dr. Sarah Chen (Admin)',
      email: 'admin@pybot.ai',
      role: 'admin',
      plan: 'enterprise',
      questionsUsedToday: 4,
      questionLimitDaily: 9999,
      createdAt: '2026-01-10T09:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      organization: 'PyBot AI Core Engineering',
      passwordHash: hashPassword('AdminPass123!'),
    };

    const regularUser: DBUser = {
      id: 'usr_dev_002',
      name: 'Alex Rivera (Python Dev)',
      email: 'user@pybot.ai',
      role: 'user',
      plan: 'pro',
      questionsUsedToday: 18,
      questionLimitDaily: 150,
      createdAt: '2026-02-01T14:30:00Z',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      organization: 'Freelance AI Lab',
      passwordHash: hashPassword('UserPass123!'),
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(regularUser.id, regularUser);
  }

  private seedKnowledgeBase() {
    const kbData: KnowledgeBaseItem[] = [
      // Python Introduction
      {
        id: 'kb_intro_01',
        title: 'What is Python and why is it popular?',
        category: 'Python Introduction',
        question: 'What is Python and what makes it special?',
        answer: 'Python is a high-level, interpreted, dynamically-typed programming language created by Guido van Rossum in 1991. Its design philosophy emphasizes code readability with the notable use of significant indentation. Python is widely used in Web Development, Machine Learning, Data Science, Automation, and Scripting.',
        codeSnippet: `# Python philosophy: Simple, readable, clean
import this

# Basic output
print("Hello, Python Developer!")
`,
        tags: ['intro', 'basics', 'overview', 'interpreted'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-15T10:00:00Z',
        usageCount: 342,
      },
      {
        id: 'kb_intro_02',
        title: 'Python 3 vs Python 2 Key Differences',
        category: 'Python Introduction',
        question: 'What are the main differences between Python 2 and Python 3?',
        answer: 'Python 3 is the current and modern standard. Key differences include: print is a function print() in Python 3; integer division 5 / 2 produces 2.5 (float) instead of 2; strings are Unicode by default; and xrange() was replaced by range(). Python 2 reached End-of-Life in 2020.',
        codeSnippet: `# Python 3 division returns float
result = 7 / 2
print("7 / 2 =", result)  # 3.5

# Integer floor division
floor_res = 7 // 2
print("7 // 2 =", floor_res)  # 3
`,
        tags: ['python3', 'python2', 'unicode', 'division'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-10T12:00:00Z',
        usageCount: 189,
      },

      // Variables and Data Types
      {
        id: 'kb_var_01',
        title: 'Variables and Primitive Types in Python',
        category: 'Variables and Data Types',
        question: 'How do variables and data types work in Python?',
        answer: 'Python does not require explicit variable declarations. Variables are created the moment you assign a value. Built-in primitive data types include int, float, complex, bool, str, and NoneType. Variables store references to objects in memory.',
        codeSnippet: `# Variable assignments
age: int = 25
price: float = 99.95
language: str = "Python"
is_active: bool = True
nothing: None = None

print(f"{language} developer is {age} years old. Active: {is_active}")
print(f"Types: {type(age)}, {type(price)}, {type(language)}")
`,
        tags: ['variables', 'types', 'int', 'float', 'str', 'type hint'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-18T08:30:00Z',
        usageCount: 420,
      },
      {
        id: 'kb_var_02',
        title: 'Mutable vs Immutable Data Types',
        category: 'Variables and Data Types',
        question: 'What is the difference between mutable and immutable types in Python?',
        answer: 'Immutable objects cannot be altered after creation (e.g., int, float, bool, str, tuple, frozenset). Attempting to modify them creates a new object in memory. Mutable objects can have their state modified in-place (e.g., list, dict, set).',
        codeSnippet: `# Immutable example: strings cannot be modified in-place
greeting = "hello"
try:
    greeting[0] = "H"  # Raises TypeError
except TypeError as e:
    print(f"Error caught: {e}")

# Mutable example: lists modify in-place
nums = [1, 2, 3]
nums.append(4)
print("Updated list:", nums)
`,
        tags: ['mutable', 'immutable', 'memory', 'id', 'tuple', 'list'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-12T11:00:00Z',
        usageCount: 295,
      },

      // Operators
      {
        id: 'kb_op_01',
        title: 'Python Operators: Arithmetic, Logical, and Bitwise',
        category: 'Operators',
        question: 'What are the different types of operators in Python?',
        answer: 'Python provides Arithmetic (+, -, *, /, //, %, **), Comparison (==, !=, <, >, <=, >=), Logical (and, or, not), Bitwise (&, |, ^, ~, <<, >>), Identity (is, is not), and Membership (in, not in) operators.',
        codeSnippet: `# Exponentiation and modulo
base = 2 ** 8  # 256
remainder = 29 % 5  # 4

# Membership operator
fruits = ["apple", "banana", "mango"]
print("mango in fruits:", "mango" in fruits)

# Identity vs Equality
a = [1, 2]
b = [1, 2]
print("a == b:", a == b)  # True (equal values)
print("a is b:", a is b)  # False (different memory addresses)
`,
        tags: ['operators', 'arithmetic', 'logical', 'membership', 'identity'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-05T09:15:00Z',
        usageCount: 167,
      },

      // Conditional Statements
      {
        id: 'kb_cond_01',
        title: 'Conditional Statements (if, elif, else) and Match-Case',
        category: 'Conditional Statements',
        question: 'How do if-elif-else statements and structural pattern matching work?',
        answer: 'Python uses if, elif, and else for branching based on boolean evaluations. Python 3.10 introduced structural pattern matching via match and case statements, which provides a cleaner, expressive alternative to nested if-else ladders.',
        codeSnippet: `# Match-Case pattern matching (Python 3.10+)
def get_http_status_message(code: int) -> str:
    match code:
        case 200:
            return "OK - Success"
        case 400:
            return "Bad Request - Client error"
        case 404:
            return "Not Found"
        case 500:
            return "Internal Server Error"
        case _:
            return f"Unhandled code: {code}"

print(get_http_status_message(200))
print(get_http_status_message(404))
`,
        tags: ['conditions', 'if', 'elif', 'else', 'match', 'pattern matching'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-14T14:00:00Z',
        usageCount: 215,
      },

      // Loops
      {
        id: 'kb_loop_01',
        title: 'For Loops, While Loops, and Loop Controls',
        category: 'Loops',
        question: 'How do loops and loop controls work in Python?',
        answer: 'Python offers for loops (iterating over sequences via the iterator protocol) and while loops (executing while a condition is truthy). Control statements include break (terminates loop), continue (skips to next iteration), and else on loops (executes only if loop completes without hitting a break).',
        codeSnippet: `# Loop with else block
target = 13
primes = [2, 3, 5, 7, 11]

for p in primes:
    if p == target:
        print(f"Found {target}!")
        break
else:
    print(f"{target} is not in the prime list.")

# enumerate gives both index and value
languages = ["Python", "Rust", "TypeScript"]
for idx, lang in enumerate(languages, start=1):
    print(f"{idx}. {lang}")
`,
        tags: ['loops', 'for', 'while', 'break', 'continue', 'enumerate'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-16T16:20:00Z',
        usageCount: 310,
      },
      {
        id: 'kb_loop_02',
        title: 'List Comprehensions vs Standard Loops',
        category: 'Loops',
        question: 'How do list comprehensions work and why use them?',
        answer: 'List comprehensions provide a concise, readable, and often faster way to create lists from existing iterables. The syntax is: [expression for item in iterable if condition]. They run at C-speed in CPython compared to explicit append() calls in Python loops.',
        codeSnippet: `# Standard loop vs List comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]
print("Even squares:", squares)

# Nested list comprehension
matrix = [[1, 2, 3], [4, 5, 6]]
flattened = [val for row in matrix for val in row]
print("Flattened matrix:", flattened)
`,
        tags: ['list comprehension', 'comprehension', 'filtering', 'performance'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-18T12:00:00Z',
        usageCount: 388,
      },

      // Functions
      {
        id: 'kb_func_01',
        title: 'Defining Functions, *args, and **kwargs',
        category: 'Functions',
        question: 'How do functions, *args, and **kwargs work in Python?',
        answer: 'Functions are defined using the def keyword. Parameters can be positional, default, variable positional (*args collects extra arguments into a tuple), or variable keyword (**kwargs collects named arguments into a dictionary). Functions can return multiple values as a tuple.',
        codeSnippet: `def compute_stats(*numbers: float, precision: int = 2, **metadata) -> dict:
    if not numbers:
        return {"error": "No numbers provided"}
    
    avg = sum(numbers) / len(numbers)
    return {
        "count": len(numbers),
        "sum": round(sum(numbers), precision),
        "mean": round(avg, precision),
        "metadata": metadata
    }

res = compute_stats(10.5, 20.3, 30.8, precision=1, source="sensor_a")
print("Stats output:", res)
`,
        tags: ['functions', 'args', 'kwargs', 'parameters', 'type hints'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-20T10:00:00Z',
        usageCount: 412,
      },
      {
        id: 'kb_func_02',
        title: 'Lambda Functions, Map, Filter, and Closures',
        category: 'Functions',
        question: 'What are lambda functions and closures in Python?',
        answer: 'Lambda functions are small, anonymous single-expression functions written with the syntax lambda arguments: expression. Closures occur when an inner function retains access to variables from its enclosing outer scope even after the outer function has finished executing.',
        codeSnippet: `# Lambda with sorted
students = [("Alice", 88), ("Bob", 95), ("Charlie", 72)]
students_by_grade = sorted(students, key=lambda s: s[1], reverse=True)
print("Ranked:", students_by_grade)

# Closure example: multiplier factory
def make_multiplier(factor: int):
    def multiplier(x: int) -> int:
        return x * factor
    return multiplier

double = make_multiplier(2)
print("Double of 21 is:", double(21))
`,
        tags: ['lambda', 'closure', 'map', 'filter', 'functional'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-11T13:45:00Z',
        usageCount: 275,
      },

      // Lists
      {
        id: 'kb_list_01',
        title: 'Python Lists: Methods, Slicing, and Operations',
        category: 'Lists',
        question: 'How do list operations and slicing work in Python?',
        answer: 'Lists are ordered, mutable collections of items. They support indexing from 0 and negative indexing from the end (-1). Slicing syntax is sequence[start:stop:step]. Common methods include append(), extend(), insert(), pop(), remove(), sort(), and reverse().',
        codeSnippet: `numbers = [10, 20, 30, 40, 50, 60]

# Slicing: [start:stop:step]
print("Reversed list:", numbers[::-1])
print("Middle slice:", numbers[1:4])
print("Every 2nd item:", numbers[::2])

# In-place mutations
numbers.append(70)
popped = numbers.pop()
print(f"Popped {popped}, Remaining: {numbers}")
`,
        tags: ['lists', 'slicing', 'append', 'pop', 'indexing'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-09T09:00:00Z',
        usageCount: 360,
      },

      // Tuples
      {
        id: 'kb_tuple_01',
        title: 'Tuples and NamedTuples in Python',
        category: 'Tuples',
        question: 'What are tuples and when should you use them instead of lists?',
        answer: 'Tuples are ordered, immutable collections defined with parentheses (). Because they are immutable, they are hashable (can be used as dictionary keys or set members) and occupy less memory than lists. typing.NamedTuple provides readable attribute access.',
        codeSnippet: `from typing import NamedTuple

# Standard tuple unpacking
point = (10, 20, 30)
x, y, z = point
print(f"Coordinates: x={x}, y={y}, z={z}")

# NamedTuple for structured data
class Point3D(NamedTuple):
    x: float
    y: float
    z: float

pt = Point3D(1.5, 2.5, 3.5)
print(f"Point3D: x={pt.x}, z={pt.z}")
`,
        tags: ['tuples', 'immutable', 'namedtuple', 'unpacking'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-08T11:20:00Z',
        usageCount: 198,
      },

      // Dictionaries
      {
        id: 'kb_dict_01',
        title: 'Python Dictionaries: Hashing, Methods, and Dict Comprehension',
        category: 'Dictionaries',
        question: 'How do dictionaries work and how are they implemented in Python?',
        answer: 'Dictionaries are key-value mappings implemented using hash tables with O(1) average time complexity for lookups, insertions, and deletions. Since Python 3.7+, dictionaries guarantee insertion order. Keys must be immutable and hashable.',
        codeSnippet: `user_scores = {"alice": 92, "bob": 85, "charlie": 78}

# Safe lookup with default
print("David's score:", user_scores.get("david", 0))

# Dictionary comprehension
passed_users = {k: v for k, v in user_scores.items() if v >= 80}
print("Passed users:", passed_users)

# Merging dictionaries (Python 3.9+)
extra_scores = {"david": 90, "eve": 94}
merged = user_scores | extra_scores
print("Merged dictionary:", merged)
`,
        tags: ['dictionaries', 'dict', 'hash table', 'lookup', 'comprehension'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-21T08:00:00Z',
        usageCount: 445,
      },

      // Sets
      {
        id: 'kb_set_01',
        title: 'Python Sets: Mathematical Operations and Fast Lookups',
        category: 'Sets',
        question: 'How do sets work and what mathematical operations do they support?',
        answer: 'Sets are unordered collections of unique, hashable elements. They provide O(1) membership testing and support set operations: Union (|), Intersection (&), Difference (-), and Symmetric Difference (^). frozenset is the immutable variant.',
        codeSnippet: `backend_skills = {"python", "sql", "docker", "fastapi"}
data_skills = {"python", "sql", "pandas", "machine_learning"}

# Mathematical set operations
common = backend_skills & data_skills
all_skills = backend_skills | data_skills
backend_only = backend_skills - data_skills

print("Common skills:", common)
print("Union:", all_skills)
print("Backend only:", backend_only)
`,
        tags: ['sets', 'union', 'intersection', 'deduplication', 'frozenset'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-12T15:00:00Z',
        usageCount: 220,
      },

      // Strings
      {
        id: 'kb_str_01',
        title: 'String Formatting: f-strings, Methods, and Manipulation',
        category: 'Strings',
        question: 'How does string manipulation and f-string formatting work in Python?',
        answer: 'Python strings are immutable sequences of Unicode characters. Python 3.6+ introduced formatted string literals (f-strings) which support expression evaluation, specifiers for decimal precision, padding, alignment, and self-documenting syntax f"{var=}".',
        codeSnippet: `name = "Python 3.12"
price = 49.9982
count = 5

# Modern f-string specifiers
print(f"Product: {name:>15}")  # Right aligned
print(f"Price: \${price:.2f}")    # 2 decimal places
print(f"Total: \${price * count:.2f}")

# Common string operations
raw_text = "  apple, banana, cherry  "
cleaned = [x.strip() for x in raw_text.split(",")]
print("Cleaned tokens:", cleaned)
`,
        tags: ['strings', 'f-strings', 'formatting', 'split', 'strip'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-17T11:00:00Z',
        usageCount: 330,
      },

      // Object-Oriented Programming & Classes and Objects
      {
        id: 'kb_oop_01',
        title: 'Object-Oriented Programming: Classes, Objects, and __init__',
        category: 'Object-Oriented Programming',
        question: 'How do classes, objects, and constructor methods work in Python?',
        answer: 'Classes are blueprints for creating objects. The __init__ method is the constructor that initializes newly instantiated object attributes. self represents the instance of the class and allows access to attributes and methods.',
        codeSnippet: `class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0):
        self.owner = owner
        self._balance = balance  # Protected attribute by convention

    def deposit(self, amount: float) -> float:
        if amount <= 0:
            raise ValueError("Deposit amount must be positive.")
        self._balance += amount
        return self._balance

    def get_balance(self) -> float:
        return self._balance

account = BankAccount("Ada Lovelace", 100.0)
account.deposit(50.0)
print(f"Owner: {account.owner}, Balance: \${account.get_balance():.2f}")
`,
        tags: ['oop', 'classes', 'objects', '__init__', 'self', 'methods'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-19T14:10:00Z',
        usageCount: 460,
      },

      // Inheritance
      {
        id: 'kb_inh_01',
        title: 'Inheritance, super(), and Method Resolution Order (MRO)',
        category: 'Inheritance',
        question: 'How does inheritance, multiple inheritance, and super() work in Python?',
        answer: 'Inheritance enables a child class to inherit attributes and methods from a parent class. super() delegates method calls to the parent class following the Method Resolution Order (MRO) calculated using the C3 linearization algorithm.',
        codeSnippet: `class Vehicle:
    def __init__(self, make: str, model: str):
        self.make = make
        self.model = model

    def describe(self) -> str:
        return f"{self.make} {self.model}"

class ElectricCar(Vehicle):
    def __init__(self, make: str, model: str, battery_kwh: int):
        super().__init__(make, model)
        self.battery_kwh = battery_kwh

    def describe(self) -> str:
        return f"{super().describe()} (Electric, {self.battery_kwh} kWh)"

ev = ElectricCar("Tesla", "Model 3", 75)
print(ev.describe())
`,
        tags: ['inheritance', 'super', 'mro', 'polymorphism', 'subclass'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-14T09:30:00Z',
        usageCount: 310,
      },

      // Exception Handling
      {
        id: 'kb_exc_01',
        title: 'Exception Handling: try, except, else, finally, and Custom Exceptions',
        category: 'Exception Handling',
        question: 'How do you handle errors and create custom exceptions in Python?',
        answer: 'Python handles runtime errors via try/except blocks. The else block runs if no exception occurred, and finally always executes (useful for cleanup). Custom exceptions inherit from the base Exception class.',
        codeSnippet: `class InsufficientFundsError(Exception):
    """Raised when an account balance is inadequate."""
    pass

def withdraw(balance: float, amount: float) -> float:
    if amount > balance:
        raise InsufficientFundsError(f"Cannot withdraw \${amount} with balance \${balance}")
    return balance - amount

try:
    current_balance = withdraw(100.0, 150.0)
except InsufficientFundsError as err:
    print(f"Transaction failed: {err}")
finally:
    print("Audit log: Transaction attempt complete.")
`,
        tags: ['exceptions', 'try', 'except', 'finally', 'custom exceptions', 'errors'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-13T10:00:00Z',
        usageCount: 350,
      },

      // File Handling
      {
        id: 'kb_file_01',
        title: 'File Handling: Context Managers (with), Reading, and Writing',
        category: 'File Handling',
        question: 'How do you properly read and write files using context managers in Python?',
        answer: 'Always use the with statement (context manager) to open files. It guarantees that file handles are safely closed even if exceptions occur. Standard modes include "r" (read), "w" (write/overwrite), "a" (append), and "r+" (read/write). json and csv modules handle structured formats.',
        codeSnippet: `import json

# Writing structured JSON
data = {"project": "PyBot AI", "version": "2.4.0", "author": "Python Team"}
with open("config_sample.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

# Reading back JSON
with open("config_sample.json", "r", encoding="utf-8") as f:
    loaded = json.load(f)

print("Loaded config:", loaded["project"])
`,
        tags: ['files', 'with', 'open', 'json', 'context manager', 'io'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-07T12:00:00Z',
        usageCount: 280,
      },

      // Modules and Packages
      {
        id: 'kb_mod_01',
        title: 'Modules, Packages, __init__.py, and import syntax',
        category: 'Modules and Packages',
        question: 'How do Python modules, packages, and __name__ == "__main__" work?',
        answer: 'A module is a single Python file (.py). A package is a directory containing modules and optionally an __init__.py file. The guard if __name__ == "__main__": ensures code only executes when run directly, not when imported as a module by other scripts.',
        codeSnippet: `# Module execution guard
def calculate_area(radius: float) -> float:
    import math
    return math.pi * (radius ** 2)

if __name__ == "__main__":
    r = 5.0
    print(f"Radius {r} -> Circle Area: {calculate_area(r):.2f}")
`,
        tags: ['modules', 'packages', '__name__', '__main__', 'imports'],
        difficulty: 'Beginner',
        updatedAt: '2026-02-04T15:30:00Z',
        usageCount: 235,
      },

      // NumPy
      {
        id: 'kb_np_01',
        title: 'NumPy Arrays, Broadcasting, and Vectorized Operations',
        category: 'NumPy',
        question: 'What is NumPy and how does array broadcasting and vectorization work?',
        answer: 'NumPy provides the ndarray object for high-performance numerical computing in C. Vectorization replaces explicit Python loops with batch operations. Broadcasting allows arithmetic operations between arrays of different but compatible dimensions without copying data.',
        codeSnippet: `# Demonstration of NumPy vectorization concepts in pure Python simulation
# In NumPy: arr = np.array([1, 2, 3]); arr * 2 -> array([2, 4, 6])
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
scalar = 10

# Broadcasting simulation
scaled = [[val * scalar for val in row] for row in matrix]
print("Scaled Matrix (10x):", scaled)

# Dot product calculation
vec_a = [1, 2, 3]
vec_b = [4, 5, 6]
dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
print("Vector Dot Product:", dot_product)  # 1*4 + 2*5 + 3*6 = 32
`,
        tags: ['numpy', 'arrays', 'broadcasting', 'vectorization', 'linear algebra'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-22T10:00:00Z',
        usageCount: 490,
      },

      // Pandas
      {
        id: 'kb_pd_01',
        title: 'Pandas DataFrames: Filtering, GroupBy, and Data Cleaning',
        category: 'Pandas',
        question: 'How do Pandas DataFrames work and how do you filter and aggregate data?',
        answer: 'Pandas is the primary library for data manipulation and tabular analysis. Its core objects are Series (1D) and DataFrame (2D). Essential methods include df.head(), df.describe(), df.groupby(), df.merge(), boolean indexing df[df["age"] > 25], and handling missing values with fillna() and dropna().',
        codeSnippet: `# Tabular aggregation logic simulation
records = [
    {"department": "Engineering", "salary": 110000},
    {"department": "Engineering", "salary": 125000},
    {"department": "Marketing", "salary": 85000},
    {"department": "Marketing", "salary": 92000},
]

# GroupBy calculation
depts = {}
for r in records:
    depts.setdefault(r["department"], []).append(r["salary"])

summary = {d: {"count": len(salaries), "avg": sum(salaries)/len(salaries)} for d, salaries in depts.items()}
print("Department summary:", summary)
`,
        tags: ['pandas', 'dataframe', 'groupby', 'aggregation', 'data cleaning'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-22T14:00:00Z',
        usageCount: 512,
      },

      // Matplotlib
      {
        id: 'kb_plt_01',
        title: 'Matplotlib: Creating Plots, Subplots, and Custom Visualizations',
        category: 'Matplotlib',
        question: 'How do you create line charts, bar plots, and subplots using Matplotlib?',
        answer: 'Matplotlib is Python\'s foundational plotting library. The pyplot module (plt) provides a state-based interface. The object-oriented API (fig, ax = plt.subplots()) is recommended for complex figures with multiple subplots, custom axes, labels, legends, and styling.',
        codeSnippet: `# Matplotlib OO-style template
# import matplotlib.pyplot as plt

# fig, ax = plt.subplots(figsize=(8, 4))
# ax.plot([1, 2, 3, 4], [10, 20, 25, 30], label="Training Loss", color="#0ea5e9")
# ax.set_xlabel("Epochs")
# ax.set_ylabel("Loss")
# ax.set_title("PyBot AI Training Progress")
# ax.legend()
# plt.savefig("loss_curve.png")

print("Matplotlib figure pipeline verified.")
`,
        tags: ['matplotlib', 'visualization', 'plots', 'charts', 'data science'],
        difficulty: 'Intermediate',
        updatedAt: '2026-02-18T16:00:00Z',
        usageCount: 315,
      },

      // Machine Learning
      {
        id: 'kb_ml_01',
        title: 'Machine Learning Workflow with Scikit-learn',
        category: 'Machine Learning',
        question: 'What is the end-to-end Machine Learning pipeline using Scikit-Learn?',
        answer: 'A standard Scikit-Learn workflow involves: 1) Data collection & preprocessing, 2) Train-test split (train_test_split), 3) Feature extraction (e.g., TfidfVectorizer, StandardScaler), 4) Model training (fit), 5) Inference (predict), and 6) Evaluation (accuracy_score, classification_report, confusion_matrix).',
        codeSnippet: `# Conceptual Scikit-Learn Pipeline
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.linear_model import LogisticRegression
# from sklearn.pipeline import Pipeline

# pipe = Pipeline([
#     ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
#     ('clf', LogisticRegression())
# ])
# pipe.fit(X_train, y_train)
# predictions = pipe.predict(X_test)

print("Scikit-learn classification architecture ready.")
`,
        tags: ['machine learning', 'scikit-learn', 'classification', 'pipeline', 'metrics'],
        difficulty: 'Advanced',
        updatedAt: '2026-02-23T11:00:00Z',
        usageCount: 560,
      },

      // Python Projects
      {
        id: 'kb_proj_01',
        title: 'Building a REST API with FastAPI or Flask',
        category: 'Python Projects',
        question: 'How do you structure a production-ready Python web API?',
        answer: 'Modern Python APIs typically use FastAPI (async, automatic OpenAPI documentation, Pydantic type validation) or Flask (micro-framework). Proper architecture separates routes, schemas, services, and database layers with dependency injection and configuration management.',
        codeSnippet: `# FastAPI structure sample
from typing import Optional

class UserQueryRequest:
    def __init__(self, query: str, category: Optional[str] = None):
        self.query = query
        self.category = category

req = UserQueryRequest("How to use list comprehension?", "Loops")
print(f"Received request: {req.query} (Category: {req.category})")
`,
        tags: ['projects', 'fastapi', 'flask', 'rest api', 'backend'],
        difficulty: 'Advanced',
        updatedAt: '2026-02-19T17:00:00Z',
        usageCount: 410,
      },
    ];

    for (const item of kbData) {
      this.kbItems.set(item.id, item);
    }
  }

  private seedConversations() {
    const convId = 'conv_demo_001';
    const conv: Conversation = {
      id: convId,
      userId: 'usr_dev_002',
      title: 'Understanding Python List Comprehensions & NumPy',
      createdAt: '2026-02-24T10:15:00Z',
      updatedAt: '2026-02-24T10:20:00Z',
      messageCount: 2,
    };
    this.conversations.set(convId, conv);

    const msgs: ChatMessage[] = [
      {
        id: 'msg_001',
        conversationId: convId,
        role: 'user',
        content: 'How do list comprehensions compare to traditional loops in Python?',
        timestamp: '2026-02-24T10:15:00Z',
      },
      {
        id: 'msg_002',
        conversationId: convId,
        role: 'assistant',
        content: 'List comprehensions provide a concise and Pythonic syntax to construct lists. Under the hood in CPython, list comprehensions execute at C-level loop speed because the bytecode uses the specialized `LIST_APPEND` opcode, avoiding repeated function call overhead of `list.append()`.',
        codeSnippet: `# Standard Loop
squares = []
for x in range(10):
    if x % 2 == 0:
        squares.append(x ** 2)

# Pythonic List Comprehension
fast_squares = [x ** 2 for x in range(10) if x % 2 == 0]
print("Computed even squares:", fast_squares)
`,
        category: 'Loops',
        confidence: 0.94,
        modelUsed: 'PyBot TF-IDF + Boosted Classifier',
        source: 'knowledge_base',
        matchedKbItem: {
          id: 'kb_loop_02',
          title: 'List Comprehensions vs Standard Loops',
          category: 'Loops',
        },
        timestamp: '2026-02-24T10:15:02Z',
      },
    ];
    this.messages.set(convId, msgs);
  }

  private seedInvoices() {
    const inv1: Invoice = {
      id: 'inv_882910',
      userId: 'usr_dev_002',
      plan: 'pro',
      amountUSD: 19,
      amountINR: 1499,
      currency: 'USD',
      status: 'paid',
      date: '2026-02-01T14:35:00Z',
      paymentMethod: 'Razorpay UPI (•••• 8492)',
      transactionId: 'pay_rzp_live_99812401',
      invoiceUrl: '#',
    };
    this.invoices.set(inv1.id, inv1);
  }

  private seedQueryLogs() {
    const categories = ['Functions', 'Loops', 'Lists', 'NumPy', 'Pandas', 'OOP', 'Exception Handling'];
    const now = Date.now();
    for (let i = 0; i < 40; i++) {
      const pastTime = new Date(now - (39 - i) * 6 * 3600 * 1000).toISOString();
      const cat = categories[i % categories.length];
      this.queryLogs.push({
        id: `log_${i}`,
        category: cat,
        timestamp: pastTime,
        latencyMs: 120 + Math.floor(Math.random() * 80),
      });
    }

    this.unanswered.push(
      {
        id: 'unans_01',
        query: 'How to deploy a PyTorch model with Triton Inference Server on Kubernetes?',
        suggestedCategory: 'Machine Learning',
        confidence: 0.42,
        timestamp: '2026-02-24T08:12:00Z',
      },
      {
        id: 'unans_02',
        query: 'What is the GIL removal in Python 3.13 free-threaded mode?',
        suggestedCategory: 'Python Introduction',
        confidence: 0.51,
        timestamp: '2026-02-24T09:40:00Z',
      }
    );
  }
}

export const db = new DatabaseStore();

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    priceMonthlyUSD: 0,
    priceMonthlyINR: 0,
    tagline: 'Ideal for Python students and curious coders starting their journey.',
    questionLimitDaily: 15,
    features: [
      '15 questions per day',
      'Standard Python Knowledge Base',
      'Basic Question Classification',
      'Browser Python 3 Sandbox (3s limit)',
      'Community Chat History (3 active threads)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Developer',
    priceMonthlyUSD: 19,
    priceMonthlyINR: 1499,
    tagline: 'For active engineers, data analysts, and professionals building real projects.',
    popular: true,
    questionLimitDaily: 150,
    features: [
      '150 questions per day',
      'Advanced ML Category Classifier',
      'Intelligent Gemini 3.8 Flash Code Synthesis',
      'Unlimited Chat History & Search',
      'Export Chats to Markdown & JSON',
      'High-priority Python 3 execution sandbox',
      'Detailed Execution Profiling & Memory Analysis',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Team',
    priceMonthlyUSD: 79,
    priceMonthlyINR: 5999,
    tagline: 'For teams, universities, and organizations requiring unlimited AI capabilities.',
    questionLimitDaily: 9999,
    features: [
      'Unlimited questions per day',
      'Custom Organization Knowledge Base additions',
      'Team Member Role-Based Access Control',
      'Dedicated ML model retraining triggers',
      'REST API tokens for internal tooling',
      'Audit logs, usage analytics & export',
      'SLA 99.9% uptime guarantee',
    ],
  },
];
