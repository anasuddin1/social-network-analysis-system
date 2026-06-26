// ==========================================================================
// 1. DATA STRUCTURES REPLICATING JAVA IMPLEMENTATION
// ==========================================================================

// Custom Stack Class matching CustomStack<T> in Java
class CustomStack {
    constructor(capacity) {
        this.array = new Array(capacity);
        this.top = -1;
    }

    push(item) {
        if (this.top < this.array.length - 1) {
            this.array[++this.top] = item;
        }
    }

    pop() {
        if (this.isEmpty()) throw new Error("EmptyStackException");
        const val = this.array[this.top];
        this.array[this.top] = null; // Clean reference
        this.top--;
        return val;
    }

    isEmpty() {
        return this.top === -1;
    }

    size() {
        return this.top + 1;
    }

    // Custom helper for retrieval without mutating
    getItems() {
        return this.array.slice(0, this.top + 1).reverse();
    }
}

// Custom Queue Class matching CustomQueue<T> in Java
class CustomQueue {
    constructor() {
        this.front = null;
        this.rear = null;
    }

    static Node = class {
        constructor(data) {
            this.data = data;
            this.next = null;
        }
    };

    enqueue(item) {
        const n = new CustomQueue.Node(item);
        if (this.rear === null) {
            this.front = this.rear = n;
        } else {
            this.rear.next = n;
            this.rear = n;
        }
    }

    dequeue() {
        if (this.isEmpty()) throw new Error("NoSuchElementException");
        const data = this.front.data;
        this.front = this.front.next;
        if (this.front === null) {
            this.rear = null;
        }
        return data;
    }

    isEmpty() {
        return this.front === null;
    }
}

// Graph Class matching Graph in Java
class Graph {
    constructor() {
        this.adjList = new Map(); // Map of username -> Array of usernames
    }

    addVertex(user) {
        if (!this.adjList.has(user)) {
            this.adjList.set(user, []);
        }
    }

    removeVertex(user) {
        // Remove edge references from other users
        for (let [otherUser, friends] of this.adjList.entries()) {
            this.adjList.set(otherUser, friends.filter(f => f !== user));
        }
        this.adjList.delete(user);
    }

    addEdge(u, v) {
        if (this.adjList.has(u) && this.adjList.has(v)) {
            if (!this.adjList.get(u).includes(v)) this.adjList.get(u).push(v);
            if (!this.adjList.get(v).includes(u)) this.adjList.get(v).push(u);
        }
    }

    removeEdge(u, v) {
        if (this.adjList.has(u) && this.adjList.has(v)) {
            this.adjList.set(u, this.adjList.get(u).filter(f => f !== v));
            this.adjList.set(v, this.adjList.get(v).filter(f => f !== u));
        }
    }

    getFriends(user) {
        return this.adjList.get(user) || [];
    }

    hasUser(user) {
        return this.adjList.has(user);
    }

    getUsers() {
        return Array.from(this.adjList.keys());
    }

    // Replicates system display layout
    getAdjacencyListString() {
        if (this.adjList.size === 0) {
            return "Graph is empty";
        }
        let output = "Graph Adjacency List:\n";
        for (let [user, friends] of this.adjList.entries()) {
            output += `${user} -> ${friends.length === 0 ? "(no friends)" : "[" + friends.join(", ") + "]"}\n`;
        }
        return output;
    }
}

// ==========================================================================
// 2. STATE MANAGER & SIMULATOR PROPERTIES
// ==========================================================================

const socialGraph = new Graph();
const activityHistory = new CustomStack(100);

// Physics & Nodes positions for Visual Graph
const nodes = [];  // Array of { id: "Alice", x: 200, y: 150, vx: 0, vy: 0, px: 200, py: 150 }
const links = [];  // Array of { source: nodeObj, target: nodeObj }

let width = 800;
let height = 500;
let physicsEnabled = true;
let isDraggingNode = null;
let animationInProgress = false;

