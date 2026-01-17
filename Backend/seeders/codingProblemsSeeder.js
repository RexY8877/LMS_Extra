const CodingProblem = require('../models/CodingProblem');
const TestCase = require('../models/TestCase');
const SolutionTemplate = require('../models/SolutionTemplate');

const codingProblemsData = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
    ],
    hints: [
      'Try using a hash map to store numbers you have seen.',
      'For each number, check if target - number exists in the hash map.',
    ],
    tags: ['Array', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Facebook', 'Microsoft'],
    acceptance: 48.2,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isExample: true },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isExample: true },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isExample: false },
      { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', isExample: false },
      { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]', isExample: false },
    ],
    templates: {
      python: {
        template: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your code here
    pass`,
        functionSignature: 'def twoSum(nums, target)',
      },
      javascript: {
        template: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your code here
}`,
        functionSignature: 'function twoSum(nums, target)',
      },
      java: {
        template: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[0];
    }
}`,
        functionSignature: 'public int[] twoSum(int[] nums, int target)',
      },
    },
  },
  {
    title: 'Reverse String',
    difficulty: 'Easy',
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.',
    ],
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: 'The string "hello" is reversed to "olleh".',
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: 'The string "Hannah" is reversed to "hannaH".',
      },
    ],
    hints: [
      'Use two pointers, one at the start and one at the end.',
      'Swap characters and move pointers towards the center.',
    ],
    tags: ['Two Pointers', 'String'],
    companies: ['Amazon', 'Microsoft', 'Apple'],
    acceptance: 75.8,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isExample: true },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', isExample: true },
      { input: '["a"]', expectedOutput: '["a"]', isExample: false },
      { input: '["a","b"]', expectedOutput: '["b","a"]', isExample: false },
    ],
    templates: {
      python: {
        template: `def reverseString(s):
    """
    :type s: List[str]
    :rtype: None Do not return anything, modify s in-place instead.
    """
    # Write your code here
    pass`,
        functionSignature: 'def reverseString(s)',
      },
      javascript: {
        template: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
function reverseString(s) {
    // Write your code here
}`,
        functionSignature: 'function reverseString(s)',
      },
      java: {
        template: `class Solution {
    public void reverseString(char[] s) {
        // Write your code here
    }
}`,
        functionSignature: 'public void reverseString(char[] s)',
      },
    },
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\'.',
    ],
    examples: [
      {
        input: 's = "()"',
        output: 'true',
        explanation: 'The string contains valid parentheses.',
      },
      {
        input: 's = "()[]{}"',
        output: 'true',
        explanation: 'All brackets are properly closed.',
      },
      {
        input: 's = "(]"',
        output: 'false',
        explanation: 'Mismatched bracket types.',
      },
    ],
    hints: [
      'Use a stack to keep track of opening brackets.',
      'When you encounter a closing bracket, check if it matches the top of the stack.',
    ],
    tags: ['String', 'Stack'],
    companies: ['Google', 'Amazon', 'Facebook', 'Bloomberg'],
    acceptance: 40.7,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '()', expectedOutput: 'true', isExample: true },
      { input: '()[]{}', expectedOutput: 'true', isExample: true },
      { input: '(]', expectedOutput: 'false', isExample: true },
      { input: '([)]', expectedOutput: 'false', isExample: false },
      { input: '{[]}', expectedOutput: 'true', isExample: false },
      { input: '', expectedOutput: 'true', isExample: false },
    ],
    templates: {
      python: {
        template: `def isValid(s):
    """
    :type s: str
    :rtype: bool
    """
    # Write your code here
    pass`,
        functionSignature: 'def isValid(s)',
      },
      javascript: {
        template: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Write your code here
}`,
        functionSignature: 'function isValid(s)',
      },
      java: {
        template: `class Solution {
    public boolean isValid(String s) {
        // Write your code here
        return false;
    }
}`,
        functionSignature: 'public boolean isValid(String s)',
      },
    },
  },
  {
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.',
      },
      {
        input: 'nums = [5,4,-1,7,8]',
        output: '23',
        explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.',
      },
    ],
    hints: [
      'Try using dynamic programming or Kadane\'s algorithm.',
      'Keep track of the maximum sum ending at each position.',
    ],
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    companies: ['Amazon', 'Microsoft', 'LinkedIn', 'Apple'],
    acceptance: 49.5,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isExample: true },
      { input: '[1]', expectedOutput: '1', isExample: true },
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isExample: true },
      { input: '[-1]', expectedOutput: '-1', isExample: false },
      { input: '[-2,-1]', expectedOutput: '-1', isExample: false },
    ],
    templates: {
      python: {
        template: `def maxSubArray(nums):
    """
    :type nums: List[int]
    :rtype: int
    """
    # Write your code here
    pass`,
        functionSignature: 'def maxSubArray(nums)',
      },
      javascript: {
        template: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Write your code here
}`,
        functionSignature: 'function maxSubArray(nums)',
      },
      java: {
        template: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your code here
        return 0;
    }
}`,
        functionSignature: 'public int maxSubArray(int[] nums)',
      },
    },
  },
  {
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    constraints: [
      'The number of nodes in both lists is in the range [0, 50].',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order.',
    ],
    examples: [
      {
        input: 'list1 = [1,2,4], list2 = [1,3,4]',
        output: '[1,1,2,3,4,4]',
        explanation: 'Merge the two sorted lists.',
      },
      {
        input: 'list1 = [], list2 = []',
        output: '[]',
        explanation: 'Both lists are empty.',
      },
      {
        input: 'list1 = [], list2 = [0]',
        output: '[0]',
        explanation: 'One list is empty.',
      },
    ],
    hints: [
      'Use a dummy node to simplify the merge process.',
      'Compare the values of the current nodes and attach the smaller one.',
    ],
    tags: ['Linked List', 'Recursion'],
    companies: ['Amazon', 'Microsoft', 'Apple', 'Adobe'],
    acceptance: 61.3,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isExample: true },
      { input: '[]\n[]', expectedOutput: '[]', isExample: true },
      { input: '[]\n[0]', expectedOutput: '[0]', isExample: true },
      { input: '[1]\n[2]', expectedOutput: '[1,2]', isExample: false },
      { input: '[2]\n[1]', expectedOutput: '[1,2]', isExample: false },
    ],
    templates: {
      python: {
        template: `# Definition for singly-linked list.
