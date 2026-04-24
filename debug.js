const inputData = ['A->B', 'A->C', 'B->D', 'C->E', 'E->F', 'X->Y', 'Y->Z', 'Z->X', 'P->Q', 'Q->R', 'G->H', 'G->H', 'G->I', 'hello', '1->2', 'A->'];

function isValidEdge(edge) {
    edge = edge.trim();
    if (!/^[A-Z]->[A-Z]$/.test(edge)) {
        return false;
    }
    const [parent, child] = edge.split('->');
    if (parent === child) {
        return false;
    }
    return true;
}

let graph = {};
let childParent = {};
let seenEdges = new Set();
let allNodes = new Set();
let invalid_entries = [];
let duplicate_edges = [];

for (let raw of inputData) {
    let edge = raw.trim();
    if (!isValidEdge(edge)) {
        invalid_entries.push(raw);
        continue;
    }
    if (seenEdges.has(edge)) {
        if (!duplicate_edges.includes(edge)) {
            duplicate_edges.push(edge);
        }
        continue;
    }
    seenEdges.add(edge);
    let [parent, child] = edge.split('->');
    if (childParent[child]) {
        continue;
    }
    childParent[child] = parent;
    if (!graph[parent]) graph[parent] = [];
    if (!graph[child]) graph[child] = [];
    graph[parent].push(child);
    allNodes.add(parent);
    allNodes.add(child);
}

let roots = [];
for (let node of allNodes) {
    if (!childParent[node]) {
        roots.push(node);
    }
}
roots.sort();

console.log('Graph:', JSON.stringify(graph, null, 2));
console.log('Roots:', roots);
console.log('All nodes:', [...allNodes]);