// DOM Elements
const svg = document.getElementById("graph-svg");
const linksGroup = document.getElementById("links-group");
const nodesGroup = document.getElementById("nodes-group");
const logsContainer = document.getElementById("console-logs");
const statUsers = document.getElementById("stat-users-count");
const statEdges = document.getElementById("stat-edges-count");
const statDensity = document.getElementById("stat-density");
const physicsBtn = document.getElementById("toggle-physics");
const currentStatusSpan = document.getElementById("current-algorithm-status");

// Dropdowns to keep populated
const dropdowns = [
    "remove-user-select", "friend-user1", "friend-user2", 
    "show-friends-select", "mutual-user1", "mutual-user2",
    "bfs-source", "bfs-target", "dfs-start"
];

// ==========================================================================
// 3. UTILITY METHODS (LOGGING, DROPDOWNS, METRICS)
// ==========================================================================

// Log message inside the virtual terminal
function log(message, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const line = document.createElement("div");
    line.className = `log-line ${type}-log`;
    line.textContent = `[${time}] ${message}`;
    logsContainer.appendChild(line);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// Populate dropdowns with user lists
function updateDropdowns() {
    const users = socialGraph.getUsers().sort();
    
    dropdowns.forEach(id => {
        const select = document.getElementById(id);
        const prevValue = select.value;
        
        // Keep placeholder
        select.innerHTML = '';
        const placeholderText = getPlaceholderText(id);
        const placeholderOpt = new Option(placeholderText, "", true, true);
        placeholderOpt.disabled = true;
        select.appendChild(placeholderOpt);
        
        users.forEach(user => {
            select.appendChild(new Option(user, user));
        });
        
        // Restore value if it still exists
        if (users.includes(prevValue)) {
            select.value = prevValue;
        } else {
            select.value = "";
        }
    });
}

function getPlaceholderText(id) {
    if (id.includes("source")) return "Source";
    if (id.includes("target")) return "Target";
    if (id.includes("user1")) return "User 1";
    if (id.includes("user2")) return "User 2";
    if (id.includes("start")) return "Start user...";
    return "Select user...";
}

// Recalculate metrics (vertices, edges, density)
function updateStats() {
    const numV = socialGraph.getUsers().length;
    
    // Count edges (undirected graph edges are listed twice in adjList)
    let totalEdges = 0;
    socialGraph.getUsers().forEach(u => {
        totalEdges += socialGraph.getFriends(u).length;
    });
    const numE = totalEdges / 2;
    
    // Density calculation: Density = 2E / (V * (V - 1))
    let densityVal = 0;
    if (numV > 1) {
        densityVal = (2 * numE) / (numV * (numV - 1));
    }
    
    statUsers.textContent = numV;
    statEdges.textContent = numE;
    statDensity.textContent = (densityVal * 100).toFixed(1) + "%";
}

// Helper to block UI if algorithm is animating
function setUIBlocked(blocked) {
    animationInProgress = blocked;
    document.querySelectorAll(".sidebar button, .sidebar select, .sidebar input").forEach(el => {
        el.disabled = blocked;
    });
    if (blocked) {
        currentStatusSpan.innerHTML = `<span class="pulse-dot" style="background-color: var(--color-bfs); box-shadow: 0 0 8px var(--color-bfs)"></span> Algorithm Animating...`;
    } else {
        currentStatusSpan.innerHTML = `Standard Mode`;
        resetVisualStates();
    }
}

// Reset node & link visual classes
function resetVisualStates() {
    document.querySelectorAll(".graph-node").forEach(node => {
        node.classList.remove("visited", "bfs-active", "dfs-active", "search-match");
    });
    document.querySelectorAll(".graph-link").forEach(link => {
        link.classList.remove("active-bfs", "active-dfs");
    });
}

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================================================
// 4. ALGORITHMS & SIMULATION GRAPH INTERNALS
// ==========================================================================

// Physics Force-Directed Engine (Lightweight custom implementation)
function initPhysics() {
    // Set width and height based on SVG container bounds
    const bbox = svg.getBoundingClientRect();
    width = bbox.width || 800;
    height = bbox.height || 500;
    
    function stepSimulation() {
        if (!physicsEnabled && !isDraggingNode) {
            requestAnimationFrame(stepSimulation);
            return;
        }

        const kRepulsion = 1200; // Coulomb constant
        const kAttraction = 0.04; // Spring constant
        const naturalLength = 110; // Spring resting length
        const centerGravity = 0.015; // Pull to center
        const damping = 0.85; // Damping/friction

        // 1. Repulsion between all node pairs
        for (let i = 0; i < nodes.length; i++) {
            const n1 = nodes[i];
            for (let j = i + 1; j < j < nodes.length; j++) {
                const n2 = nodes[j];
                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                let dist = Math.hypot(dx, dy);
                if (dist === 0) dist = 0.1; // Prevent NaN

                if (dist < 350) {
                    const force = kRepulsion / (dist * dist);
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    n1.vx -= fx;
                    n1.vy -= fy;
                    n2.vx += fx;
                    n2.vy += fy;
                }
            }
        }

        // 2. Attraction between connected nodes (friends)
        links.forEach(link => {
            const n1 = link.source;
            const n2 = link.target;
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy) || 0.1;
            
            // Hooke's Law: F = k * (x - L)
            const force = kAttraction * (dist - naturalLength);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            n1.vx += fx;
            n1.vy += fy;
            n2.vx -= fx;
            n2.vy -= fy;
        });

        // 3. Gravity pulling nodes toward center
        const cx = width / 2;
        const cy = height / 2;
        nodes.forEach(node => {
            if (node === isDraggingNode) return; // Keep dragged node at cursor

            const dx = cx - node.x;
            const dy = cy - node.y;
            node.vx += dx * centerGravity;
            node.vy += dy * centerGravity;

            // Apply velocity
            node.x += node.vx;
            node.y += node.vy;

            // Apply friction/damping
            node.vx *= damping;
            node.vy *= damping;

            // Boundary constraints to keep nodes inside SVG
            const padding = 25;
            if (node.x < padding) { node.x = padding; node.vx = 0; }
            if (node.x > width - padding) { node.x = width - padding; node.vx = 0; }
            if (node.y < padding) { node.y = padding; node.vy = 0; }
            if (node.y > height - padding) { node.y = height - padding; node.vy = 0; }
        });

        // 4. Update SVG render positions
        updateSVGRender();
        requestAnimationFrame(stepSimulation);
    }
    
    requestAnimationFrame(stepSimulation);
}