# class ListNode(object):
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def mergeTwoLists(list1, list2):
    """
    :type list1: Optional[ListNode]
    :type list2: Optional[ListNode]
    :rtype: Optional[ListNode]
    """
    # Write your code here
    pass`,
        functionSignature: 'def mergeTwoLists(list1, list2)',
      },
      javascript: {
        template: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
    // Write your code here
}`,
        functionSignature: 'function mergeTwoLists(list1, list2)',
      },
      java: {
        template: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your code here
        return null;
    }
}`,
        functionSignature: 'public ListNode mergeTwoLists(ListNode list1, ListNode list2)',
      },
    },
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    description: `Given a string s, find the length of the longest substring without repeating characters.

A substring is a contiguous non-empty sequence of characters within a string.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    hints: [
      'Use a sliding window approach with two pointers.',
      'Keep track of characters in the current window using a hash set.',
    ],
    tags: ['String', 'Hash Table', 'Sliding Window'],
    companies: ['Amazon', 'Bloomberg', 'Adobe', 'Facebook'],
    acceptance: 33.8,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3', isExample: true },
      { input: 'bbbbb', expectedOutput: '1', isExample: true },
      { input: 'pwwkew', expectedOutput: '3', isExample: true },
      { input: '', expectedOutput: '0', isExample: false },
      { input: 'au', expectedOutput: '2', isExample: false },
      { input: 'dvdf', expectedOutput: '3', isExample: false },
    ],
    templates: {
      python: {
        template: `def lengthOfLongestSubstring(s):
    """
    :type s: str
    :rtype: int
    """
    # Write your code here
    pass`,
        functionSignature: 'def lengthOfLongestSubstring(s)',
      },
      javascript: {
        template: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
    // Write your code here
}`,
        functionSignature: 'function lengthOfLongestSubstring(s)',
      },
      java: {
        template: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your code here
        return 0;
    }
}`,
        functionSignature: 'public int lengthOfLongestSubstring(String s)',
      },
    },
  },
  {
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    description: `Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).`,
    constraints: [
      'The number of nodes in the tree is in the range [0, 2000].',
      '-1000 <= Node.val <= 1000',
    ],
    examples: [
      {
        input: 'root = [3,9,20,null,null,15,7]',
        output: '[[3],[9,20],[15,7]]',
        explanation: 'Level order traversal of the tree.',
      },
      {
        input: 'root = [1]',
        output: '[[1]]',
        explanation: 'Single node tree.',
      },
      {
        input: 'root = []',
        output: '[]',
        explanation: 'Empty tree.',
      },
    ],
    hints: [
      'Use a queue to perform breadth-first search.',
      'Process nodes level by level.',
    ],
    tags: ['Tree', 'Breadth-First Search', 'Binary Tree'],
    companies: ['Microsoft', 'Apple', 'Amazon', 'Facebook'],
    acceptance: 62.5,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', isExample: true },
      { input: '[1]', expectedOutput: '[[1]]', isExample: true },
      { input: '[]', expectedOutput: '[]', isExample: true },
      { input: '[1,2,3,4,5]', expectedOutput: '[[1],[2,3],[4,5]]', isExample: false },
    ],
    templates: {
      python: {
        template: `# Definition for a binary tree node.
# class TreeNode(object):
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right

def levelOrder(root):
    """
    :type root: TreeNode
    :rtype: List[List[int]]
    """
    # Write your code here
    pass`,
        functionSignature: 'def levelOrder(root)',
      },
      javascript: {
        template: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
function levelOrder(root) {
    // Write your code here
}`,
        functionSignature: 'function levelOrder(root)',
      },
      java: {
        template: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        // Write your code here
        return new ArrayList<>();
    }
}`,
        functionSignature: 'public List<List<Integer>> levelOrder(TreeNode root)',
      },
    },
  },
  {
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    constraints: [
      '1 <= n <= 45',
    ],
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: 'There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps',
      },
      {
        input: 'n = 3',
        output: '3',
        explanation: 'There are three ways: 1. 1+1+1, 2. 1+2, 3. 2+1',
      },
    ],
    hints: [
      'This is a Fibonacci sequence problem.',
      'Use dynamic programming to avoid recalculating subproblems.',
    ],
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    companies: ['Amazon', 'Google', 'Adobe'],
    acceptance: 51.2,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '2', expectedOutput: '2', isExample: true },
      { input: '3', expectedOutput: '3', isExample: true },
      { input: '1', expectedOutput: '1', isExample: false },
      { input: '4', expectedOutput: '5', isExample: false },
      { input: '5', expectedOutput: '8', isExample: false },
    ],
    templates: {
      python: {
        template: `def climbStairs(n):
    """
    :type n: int
    :rtype: int
    """
    # Write your code here
    pass`,
        functionSignature: 'def climbStairs(n)',
      },
      javascript: {
        template: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    // Write your code here
}`,
        functionSignature: 'function climbStairs(n)',
      },
      java: {
        template: `class Solution {
    public int climbStairs(int n) {
        // Write your code here
        return 0;
    }
}`,
        functionSignature: 'public int climbStairs(int n)',
      },
    },
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4',
    ],
    examples: [
      {
        input: 'prices = [7,1,5,3,6,4]',
        output: '5',
        explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.',
      },
      {
        input: 'prices = [7,6,4,3,1]',
        output: '0',
        explanation: 'No transactions are done and the max profit = 0.',
      },
    ],
    hints: [
      'Keep track of the minimum price seen so far.',
      'Calculate profit at each step and update maximum profit.',
    ],
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Facebook', 'Microsoft', 'Bloomberg'],
    acceptance: 54.1,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5', isExample: true },
      { input: '[7,6,4,3,1]', expectedOutput: '0', isExample: true },
      { input: '[1,2]', expectedOutput: '1', isExample: false },
      { input: '[2,4,1]', expectedOutput: '2', isExample: false },
    ],
    templates: {
      python: {
        template: `def maxProfit(prices):
    """
    :type prices: List[int]
    :rtype: int
    """
    # Write your code here
    pass`,
        functionSignature: 'def maxProfit(prices)',
      },
      javascript: {
        template: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    // Write your code here
}`,
        functionSignature: 'function maxProfit(prices)',
      },
      java: {
        template: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your code here
        return 0;
    }
}`,
        functionSignature: 'public int maxProfit(int[] prices)',
      },
    },
  },
  {
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    description: `Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
    ],
    examples: [
      {
        input: 'nums = [1,2,3,1]',
        output: 'true',
        explanation: 'The element 1 appears twice.',
      },
      {
        input: 'nums = [1,2,3,4]',
        output: 'false',
        explanation: 'All elements are distinct.',
      },
      {
        input: 'nums = [1,1,1,3,3,4,3,2,4,2]',
        output: 'true',
        explanation: 'Multiple duplicates exist.',
      },
    ],
    hints: [
      'Use a hash set to track seen numbers.',
      'If you encounter a number already in the set, return true.',
    ],
    tags: ['Array', 'Hash Table', 'Sorting'],
    companies: ['Amazon', 'Apple', 'Adobe'],
    acceptance: 60.8,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: 'true', isExample: true },
      { input: '[1,2,3,4]', expectedOutput: 'false', isExample: true },
      { input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true', isExample: true },
      { input: '[1]', expectedOutput: 'false', isExample: false },
    ],
    templates: {
      python: {
        template: `def containsDuplicate(nums):
    """
    :type nums: List[int]
    :rtype: bool
    """
    # Write your code here
    pass`,
        functionSignature: 'def containsDuplicate(nums)',
      },
      javascript: {
        template: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
    // Write your code here
}`,
        functionSignature: 'function containsDuplicate(nums)',
      },
      java: {
        template: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        // Write your code here
        return false;
    }
}`,
        functionSignature: 'public boolean containsDuplicate(int[] nums)',
      },
    },
  },
  {
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    description: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.`,
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30',
      'The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.',
    ],
    examples: [
      {
        input: 'nums = [1,2,3,4]',
        output: '[24,12,8,6]',
        explanation: 'answer[0] = 2*3*4 = 24, answer[1] = 1*3*4 = 12, etc.',
      },
      {
        input: 'nums = [-1,1,0,-3,3]',
        output: '[0,0,9,0,0]',
        explanation: 'Product calculations with zero.',
      },
    ],
    hints: [
      'Calculate prefix products from left to right.',
      'Calculate suffix products from right to left.',
      'Combine prefix and suffix products.',
    ],
    tags: ['Array', 'Prefix Sum'],
    companies: ['Amazon', 'Facebook', 'Microsoft', 'Apple'],
    acceptance: 64.2,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]', isExample: true },
      { input: '[-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]', isExample: true },
      { input: '[1,2]', expectedOutput: '[2,1]', isExample: false },
      { input: '[2,3,4,5]', expectedOutput: '[60,40,30,24]', isExample: false },
    ],
    templates: {
      python: {
        template: `def productExceptSelf(nums):
    """
    :type nums: List[int]
    :rtype: List[int]
    """
    # Write your code here
    pass`,
        functionSignature: 'def productExceptSelf(nums)',
      },
      javascript: {
        template: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
    // Write your code here
}`,
        functionSignature: 'function productExceptSelf(nums)',
      },
      java: {
        template: `class Solution {
    public int[] productExceptSelf(int[] nums) {
        // Write your code here
        return new int[0];
    }
}`,
        functionSignature: 'public int[] productExceptSelf(int[] nums)',
      },
    },
  },
  {
    title: 'Merge Intervals',
    difficulty: 'Medium',
    description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= starti <= endi <= 10^4',
    ],
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Intervals [1,3] and [2,6] overlap, so merge them into [1,6].',
      },
      {
        input: 'intervals = [[1,4],[4,5]]',
        output: '[[1,5]]',
        explanation: 'Intervals [1,4] and [4,5] are considered overlapping.',
      },
    ],
    hints: [
      'Sort the intervals by start time.',
      'Iterate through and merge overlapping intervals.',
    ],
    tags: ['Array', 'Sorting'],
    companies: ['Facebook', 'Google', 'Amazon', 'Microsoft'],
    acceptance: 45.7,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]', isExample: true },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]', isExample: true },
      { input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]', isExample: false },
      { input: '[[1,4],[2,3]]', expectedOutput: '[[1,4]]', isExample: false },
    ],
    templates: {
      python: {
        template: `def merge(intervals):
    """
    :type intervals: List[List[int]]
    :rtype: List[List[int]]
    """
    # Write your code here
    pass`,
        functionSignature: 'def merge(intervals)',
      },
      javascript: {
        template: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
    // Write your code here
}`,
        functionSignature: 'function merge(intervals)',
      },
      java: {
        template: `class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your code here
        return new int[0][0];
    }
}`,
        functionSignature: 'public int[][] merge(int[][] intervals)',
      },
    },
  },
  {
    title: 'Palindrome Number',
    difficulty: 'Easy',
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same backward as forward.`,
    constraints: [
      '-2^31 <= x <= 2^31 - 1',
    ],
    examples: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.',
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-.',
      },
      {
        input: 'x = 10',
        output: 'false',
        explanation: 'Reads 01 from right to left.',
      },
    ],
    hints: [
      'Negative numbers are not palindromes.',
      'You can reverse the number and compare it with the original.',
    ],
    tags: ['Math'],
    companies: ['Amazon', 'Apple', 'Adobe'],
    acceptance: 52.9,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [
      { input: '121', expectedOutput: 'true', isExample: true },
      { input: '-121', expectedOutput: 'false', isExample: true },
      { input: '10', expectedOutput: 'false', isExample: true },
      { input: '0', expectedOutput: 'true', isExample: false },
      { input: '12321', expectedOutput: 'true', isExample: false },
    ],
    templates: {
      python: {
        template: `def isPalindrome(x):
    """
    :type x: int
    :rtype: bool
    """
    # Write your code here
    pass`,
        functionSignature: 'def isPalindrome(x)',
      },
      javascript: {
        template: `/**
 * @param {number} x
 * @return {boolean}
 */
function isPalindrome(x) {
    // Write your code here
}`,
        functionSignature: 'function isPalindrome(x)',
      },
      java: {
        template: `class Solution {
    public boolean isPalindrome(int x) {
        // Write your code here
        return false;
    }
}`,
        functionSignature: 'public boolean isPalindrome(int x)',
      },
    },
  },
  {
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    description: `You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.`,
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4',
      'lists[i] is sorted in ascending order.',
      'The sum of lists[i].length will not exceed 10^4.',
    ],
    examples: [
      {
        input: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        output: '[1,1,2,3,4,4,5,6]',
        explanation: 'Merge all k sorted lists.',
      },
      {
        input: 'lists = []',
        output: '[]',
        explanation: 'Empty input.',
      },
      {
        input: 'lists = [[]]',
        output: '[]',
        explanation: 'Single empty list.',
      },
    ],
    hints: [
      'Use a min heap to efficiently get the smallest element.',
      'Alternatively, use divide and conquer to merge pairs of lists.',
    ],
    tags: ['Linked List', 'Divide and Conquer', 'Heap', 'Merge Sort'],
    companies: ['Facebook', 'Microsoft', 'Amazon', 'Google'],
    acceptance: 47.4,
    timeLimit: 3000,
    memoryLimit: 256,
    testCases: [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', isExample: true },
      { input: '[]', expectedOutput: '[]', isExample: true },
      { input: '[[]]', expectedOutput: '[]', isExample: true },
      { input: '[[1],[2],[3]]', expectedOutput: '[1,2,3]', isExample: false },
    ],
    templates: {
      python: {
        template: `# Definition for singly-linked list.
# class ListNode(object):
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def mergeKLists(lists):
    """
    :type lists: List[ListNode]
    :rtype: ListNode
    """
    # Write your code here
    pass`,
        functionSignature: 'def mergeKLists(lists)',
      },
      javascript: {
        template: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
function mergeKLists(lists) {
    // Write your code here
}`,
        functionSignature: 'function mergeKLists(lists)',
      },
      java: {
        template: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        // Write your code here
        return null;
    }
}`,
        functionSignature: 'public ListNode mergeKLists(ListNode[] lists)',
      },
    },
  },
];

