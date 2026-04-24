const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const FULL_NAME = "piyushraj";
const DOB = "25112004";
const EMAIL = "pr2585@srmist.edu.in";
const ROLL_NUMBER = "RA2311003010005";

function isValidEdge(edge) {
    edge = edge.trim();

    if (!/^[A-Z]->[A-Z]$/.test(edge)) {
        return false;
    }

    const [parent, child] = edge.split("->");

    if (parent === child) {
        return false; 
    }

    return true;
}

function buildTree(root, graph, visited = new Set()) {
    if (visited.has(root)) {
        return {};
    }

    visited.add(root);

    let result = {};

    for (let child of graph[root] || []) {
        result[child] = buildTree(child, graph, new Set(visited));
    }

    return result;
}

function getDepth(node, graph) {
    const children = graph[node] || [];

    if (children.length === 0) {
        return 1;
    }

    let maxDepth = 0;

    for (let child of children) {
        maxDepth = Math.max(maxDepth, getDepth(child, graph));
    }

    return maxDepth + 1;
}

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

app.post("/bfhl", (req, res) => {
    console.log("=== Received request ===");
    console.log("Body:", JSON.stringify(req.body));
    const inputData = req.body.data || [];
    console.log("Input data:", inputData);

    let invalid_entries = [];
    let duplicate_edges = [];

    let graph = {};
    let childParent = {};
    let seenEdges = new Set();
    let allNodes = new Set();

    for (let raw of inputData) {
        let edge = raw.trim();

        if (!isValidEdge(edge)) {
            invalid_entries.push(raw);
            continue;
        }

        let isDuplicate = seenEdges.has(edge);
        if (isDuplicate) {
            if (!duplicate_edges.includes(edge)) {
                duplicate_edges.push(edge);
            }
            continue;
        }

        seenEdges.add(edge);

        let [parent, child] = edge.split("->");

        if (childParent[child]) {
            continue;
        }

        childParent[child] = parent;

        if (!graph[parent]) {
            graph[parent] = [];
        }

        if (!graph[child]) {
            graph[child] = [];
        }

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

    let cycleRoots = new Set();
    let cycleNodes = new Set();
    
    console.log('allNodes:', allNodes);
    console.log('graph:', JSON.stringify(graph));
    
    for (let node of allNodes) {
        const hasCycle = detectCycle(
            node,
            graph,
            new Set(),
            new Set()
        );
        console.log('Checking node:', node, 'hasCycle:', hasCycle);
        if (hasCycle) {
            cycleRoots.add(node);
            cycleNodes.add(node);
        }
    }

    console.log('cycleRoots:', cycleRoots);

    let orphanCycles = [];
    for (let node of cycleNodes) {
        if (!roots.includes(node)) {
            orphanCycles.push(node);
        }
    }

    let hierarchies = [];
    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root = "";
    let maxDepthFound = 0;

    for (let root of roots) {
        if (cycleRoots.has(root)) {
            hierarchies.push({
                root: root,
                tree: {},
                has_cycle: true
            });

            total_cycles++;
        } else {
            let nestedTree = {};
            nestedTree[root] = buildTree(root, graph);

            let depth = getDepth(root, graph);

            hierarchies.push({
                root: root,
                tree: nestedTree,
                depth: depth
            });

            total_trees++;

            if (
                depth > maxDepthFound ||
                (
                    depth === maxDepthFound &&
                    (
                        largest_tree_root === "" ||
                        root < largest_tree_root
                    )
                )
            ) {
                maxDepthFound = depth;
                largest_tree_root = root;
            }
        }
    }

    orphanCycles.sort();
    for (let node of orphanCycles) {
        if (!hierarchies.some(h => h.root === node && h.has_cycle)) {
            hierarchies.push({
                root: node,
                tree: {},
                has_cycle: true
            });
            total_cycles++;
        }
    }

    res.status(200).json({
        user_id: `${FULL_NAME}_${DOB}`,
        email_id: EMAIL,
        college_roll_number: ROLL_NUMBER,
        hierarchies: hierarchies,
        invalid_entries: invalid_entries,
        duplicate_edges: duplicate_edges,
        summary: {
            total_trees: total_trees,
            total_cycles: total_cycles,
            largest_tree_root: largest_tree_root
        }
    });
});

app.get("/", (req, res) => {
    res.send("Backend is running successfully");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});