// Updates positions of DOM nodes and link lines in the SVG
function updateSVGRender() {
    // Render lines (links)
    links.forEach(l => {
        const lineEl = document.getElementById(`link-${l.source.id}-${l.target.id}`) ||
                       document.getElementById(`link-${l.target.id}-${l.source.id}`);
        if (lineEl) {
            lineEl.setAttribute("x1", l.source.x);
            lineEl.setAttribute("y1", l.source.y);
            lineEl.setAttribute("x2", l.target.x);
            lineEl.setAttribute("y2", l.target.y);
        }
    });

    // Render nodes
    nodes.forEach(n => {
        const nodeGroup = document.getElementById(`node-${n.id}`);
        if (nodeGroup) {
            nodeGroup.setAttribute("transform", `translate(${n.x}, ${n.y})`);
        }
    });
}

// Rebuild Visual Nodes/Links lists matching the Graph
function rebuildGraphVisuals() {
    const currentUsers = socialGraph.getUsers();

    // 1. Sync nodes
    // Remove nodes that are no longer in graph
    for (let i = nodes.length - 1; i >= 0; i--) {
        if (!currentUsers.includes(nodes[i].id)) {
            nodes.splice(i, 1);
        }
    }
    
    // Add new nodes
    currentUsers.forEach(user => {
        if (!nodes.some(n => n.id === user)) {
            // Place nodes randomly near center
            const rx = width / 2 + (Math.random() - 0.5) * 150;
            const ry = height / 2 + (Math.random() - 0.5) * 150;
            nodes.push({ id: user, x: rx, y: ry, vx: 0, vy: 0 });
        }
    });

    // 2. Sync links
    links.length = 0; // Clear links list
    const addedPairs = new Set();
    
    currentUsers.forEach(u => {
        socialGraph.getFriends(u).forEach(v => {
            const pairKey = [u, v].sort().join("-");
            if (!addedPairs.has(pairKey)) {
                addedPairs.add(pairKey);
                const n1 = nodes.find(n => n.id === u);
                const n2 = nodes.find(n => n.id === v);
                if (n1 && n2) {
                    links.push({ source: n1, target: n2 });
                }
            }
        });
    });

    // 3. Rebuild SVG DOM nodes
    renderSVG();
    updateStats();
}

