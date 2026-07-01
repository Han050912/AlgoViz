export interface Template {
  key: string;
  label: string;
  defaultLanguage: string;
  codes: Record<string, string>;
}

// 多语言模板代码：每个模板包含 python / javascript / java / cpp / go 五个语言版本
export const templates: Template[] = [
  {
    key: "bubble-sort",
    label: "Bubble Sort",
    defaultLanguage: "python",
    codes: {
      python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

arr = [64, 34, 25, 12, 22, 11, 90]
print(bubble_sort(arr))`,
      javascript: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

const arr = [64, 34, 25, 12, 22, 11, 90];
console.log(bubbleSort(arr));`,
      java: `public class Main {
    public static int[] bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        int[] sorted = bubbleSort(arr);
        for (int num : sorted) System.out.print(num + " ");
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> bubbleSort(vector<int> arr) {
    int n = arr.size();
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
    return arr;
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    vector<int> sorted = bubbleSort(arr);
    for (int num : sorted) cout << num << " ";
    return 0;
}`,
      go: `package main

import "fmt"

func bubbleSort(arr []int) []int {
    n := len(arr)
    for i := 0; i < n; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
    return arr
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    fmt.Println(bubbleSort(arr))
}`,
    },
  },
  {
    key: "quick-sort",
    label: "Quick Sort",
    defaultLanguage: "python",
    codes: {
      python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

arr = [64, 34, 25, 12, 22, 11, 90]
print(quick_sort(arr))`,
      javascript: `function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    return [...quickSort(left), ...middle, ...quickSort(right)];
}

const arr = [64, 34, 25, 12, 22, 11, 90];
console.log(quickSort(arr));`,
      java: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static List<Integer> quickSort(List<Integer> arr) {
        if (arr.size() <= 1) return arr;
        int pivot = arr.get(arr.size() / 2);
        List<Integer> left = arr.stream().filter(x -> x < pivot).collect(Collectors.toList());
        List<Integer> middle = arr.stream().filter(x -> x == pivot).collect(Collectors.toList());
        List<Integer> right = arr.stream().filter(x -> x > pivot).collect(Collectors.toList());
        List<Integer> result = new ArrayList<>(quickSort(left));
        result.addAll(middle);
        result.addAll(quickSort(right));
        return result;
    }

    public static void main(String[] args) {
        List<Integer> arr = Arrays.asList(64, 34, 25, 12, 22, 11, 90);
        System.out.println(quickSort(arr));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> quickSort(vector<int> arr) {
    if (arr.size() <= 1) return arr;
    int pivot = arr[arr.size() / 2];
    vector<int> left, middle, right;
    for (int x : arr) {
        if (x < pivot) left.push_back(x);
        else if (x == pivot) middle.push_back(x);
        else right.push_back(x);
    }
    vector<int> sorted = quickSort(left);
    sorted.insert(sorted.end(), middle.begin(), middle.end());
    vector<int> rightSorted = quickSort(right);
    sorted.insert(sorted.end(), rightSorted.begin(), rightSorted.end());
    return sorted;
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    vector<int> sorted = quickSort(arr);
    for (int num : sorted) cout << num << " ";
    return 0;
}`,
      go: `package main

import "fmt"

func quickSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    pivot := arr[len(arr)/2]
    var left, middle, right []int
    for _, x := range arr {
        if x < pivot {
            left = append(left, x)
        } else if x == pivot {
            middle = append(middle, x)
        } else {
            right = append(right, x)
        }
    }
    result := append(quickSort(left), middle...)
    result = append(result, quickSort(right)...)
    return result
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    fmt.Println(quickSort(arr))
}`,
    },
  },
  {
    key: "binary-search",
    label: "Binary Search",
    defaultLanguage: "python",
    codes: {
      python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

arr = [1, 3, 5, 7, 9, 11, 13]
print(binary_search(arr, 7))`,
      javascript: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

const arr = [1, 3, 5, 7, 9, 11, 13];
console.log(binarySearch(arr, 7));`,
      java: `public class Main {
    public static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = (left + right) / 2;
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11, 13};
        System.out.println(binarySearch(arr, 7));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> arr = {1, 3, 5, 7, 9, 11, 13};
    cout << binarySearch(arr, 7) << endl;
    return 0;
}`,
      go: `package main

import "fmt"

func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := (left + right) / 2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}

func main() {
    arr := []int{1, 3, 5, 7, 9, 11, 13}
    fmt.Println(binarySearch(arr, 7))
}`,
    },
  },
  {
    key: "merge-sort",
    label: "Merge Sort",
    defaultLanguage: "python",
    codes: {
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

arr = [64, 34, 25, 12, 22, 11, 90]
print(merge_sort(arr))`,
      javascript: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return [...result, ...left.slice(i), ...right.slice(j)];
}

const arr = [64, 34, 25, 12, 22, 11, 90];
console.log(mergeSort(arr));`,
      java: `import java.util.*;

public class Main {
    public static int[] mergeSort(int[] arr) {
        if (arr.length <= 1) return arr;
        int mid = arr.length / 2;
        int[] left = mergeSort(Arrays.copyOfRange(arr, 0, mid));
        int[] right = mergeSort(Arrays.copyOfRange(arr, mid, arr.length));
        return merge(left, right);
    }

    public static int[] merge(int[] left, int[] right) {
        int[] result = new int[left.length + right.length];
        int i = 0, j = 0, k = 0;
        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) result[k++] = left[i++];
            else result[k++] = right[j++];
        }
        while (i < left.length) result[k++] = left[i++];
        while (j < right.length) result[k++] = right[j++];
        return result;
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        int[] sorted = mergeSort(arr);
        for (int num : sorted) System.out.print(num + " ");
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> merge(vector<int>& left, vector<int>& right) {
    vector<int> result;
    int i = 0, j = 0;
    while (i < left.size() && j < right.size()) {
        if (left[i] < right[j]) result.push_back(left[i++]);
        else result.push_back(right[j++]);
    }
    while (i < left.size()) result.push_back(left[i++]);
    while (j < right.size()) result.push_back(right[j++]);
    return result;
}

vector<int> mergeSort(vector<int> arr) {
    if (arr.size() <= 1) return arr;
    int mid = arr.size() / 2;
    vector<int> left(arr.begin(), arr.begin() + mid);
    vector<int> right(arr.begin() + mid, arr.end());
    left = mergeSort(left);
    right = mergeSort(right);
    return merge(left, right);
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    vector<int> sorted = mergeSort(arr);
    for (int num : sorted) cout << num << " ";
    return 0;
}`,
      go: `package main

import "fmt"

func merge(left, right []int) []int {
    result := make([]int, 0, len(left)+len(right))
    i, j := 0, 0
    for i < len(left) && j < len(right) {
        if left[i] < right[j] {
            result = append(result, left[i])
            i++
        } else {
            result = append(result, right[j])
            j++
        }
    }
    result = append(result, left[i:]...)
    result = append(result, right[j:]...)
    return result
}

func mergeSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    mid := len(arr) / 2
    left := mergeSort(arr[:mid])
    right := mergeSort(arr[mid:])
    return merge(left, right)
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    fmt.Println(mergeSort(arr))
}`,
    },
  },
  {
    key: "dfs",
    label: "DFS Traversal",
    defaultLanguage: "python",
    codes: {
      python: `def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    print(start, end=" ")
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited

graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"]
}
dfs(graph, "A")`,
      javascript: `function dfs(graph, start, visited = new Set()) {
    visited.add(start);
    process.stdout.write(start + " ");
    for (const neighbor of graph[start]) {
        if (!visited.has(neighbor)) {
            dfs(graph, neighbor, visited);
        }
    }
    return visited;
}

const graph = {
    A: ["B", "C"],
    B: ["A", "D", "E"],
    C: ["A", "F"],
    D: ["B"],
    E: ["B", "F"],
    F: ["C", "E"]
};
dfs(graph, "A");`,
      java: `import java.util.*;

public class Main {
    public static void dfs(Map<String, List<String>> graph, String start, Set<String> visited) {
        visited.add(start);
        System.out.print(start + " ");
        for (String neighbor : graph.get(start)) {
            if (!visited.contains(neighbor)) {
                dfs(graph, neighbor, visited);
            }
        }
    }

    public static void main(String[] args) {
        Map<String, List<String>> graph = new HashMap<>();
        graph.put("A", Arrays.asList("B", "C"));
        graph.put("B", Arrays.asList("A", "D", "E"));
        graph.put("C", Arrays.asList("A", "F"));
        graph.put("D", Arrays.asList("B"));
        graph.put("E", Arrays.asList("B", "F"));
        graph.put("F", Arrays.asList("C", "E"));
        dfs(graph, "A", new HashSet<>());
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <string>
using namespace std;

void dfs(unordered_map<string, vector<string>>& graph, const string& start, unordered_set<string>& visited) {
    visited.insert(start);
    cout << start << " ";
    for (const string& neighbor : graph[start]) {
        if (visited.find(neighbor) == visited.end()) {
            dfs(graph, neighbor, visited);
        }
    }
}

int main() {
    unordered_map<string, vector<string>> graph = {
        {"A", {"B", "C"}},
        {"B", {"A", "D", "E"}},
        {"C", {"A", "F"}},
        {"D", {"B"}},
        {"E", {"B", "F"}},
        {"F", {"C", "E"}}
    };
    unordered_set<string> visited;
    dfs(graph, "A", visited);
    return 0;
}`,
      go: `package main

import "fmt"

func dfs(graph map[string][]string, start string, visited map[string]bool) {
    visited[start] = true
    fmt.Print(start + " ")
    for _, neighbor := range graph[start] {
        if !visited[neighbor] {
            dfs(graph, neighbor, visited)
        }
    }
}

func main() {
    graph := map[string][]string{
        "A": {"B", "C"},
        "B": {"A", "D", "E"},
        "C": {"A", "F"},
        "D": {"B"},
        "E": {"B", "F"},
        "F": {"C", "E"},
    }
    dfs(graph, "A", make(map[string]bool))
}`,
    },
  },
  {
    key: "bfs",
    label: "BFS Traversal",
    defaultLanguage: "python",
    codes: {
      python: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
    while queue:
        vertex = queue.popleft()
        print(vertex, end=" ")
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

graph = {
    "A": ["B", "C"],
    "B": ["A", "D", "E"],
    "C": ["A", "F"],
    "D": ["B"],
    "E": ["B", "F"],
    "F": ["C", "E"]
}
bfs(graph, "A")`,
      javascript: `function bfs(graph, start) {
    const visited = new Set();
    const queue = [start];
    visited.add(start);
    while (queue.length > 0) {
        const vertex = queue.shift();
        process.stdout.write(vertex + " ");
        for (const neighbor of graph[vertex]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
}

const graph = {
    A: ["B", "C"],
    B: ["A", "D", "E"],
    C: ["A", "F"],
    D: ["B"],
    E: ["B", "F"],
    F: ["C", "E"]
};
bfs(graph, "A");`,
      java: `import java.util.*;

public class Main {
    public static void bfs(Map<String, List<String>> graph, String start) {
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();
        queue.add(start);
        visited.add(start);
        while (!queue.isEmpty()) {
            String vertex = queue.poll();
            System.out.print(vertex + " ");
            for (String neighbor : graph.get(vertex)) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.add(neighbor);
                }
            }
        }
    }

    public static void main(String[] args) {
        Map<String, List<String>> graph = new HashMap<>();
        graph.put("A", Arrays.asList("B", "C"));
        graph.put("B", Arrays.asList("A", "D", "E"));
        graph.put("C", Arrays.asList("A", "F"));
        graph.put("D", Arrays.asList("B"));
        graph.put("E", Arrays.asList("B", "F"));
        graph.put("F", Arrays.asList("C", "E"));
        bfs(graph, "A");
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <string>
using namespace std;

void bfs(unordered_map<string, vector<string>>& graph, const string& start) {
    unordered_set<string> visited;
    queue<string> q;
    q.push(start);
    visited.insert(start);
    while (!q.empty()) {
        string vertex = q.front();
        q.pop();
        cout << vertex << " ";
        for (const string& neighbor : graph[vertex]) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
    }
}

int main() {
    unordered_map<string, vector<string>> graph = {
        {"A", {"B", "C"}},
        {"B", {"A", "D", "E"}},
        {"C", {"A", "F"}},
        {"D", {"B"}},
        {"E", {"B", "F"}},
        {"F", {"C", "E"}}
    };
    bfs(graph, "A");
    return 0;
}`,
      go: `package main

import "fmt"

func bfs(graph map[string][]string, start string) {
    visited := make(map[string]bool)
    queue := []string{start}
    visited[start] = true
    for len(queue) > 0 {
        vertex := queue[0]
        queue = queue[1:]
        fmt.Print(vertex + " ")
        for _, neighbor := range graph[vertex] {
            if !visited[neighbor] {
                visited[neighbor] = true
                queue = append(queue, neighbor)
            }
        }
    }
}

func main() {
    graph := map[string][]string{
        "A": {"B", "C"},
        "B": {"A", "D", "E"},
        "C": {"A", "F"},
        "D": {"B"},
        "E": {"B", "F"},
        "F": {"C", "E"},
    }
    bfs(graph, "A")
}`,
    },
  },
];

// 获取模板在指定语言下的代码，无匹配时回退到 Python
export function getTemplateCode(template: Template, language: string): string {
  return template.codes[language] ?? template.codes[template.defaultLanguage] ?? "";
}

// 检查模板是否支持某个语言
export function templateSupportsLanguage(template: Template, language: string): boolean {
  return language in template.codes;
}
