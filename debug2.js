const graph = {
  "A": ["B", "C"],
  "B": ["D"],
  "C": ["E"],
  "D": [],
  "E": ["F"],
  "F": [],
  "X": ["Y"],
  "Y": ["Z"],
  "Z": ["X"],
  "P": ["Q"],
  "Q": ["R"],
  "R": [],
  "G": ["H", "I"],
  "H": [],
  "I": []
};

function detectCycle(node, graph, visiting, visited) {
    if (visiting.has(node)) {
        return true;
    }
    if (visited.has(node)) {
        return false;
    }
    visiting.add(node);
    for (let child of graph[node] || []) {
        if (detectCycle(child, graph, visiting, visited)) {
            return true;
        }
    }
    visiting.delete(node);
    visited.add(node);
    return false;
}

const allNodes = Object.keys(graph);
let cycleRoots = new Set();

for (let node of allNodes) {
    const hasCycle = detectCycle(node, graph, new Set(), new Set());
    console.log('Node:', node, 'hasCycle:', hasCycle);
    if (hasCycle) {
        cycleRoots.add(node);
    }
}

console.log('\nCycle roots:', [...cycleRoots]);