// Regenerate SVG DOM trees
function renderSVG() {
    linksGroup.innerHTML = "";
    nodesGroup.innerHTML = "";

    // 1. Draw Links
    links.forEach(l => {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("id", `link-${l.source.id}-${l.target.id}`);
        line.setAttribute("class", "graph-link");
        line.setAttribute("x1", l.source.x);
        line.setAttribute("y1", l.source.y);
        line.setAttribute("x2", l.target.x);
        line.setAttribute("y2", l.target.y);
        linksGroup.appendChild(line);
    });

    // 2. Draw Nodes
    nodes.forEach(n => {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("id", `node-${n.id}`);
        group.setAttribute("class", "graph-node");
        group.setAttribute("transform", `translate(${n.x}, ${n.y})`);

        // Node Circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", "16");
        group.appendChild(circle);

        // Node Label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("y", "5");
        text.textContent = n.id;
        group.appendChild(text);

        // Event listener for node dragging
        group.addEventListener("pointerdown", (e) => {
            isDraggingNode = n;
            group.classList.add("dragging");
            svg.setPointerCapture(e.pointerId);
        });

        nodesGroup.appendChild(group);
    });

    // Add pointer events for drag movement
    svg.onpointermove = (e) => {
        if (isDraggingNode) {
            const bbox = svg.getBoundingClientRect();
            // Map coordinates relative to SVG bounding box
            const mouseX = e.clientX - bbox.left;
            const mouseY = e.clientY - bbox.top;
            
            isDraggingNode.x = mouseX;
            isDraggingNode.y = mouseY;
            isDraggingNode.vx = 0;
            isDraggingNode.vy = 0;
            updateSVGRender();
        }
    };

    svg.onpointerup = (e) => {
        if (isDraggingNode) {
            const group = document.getElementById(`node-${isDraggingNode.id}`);
            if (group) group.classList.remove("dragging");
            svg.releasePointerCapture(e.pointerId);
            isDraggingNode = null;
        }
    };
}

// ==========================================================================
// 5. GRAPH ALGORITHMS INTERACTIVE EXECUTIONS
// ==========================================================================