const seedCodingProblems = async () => {
  try {
    console.log('Seeding coding problems...');
    
    for (const problemData of codingProblemsData) {
      // Create the problem
      const problem = await CodingProblem.create({
        title: problemData.title,
        difficulty: problemData.difficulty,
        description: problemData.description,
        constraints: problemData.constraints,
        examples: problemData.examples,
        hints: problemData.hints,
        tags: problemData.tags,
        companies: problemData.companies,
        acceptance: problemData.acceptance,
        timeLimit: problemData.timeLimit,
        memoryLimit: problemData.memoryLimit,
      });

      console.log(`Created problem: ${problem.title}`);

      // Create test cases
      for (const testCase of problemData.testCases) {
        await TestCase.create({
          problemId: problem.id,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          isExample: testCase.isExample,
          weight: 1.0,
        });
      }

      console.log(`  - Created ${problemData.testCases.length} test cases`);

      // Create solution templates
      for (const [language, templateData] of Object.entries(problemData.templates)) {
        await SolutionTemplate.create({
          problemId: problem.id,
          language,
          template: templateData.template,
          functionSignature: templateData.functionSignature,
        });
      }

      console.log(`  - Created templates for Python, JavaScript, Java`);
    }

    console.log(`\nSuccessfully seeded ${codingProblemsData.length} coding problems!`);
  } catch (error) {
    console.error('Error seeding coding problems:', error);
    throw error;
  }
};

module.exports = seedCodingProblems;
