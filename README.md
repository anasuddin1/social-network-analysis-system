# ⚡ Social Network Analysis System (Socio-Graph)

A high-fidelity **Social Network Analysis and Traversal System** designed for Data Structures & Algorithms (DSA) demonstrations. The project consists of two components:
1. A robust **Java Backend Engine** operating in the CLI terminal.
2. A separate **Interactive Web Frontend** dashboard featuring a custom gravity-physics layout engine and visual graph algorithm animations.

---

## 🎯 Project Overview

This project models a social network as a **Graph Data Structure**, where:
*   **Vertices (Nodes)** represent **Users**.
*   **Edges (Links)** represent **Friendships** (undirected connections).

The system implements **custom-built memory structures** (Adjacency List Graph, Custom Stack, and Custom Queue) rather than standard built-in libraries to showcase core DSA memory allocation and traversal principles.

---

## 🎨 Visual Preview

The web interface is styled with a modern **Glassmorphic Dark Theme** and includes:
*   **Interactive Force-Directed Layout**: Nodes float dynamically using magnetic repulsion and spring tension forces, and can be dragged around by the user.
*   **Step-by-Step Algorithm Playback**: Visually highlights active traversal queues, visited paths, and results for BFS and DFS in real-time.
*   **Live Console Log**: A replica of the Java terminal console output rendered directly on the web page.

---

## 🚀 Key Features

*   **User Management**: Add users, remove users, and search for users (with visual node positioning focus).
*   **Friendship Management**: Link and unlink friendships, and search/display a user's friend connections.
*   **Advanced Analytics**:
    *   **Mutual Friends**: Identifies shared connections between two users.
    *   **Friend Suggestions**: Implements a Friends-of-Friends traversal algorithm (direct friends of friends who are not currently connected to the source user).
    *   **Alphabetical Sorting**: Sorts and lists users alphabetically.
*   **Graph Traversal Algorithms**:
    *   **Shortest Connection Path (BFS)**: Computes the minimum network hops between two users using a custom Queue.
    *   **Network Traversal (DFS)**: Recursively traverses and logs the network connectivity hierarchy from a starting node.
*   **Activity Logging**: Tracks user actions in a **Custom Stack** (Last In, First Out) for history retrieval.

---

## ⚙️ Project Architecture & Data Structures

To satisfy strict DSA requirements, all key structures are implemented from scratch:

*   **`Graph`**: Implemented using an **Adjacency List** model. Ideal for sparse graphs like social networks, reducing space complexity from $O(V^2)$ (Adjacency Matrix) to $O(V + E)$ where $V$ is Vertices and $E$ is Edges.
*   **`CustomQueue`**: A linked list node-pointer structure (FIFO) created to store search paths during **BFS execution**.
*   **`CustomStack`**: An array-backed LIFO container utilized to log the history of network events.

---

## 🛠️ Tech Stack

*   **Backend**: Java (CLI, `java.util.Scanner`)
*   **Frontend Structure**: HTML5 (Semantic tags, SVG nodes/links)
*   **Frontend Styling**: CSS3 (Vanilla design, custom variables, backdrop blur filters, keyframe pulse animations)
*   **Frontend Control Logic**: JavaScript (ES6+, DOM binding, SVG mouse tracking, Force-Directed simulation engine)

---

## 🏃 How to Run the Project

### 1. Java CLI Backend
Compile and run the main entry file in your terminal:
```bash
javac src/com/company/SocialNetworkSystem.java
java com.company.SocialNetworkSystem
```

### 2. Interactive Web Frontend
Since the frontend is a serverless, static implementation, you can run it immediately:
*   **Direct Open**: Double-click [frontend/index.html](frontend/index.html) or drag it into any modern web browser.
*   **Local Server (Recommended)**: Run a lightweight server in your terminal:
    ```bash
    python3 -m http.server 8000
    ```
    Open your browser and navigate to `http://localhost:8000/frontend/`.

---

## 📚 Study Guide (For Viva Preparation)

*   **BFS Complexity**: Time complexity is **$O(V + E)$** because it explores each vertex once and checks each connection. Space complexity is **$O(V)$** to store visited flags and queue pathways.
*   **DFS Complexity**: Time complexity is **$O(V + E)$** using recursion. Space complexity is **$O(V)$** due to the call stack size.
*   **Force-Directed Physics**: Updates nodes using Hooke's Law (spring tension pulls connected friends together) and Coulomb's Law (electric fields push nodes apart to prevent overlaps).