// BFS (Shortest Connection Path) - O(V+E)
async function animateBFS(src, dest) {
    if (!socialGraph.hasUser(src) || !socialGraph.hasUser(dest)) {
        log("Error: User not found", "error");
        return;
    }

    if (src === dest) {
        log(`Shortest Path: Path length is 0`, "success");
        const n = document.getElementById(`node-${src}`);
        if (n) n.classList.add("bfs-active");
        return;
    }

    setUIBlocked(true);
    log(`Initializing BFS Shortest Path finding from ${src} to ${dest}...`, "system");

    const visited = new Set();
    const parent = new Map();
    const queue = new CustomQueue();

    visited.add(src);
    parent.set(src, null);
    queue.enqueue(src);

    let found = false;

    // Highlight starting node
    const srcNode = document.getElementById(`node-${src}`);
    if (srcNode) srcNode.classList.add("bfs-active");
    await sleep(600);

    while (!queue.isEmpty() && !found) {
        const current = queue.dequeue();
        log(`Dequeued user: ${current}. Exploring friendships...`, "algo");
        
        // Highlight active expansion node
        const currNode = document.getElementById(`node-${current}`);
        if (currNode) currNode.classList.add("visited");

        const friends = socialGraph.getFriends(current);
        for (let neighbor of friends) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent.set(neighbor, current);
                queue.enqueue(neighbor);

                // Print discovery step
                log(`  -> Discovered user: ${neighbor} via ${current}`, "info");

                // Visual node update
                const neighNode = document.getElementById(`node-${neighbor}`);
                if (neighNode) neighNode.classList.add("bfs-active");
                
                // Highlight edge being traversed
                highlightLink(current, neighbor, "active-bfs");
                await sleep(700);

                if (neighbor === dest) {
                    found = true;
                    log(`Destination user ${dest} found!`, "success");
                    break;
                }
            }
        }
    }

    if (!found) {
        log("No connection found between the specified users.", "error");
        setUIBlocked(false);
        return;
    }

    // Reconstruct the path backwards
    const path = [];
    let step = dest;
    while (step !== null) {
        path.unshift(step);
        step = parent.get(step);
    }

    // Output results matching Java format exactly
    log(`Shortest Path (${path.length - 1} hops):`, "success");
    log(path.join(" -> "), "success");

    // Animate final shortest path glow
    resetVisualStates();
    await sleep(100);
    
    for (let i = 0; i < path.length; i++) {
        const node = document.getElementById(`node-${path[i]}`);
        if (node) node.classList.add("bfs-active");
        if (i < path.length - 1) {
            highlightLink(path[i], path[i+1], "active-bfs");
        }
        await sleep(350);
    }

    // Let path glow for a while before unlocking UI
    await sleep(2500);
    setUIBlocked(false);
}

// DFS (Network Traversal) - O(V+E)
async function animateDFS(start) {
    if (!socialGraph.hasUser(start)) {
        log("Error: User not found", "error");
        return;
    }

    setUIBlocked(true);
    log(`Initializing DFS Network Traversal from start: ${start}...`, "system");

    const visited = new Set();
    const traversalOrder = [];

    async function dfsRecursive(current) {
        visited.add(current);
        traversalOrder.push(current);
        log(`DFS Visited user: ${current}`, "algo");

        const node = document.getElementById(`node-${current}`);
        if (node) node.classList.add("dfs-active");
        await sleep(800);

        const neighbors = socialGraph.getFriends(current);
        for (let neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                // Highlight path link
                highlightLink(current, neighbor, "active-dfs");
                await dfsRecursive(neighbor);
            }
        }
    }

    await dfsRecursive(start);

    // Output results matching Java format exactly
    log(`DFS Order from ${start}:`, "success");
    traversalOrder.forEach(user => {
        log(`- ${user}`, "success");
    });

    await sleep(2500);
    setUIBlocked(false);
}

// Simple link class assignment helper
function highlightLink(u1, u2, cssClass) {
    const lEl1 = document.getElementById(`link-${u1}-${u2}`);
    const lEl2 = document.getElementById(`link-${u2}-${u1}`);
    if (lEl1) lEl1.classList.add(cssClass);
    if (lEl2) lEl2.classList.add(cssClass);
}

// ==========================================================================
// 6. ACTION CONTROLLERS BINDING TO THE SOCIAL NETWORK STATE
// ==========================================================================

// Add user
function doAddUser() {
    const input = document.getElementById("username-input");
    const name = input.value.trim();
    
    if (name === "" || socialGraph.hasUser(name)) {
        log("Error: Empty or duplicate user", "error");
        return;
    }
    
    socialGraph.addVertex(name);
    activityHistory.push(`Added User ${name}`);
    rebuildGraphVisuals();
    updateDropdowns();
    
    log("User Added", "success");
    input.value = "";
}

// Remove user
function doRemoveUser() {
    const select = document.getElementById("remove-user-select");
    const name = select.value;
    
    if (!name || !socialGraph.hasUser(name)) {
        log("Error: User not found", "error");
        return;
    }
    
    socialGraph.removeVertex(name);
    activityHistory.push(`Removed User ${name}`);
    rebuildGraphVisuals();
    updateDropdowns();
    
    log("User Removed", "success");
}

