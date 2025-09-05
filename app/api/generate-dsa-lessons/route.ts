import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
// highlight-start
import { google } from "@ai-sdk/google";
// highlight-end

const DSA_LESSONS = {
  arrays: [
    {
      id: 1,
      title: "Array Declaration and Initialization",
      description: "Learn how to create and initialize arrays in different ways",
      code: `// Array Declaration and Initialization
let numbers = [1, 2, 3, 4, 5];
let fruits = ["apple", "banana", "orange"];
let mixed = [1, "hello", true, null];

console.log("Numbers:", numbers);
console.log("First fruit:", fruits[0]);
console.log("Array length:", numbers.length);`,
      explanation:
        "Arrays are ordered collections of elements. In JavaScript, arrays can hold different data types and are zero-indexed.",
      objectives: [
        "Understand array syntax and structure",
        "Learn different ways to initialize arrays",
        "Practice accessing array elements by index",
      ],
      keyPoints: [
        "Arrays use square brackets [] for declaration",
        "Array indices start from 0",
        "Use .length property to get array size",
        "Arrays can store mixed data types",
      ],
      tips: [
        "Always check array bounds to avoid undefined values",
        "Use meaningful variable names for arrays (plural nouns)",
      ],
    },
    {
      id: 2,
      title: "Array Methods - Push, Pop, Shift, Unshift",
      description: "Master the basic array manipulation methods",
      code: `// Array Methods
let stack = [1, 2, 3];

// Add to end
stack.push(4);
console.log("After push:", stack);

// Remove from end
let popped = stack.pop();
console.log("Popped:", popped);
console.log("After pop:", stack);

// Add to beginning
stack.unshift(0);
console.log("After unshift:", stack);

// Remove from beginning
let shifted = stack.shift();
console.log("Shifted:", shifted);
console.log("Final array:", stack);`,
      explanation:
        "These methods allow you to add and remove elements from both ends of an array, making arrays versatile for different data structure patterns.",
      timeComplexity: "O(1) for push/pop, O(n) for shift/unshift",
      spaceComplexity: "O(1)",
      keyPoints: [
        "push() adds to the end, pop() removes from end",
        "unshift() adds to beginning, shift() removes from beginning",
        "push/pop are faster than shift/unshift",
        "These methods modify the original array",
      ],
    },
  ],
  "linked-lists": [
    {
      id: 1,
      title: "Node Structure and Basic Linked List",
      description: "Create the foundation of linked lists with node structure",
      code: `// Node class definition
class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

// Creating a simple linked list: 1 -> 2 -> 3
let head = new ListNode(1);
head.next = new ListNode(2);
head.next.next = new ListNode(3);

// Traversing the linked list
let current = head;
while (current !== null) {
    console.log(current.val);
    current = current.next;
}`,
      explanation:
        "A linked list is a linear data structure where elements are stored in nodes, and each node contains data and a reference to the next node.",
      objectives: [
        "Understand the node structure",
        "Learn how nodes connect to form a list",
        "Practice traversing a linked list",
      ],
      timeComplexity: "O(n) for traversal",
      spaceComplexity: "O(1) for traversal",
    },
  ],
  "stacks-queues": [
    {
      id: 1,
      title: "Stack Implementation using Array",
      description:
        "Implement a stack data structure with push, pop, and peek operations",
      code: `// Stack implementation
class Stack {
    constructor() {
        this.items = [];
    }
    
    push(element) {
        this.items.push(element);
    }
    
    pop() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items.pop();
    }
    
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    size() {
        return this.items.length;
    }
}

// Usage example
let stack = new Stack();
stack.push(10);
stack.push(20);
console.log("Top element:", stack.peek());
console.log("Popped:", stack.pop());`,
      explanation:
        "A stack follows the Last-In-First-Out (LIFO) principle. Elements are added and removed from the same end, called the top.",
      timeComplexity: "O(1) for all operations",
      spaceComplexity: "O(n) where n is number of elements",
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const { topicId, topicTitle } = await request.json();

    // Return predefined lessons if available
    if (DSA_LESSONS[topicId as keyof typeof DSA_LESSONS]) {
      return NextResponse.json({
        lessons: DSA_LESSONS[topicId as keyof typeof DSA_LESSONS],
      });
    }

    // Generate lessons using AI for other topics
    const prompt = `
Create 3-5 progressive coding lessons for the topic: ${topicTitle}

Each lesson should be a JSON object with:
- id: number
- title: string (specific lesson title)
- description: string (what the student will learn)
- code: string (actual code they need to type, 10-20 lines)
- explanation: string (concept explanation)
- objectives: array of learning objectives
- keyPoints: array of important points to remember
- timeComplexity: string (if applicable)
- spaceComplexity: string (if applicable)
- tips: array of helpful tips
- commonMistakes: array of common errors to avoid

Focus on practical, typeable code examples that build understanding progressively.
Make the code realistic and educational, not just toy examples.

Return as JSON: { "lessons": [...] }
`;

    // highlight-start
    const { text } = await generateText({
      model: google("models/gemini-1.5-flash-latest"),
      prompt,
      temperature: 0.3,
    });
    // highlight-end

    let lessons;
    try {
      lessons = JSON.parse(text);
    } catch (parseError) {
      // Fallback lesson
      lessons = {
        lessons: [
          {
            id: 1,
            title: `Introduction to ${topicTitle}`,
            description: `Learn the fundamentals of ${topicTitle}`,
            code: `// ${topicTitle} Example\nconsole.log("Learning ${topicTitle}");`,
            explanation: `This lesson introduces you to ${topicTitle} concepts.`,
            objectives: [`Understand ${topicTitle} basics`],
            keyPoints: [
              `${topicTitle} is an important data structure/algorithm`,
            ],
            tips: ["Practice regularly to master the concepts"],
          },
        ],
      };
    }

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("Error generating DSA lessons:", error);
    return NextResponse.json(
      { error: "Failed to generate lessons", lessons: [] },
      { status: 500 },
    );
  }
}