// Search user
function doSearchUser() {
    const input = document.getElementById("search-username");
    const name = input.value.trim();
    
    resetVisualStates();
    
    if (name === "") {
        log("Please enter a username to search", "error");
        return;
    }
    
    const exists = socialGraph.hasUser(name);
    if (exists) {
        log(`Found: ${name}`, "success");
        const node = document.getElementById(`node-${name}`);
        if (node) {
            node.classList.add("search-match");
            // Temporarily apply physics drag pulse to center it
            const matchingNode = nodes.find(n => n.id === name);
            if (matchingNode) {
                matchingNode.x = width / 2;
                matchingNode.y = height / 2;
            }
        }
    } else {
        log("Not Found", "error");
    }
    input.value = "";
}

// Add friendship
function doAddFriendship() {
    const u1 = document.getElementById("friend-user1").value;
    const u2 = document.getElementById("friend-user2").value;
    
    if (!u1 || !u2) {
        log("Error: Select two users to make friends", "error");
        return;
    }
    if (u1 === u2) {
        log("Error: Cannot add self-friendship", "error");
        return;
    }
    if (socialGraph.getFriends(u1).includes(u2)) {
        log("Error: Friendship exists", "error");
        return;
    }
    
    socialGraph.addEdge(u1, u2);
    activityHistory.push(`Friendship Added ${u1}-${u2}`);
    rebuildGraphVisuals();
    updateDropdowns();
    
    log("Friendship Created", "success");
}

// Remove friendship
function doRemoveFriendship() {
    const u1 = document.getElementById("friend-user1").value;
    const u2 = document.getElementById("friend-user2").value;
    
    if (!u1 || !u2) {
        log("Error: Select two users to remove friendship", "error");
        return;
    }
    if (!socialGraph.getFriends(u1).includes(u2)) {
        log("Error: Friendship not found", "error");
        return;
    }
    
    socialGraph.removeEdge(u1, u2);
    activityHistory.push(`Friendship Removed ${u1}-${u2}`);
    rebuildGraphVisuals();
    updateDropdowns();
    
    log("Friendship Removed", "success");
}

// Show friends of user
function doShowFriends() {
    const user = document.getElementById("show-friends-select").value;
    if (!user) {
        log("Error: Select a user first", "error");
        return;
    }
    
    resetVisualStates();
    
    const friends = socialGraph.getFriends(user);
    if (friends.length === 0) {
        log(`${user} has no friends`, "info");
    } else {
        log(`Friends of ${user}:`, "success");
        friends.forEach(f => {
            log(`- ${f}`, "success");
            // Highlight friends
            const node = document.getElementById(`node-${f}`);
            if (node) node.classList.add("visited");
            highlightLink(user, f, "active-bfs");
        });
        const rootNode = document.getElementById(`node-${user}`);
        if (rootNode) rootNode.classList.add("bfs-active");
    }
}

// Sort users
function doSortUsers() {
    const users = socialGraph.getUsers();
    if (users.length === 0) {
        log("No users in the network to sort.", "info");
        return;
    }
    
    const sorted = [...users].sort();
    log("Users (Alphabetical):", "success");
    sorted.forEach(u => log(`- ${u}`, "success"));
}

// Find mutual friends
function doFindMutualFriends() {
    const u1 = document.getElementById("mutual-user1").value;
    const u2 = document.getElementById("mutual-user2").value;
    
    if (!u1 || !u2) {
        log("Error: Select two users", "error");
        return;
    }
    
    resetVisualStates();
    
    const friends1 = new Set(socialGraph.getFriends(u1));
    const mutual = [];
    
    socialGraph.getFriends(u2).forEach(f => {
        if (friends1.has(f)) {
            mutual.push(f);
        }
    });
    
    if (mutual.length === 0) {
        log("No mutual friends found.", "info");
    } else {
        log("Mutual Friends:", "success");
        mutual.forEach(m => {
            log(`- ${m}`, "success");
            
            // Highlight mutual nodes and their connections
            const node = document.getElementById(`node-${m}`);
            if (node) node.classList.add("search-match");
            highlightLink(u1, m, "active-bfs");
            highlightLink(u2, m, "active-dfs");
        });
        const n1 = document.getElementById(`node-${u1}`);
        const n2 = document.getElementById(`node-${u2}`);
        if (n1) n1.classList.add("bfs-active");
        if (n2) n2.classList.add("dfs-active");
    }
}

// Friend Suggestions
function doFriendSuggestions() {
    const user = document.getElementById("show-friends-select").value || 
                 document.getElementById("remove-user-select").value ||
                 document.getElementById("friend-user1").value;
                 
    if (!user || !socialGraph.hasUser(user)) {
        log("Error: Select a user from either User or Friendship dropdowns to get suggestions.", "error");
        return;
    }
    
    resetVisualStates();
    
    const directFriends = new Set(socialGraph.getFriends(user));
    const suggestions = new Set();
    
    directFriends.forEach(friend => {
        socialGraph.getFriends(friend).forEach(fof => {
            if (fof !== user && !directFriends.has(fof)) {
                suggestions.add(fof);
            }
        });
    });
    
    if (suggestions.size === 0) {
        log(`No suggestions for ${user}`, "info");
    } else {
        log(`Suggestions for ${user}:`, "success");
        suggestions.forEach(s => {
            log(`- ${s}`, "success");
            // Highlight suggestion nodes
            const node = document.getElementById(`node-${s}`);
            if (node) node.classList.add("search-match");
        });
        const rootNode = document.getElementById(`node-${user}`);
        if (rootNode) rootNode.classList.add("bfs-active");
    }
}

// Load Demo Network
function doLoadDemo() {
    // Reset graph first
    doReset(false);
    
    // Add vertices
    const demoUsers = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace"];
    demoUsers.forEach(u => socialGraph.addVertex(u));
    
    // Add edges
    const demoEdges = [
        ["Alice", "Bob"],
        ["Alice", "Charlie"],
        ["Bob", "David"],
        ["Charlie", "David"],
        ["Charlie", "Eve"],
        ["David", "Frank"],
        ["Eve", "Frank"],
        ["Frank", "Grace"]
    ];
    
    demoEdges.forEach(edge => socialGraph.addEdge(edge[0], edge[1]));
    
    activityHistory.push("Loaded Demo Network");
    rebuildGraphVisuals();
    updateDropdowns();
    
    log("=== Demo Network Loaded ===", "system");
    log("Loaded users: " + demoUsers.join(", "), "info");
    log("Added friendships: " + demoEdges.map(e => `${e[0]}-${e[1]}`).join(", "), "info");
}

// Reset network
function doReset(logIt = true) {
    socialGraph.adjList.clear();
    nodes.length = 0;
    links.length = 0;
    
    // Clear history stack
    while(!activityHistory.isEmpty()) {
        activityHistory.pop();
    }
    
    if (logIt) {
        activityHistory.push("Reset Social Network");
        log("=== Network Reset ===", "system");
        log("All users and friendships cleared.", "info");
    }
    
    rebuildGraphVisuals();
    updateDropdowns();
    resetVisualStates();
}

// Show Activity History (Stack modal)
const historyModal = document.getElementById("history-modal");
const historyList = document.getElementById("modal-history-list");

function showHistoryModal() {
    historyList.innerHTML = "";
    
    if (activityHistory.isEmpty()) {
        const item = document.createElement("div");
        item.className = "log-line";
        item.style.textAlign = "center";
        item.textContent = "No activities recorded.";
        historyList.appendChild(item);
    } else {
        const items = activityHistory.getItems();
        items.forEach((act, index) => {
            const row = document.createElement("div");
            row.className = "history-item";
            row.innerHTML = `
                <span class="index">[Stack #${items.length - index}]</span>
                <i class="fa-solid fa-bolt"></i>
                <span class="text">${act}</span>
            `;
            historyList.appendChild(row);
        });
        
        // Log in the console mimicking viewActivityHistory() in Java
        log("Recent Activities (Newest First):", "success");
        items.forEach(act => log(`- ${act}`, "success"));
    }
    
    historyModal.classList.add("active");
}

// Close History modal
function closeHistoryModal() {
    historyModal.classList.remove("active");
}

// Display Complete Graph (raw adjacency list)
function displayAdjacencyList() {
    const listStr = socialGraph.getAdjacencyListString();
    log("==============================", "system");
    log(listStr, "success");
    log("==============================", "system");
}

// ==========================================================================
// 7. EVENT BINDINGS & INIT
// ==========================================================================

function init() {
    // 1. Initialize custom physics simulation
    initPhysics();

    // 2. Control click bindings
    document.getElementById("add-user-btn").addEventListener("click", doAddUser);
    document.getElementById("remove-user-btn").addEventListener("click", doRemoveUser);
    document.getElementById("search-user-btn").addEventListener("click", doSearchUser);
    document.getElementById("add-friendship-btn").addEventListener("click", doAddFriendship);
    document.getElementById("remove-friendship-btn").addEventListener("click", doRemoveFriendship);
    document.getElementById("show-friends-btn").addEventListener("click", doShowFriends);
    document.getElementById("sort-users-btn").addEventListener("click", doSortUsers);
    document.getElementById("suggest-friends-btn").addEventListener("click", doFriendSuggestions);
    document.getElementById("mutual-friends-btn").addEventListener("click", doFindMutualFriends);
    document.getElementById("show-history-btn").addEventListener("click", showHistoryModal);
    document.getElementById("close-history-modal").addEventListener("click", closeHistoryModal);
    document.getElementById("show-adjacency-btn").addEventListener("click", displayAdjacencyList);
    document.getElementById("clear-all-btn").addEventListener("click", () => doReset(true));
    document.getElementById("load-demo-btn").addEventListener("click", doLoadDemo);
    
    // BFS/DFS Run bindings
    document.getElementById("run-bfs-btn").addEventListener("click", () => {
        const src = document.getElementById("bfs-source").value;
        const dest = document.getElementById("bfs-target").value;
        if (!src || !dest) {
            log("Error: Select Source and Target for BFS path search", "error");
            return;
        }
        resetVisualStates();
        animateBFS(src, dest);
    });
    
    document.getElementById("run-dfs-btn").addEventListener("click", () => {
        const start = document.getElementById("dfs-start").value;
        if (!start) {
            log("Error: Select starting user for DFS traversal", "error");
            return;
        }
        resetVisualStates();
        animateDFS(start);
    });

    // Console Clear bindings
    document.getElementById("clear-console-btn").addEventListener("click", () => {
        logsContainer.innerHTML = "";
    });

    // Physics toggle
    physicsBtn.addEventListener("click", () => {
        physicsEnabled = !physicsEnabled;
        if (physicsEnabled) {
            physicsBtn.classList.add("active");
            physicsBtn.innerHTML = `<i class="fa-solid fa-wind"></i> Gravity Physics: ON`;
        } else {
            physicsBtn.classList.remove("active");
            physicsBtn.innerHTML = `<i class="fa-solid fa-wind"></i> Gravity Physics: OFF`;
        }
    });

    // Key bindings (Enter key inside text fields)
    document.getElementById("username-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") doAddUser();
    });
    document.getElementById("search-username").addEventListener("keydown", (e) => {
        if (e.key === "Enter") doSearchUser();
    });

    // Close modal on clicking outside
    historyModal.addEventListener("click", (e) => {
        if (e.target === historyModal) closeHistoryModal();
    });

    // 3. Load initial demo data so the screen isn't empty!
    doLoadDemo();
}

// Window load trigger
window.addEventListener("DOMContentLoaded", init);
