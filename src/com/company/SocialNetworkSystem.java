package com.company;

import java.util.*;

public class SocialNetworkSystem {
    static Graph socialGraph = new Graph();
    static CustomStack<String> activityHistory = new CustomStack<>(100);
    static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        int choice;
        do {
            displayMenu();
            try {
                choice = Integer.parseInt(scanner.nextLine().trim());
            } catch (NumberFormatException e) {
                choice = -1;
            }

            switch (choice) {
                case 1: addUser(); break;
                case 2: removeUser(); break;
                case 3: displayAllUsers(); break;
                case 4: addFriendship(); break;
                case 5: removeFriendship(); break;
                case 6: showFriendsOfUser(); break;
                case 7: searchUser(); break;
                case 8: sortUsers(); break;
                case 9: findMutualFriends(); break;
                case 10: friendSuggestions(); break;
                case 11: shortestConnectionPath(); break;
                case 12: traverseNetworkDFS(); break;
                case 13: viewActivityHistory(); break;
                case 14: displayCompleteGraph(); break;
                case 15: System.out.println("Goodbye!"); break;
                default: System.out.println("Invalid choice.");
            }
        } while (choice != 15);
    }

    static void displayMenu() {
        System.out.println("\n=== SOCIAL NETWORK ANALYSIS SYSTEM ===");
        System.out.println("1.Add User  2.Remove User  3.Display Users  4.Add Friendship");
        System.out.println("5.Remove Friendship  6.Show Friends  7.Search User  8.Sort Users");
        System.out.println("9.Mutual Friends  10.Friend Suggestions  11.Shortest Path(BFS)");
        System.out.println("12.Traverse(DFS)  13.Activity History  14.Display Graph  15.Exit");
        System.out.print("Choice: ");
    }

    // ============ USER MANAGEMENT ============

    static void addUser() {
        System.out.print("Username: ");
        String name = scanner.nextLine().trim();
        if (name.isEmpty() || socialGraph.hasUser(name)) {
            System.out.println("Error: Empty or duplicate user");
            return;
        }
        socialGraph.addVertex(name);
        activityHistory.push("Added User " + name);
        System.out.println("User Added");
    }

    static void removeUser() {
        System.out.print("Username to remove: ");
        String name = scanner.nextLine().trim();
        if (!socialGraph.hasUser(name)) {
            System.out.println("Error: User not found");
            return;
        }
        socialGraph.removeVertex(name);
        activityHistory.push("Removed User " + name);
        System.out.println("User Removed");
    }

    static void displayAllUsers() {
        Set<String> users = socialGraph.getUsers();
        if (users.isEmpty()) {
            System.out.println("No users");
            return;
        }
        int i = 1;
        for (String user : users) System.out.println(i++ + ". " + user);
    }

    static void searchUser() {
        System.out.print("Username: ");
        String user = scanner.nextLine().trim();
        System.out.println(socialGraph.hasUser(user) ? "Found: " + user : "Not Found");
    }

    // ============ FRIENDSHIP MANAGEMENT ============

    static void addFriendship() {
        System.out.print("User 1: ");
        String u1 = scanner.nextLine().trim();
        System.out.print("User 2: ");
        String u2 = scanner.nextLine().trim();

        if (!socialGraph.hasUser(u1) || !socialGraph.hasUser(u2)) {
            System.out.println("Error: User not found");
            return;
        }
        if (u1.equals(u2)) {
            System.out.println("Error: Cannot add self-friendship");
            return;
        }
        if (socialGraph.getFriends(u1).contains(u2)) {
            System.out.println("Error: Friendship exists");
            return;
        }

        socialGraph.addEdge(u1, u2);
        activityHistory.push("Friendship Added " + u1 + "-" + u2);
        System.out.println("Friendship Created");
    }

    static void removeFriendship() {
        System.out.print("User 1: ");
        String u1 = scanner.nextLine().trim();
        System.out.print("User 2: ");
        String u2 = scanner.nextLine().trim();

        if (!socialGraph.getFriends(u1).contains(u2)) {
            System.out.println("Error: Friendship not found");
            return;
        }

        socialGraph.removeEdge(u1, u2);
        activityHistory.push("Friendship Removed " + u1 + "-" + u2);
        System.out.println("Friendship Removed");
    }

    static void showFriendsOfUser() {
        System.out.print("Username: ");
        String user = scanner.nextLine().trim();
        if (!socialGraph.hasUser(user)) {
            System.out.println("Error: User not found");
            return;
        }
        List<String> friends = socialGraph.getFriends(user);
        if (friends.isEmpty()) {
            System.out.println(user + " has no friends");
        } else {
            System.out.println("Friends of " + user + ":");
            for (String f : friends) System.out.println("- " + f);
        }
    }

    // ============ SORTING & SEARCHING ============

    static void sortUsers() {
        List<String> users = new ArrayList<>(socialGraph.getUsers());
        if (users.isEmpty()) {
            System.out.println("No users");
            return;
        }
        Collections.sort(users);
        System.out.println("Users (Alphabetical):");
        for (String u : users) System.out.println("- " + u);
    }

    // ============ ANALYSIS FEATURES ============

    static void findMutualFriends() {
        System.out.print("User 1: ");
        String u1 = scanner.nextLine().trim();
        System.out.print("User 2: ");
        String u2 = scanner.nextLine().trim();

        if (!socialGraph.hasUser(u1) || !socialGraph.hasUser(u2)) {
            System.out.println("Error: User not found");
            return;
        }

        Set<String> friends1 = new HashSet<>(socialGraph.getFriends(u1));
        List<String> mutual = new ArrayList<>();

        for (String f : socialGraph.getFriends(u2)) {
            if (friends1.contains(f)) mutual.add(f);
        }

        if (mutual.isEmpty()) {
            System.out.println("No mutual friends");
        } else {
            System.out.println("Mutual Friends:");
            for (String m : mutual) System.out.println("- " + m);
        }
    }

    static void friendSuggestions() {
        System.out.print("Username: ");
        String user = scanner.nextLine().trim();
        if (!socialGraph.hasUser(user)) {
            System.out.println("Error: User not found");
            return;
        }

        Set<String> directFriends = new HashSet<>(socialGraph.getFriends(user));
        Set<String> suggestions = new LinkedHashSet<>();

        for (String friend : directFriends) {
            for (String fof : socialGraph.getFriends(friend)) {
                if (!fof.equals(user) && !directFriends.contains(fof))
                    suggestions.add(fof);
            }
        }

        if (suggestions.isEmpty()) {
            System.out.println("No suggestions");
        } else {
            System.out.println("Suggestions for " + user + ":");
            for (String s : suggestions) System.out.println("- " + s);
        }
    }

    // ============ GRAPH ALGORITHMS ============

    // BFS - O(V+E)
    static void shortestConnectionPath() {
        System.out.print("Source: ");
        String src = scanner.nextLine().trim();
        System.out.print("Destination: ");
        String dest = scanner.nextLine().trim();

        if (!socialGraph.hasUser(src) || !socialGraph.hasUser(dest)) {
            System.out.println("Error: User not found");
            return;
        }

        if (src.equals(dest)) {
            System.out.println("Path length: 0");
            return;
        }

        Set<String> visited = new HashSet<>();
        Map<String, String> parent = new HashMap<>();
        CustomQueue<String> queue = new CustomQueue<>();

        visited.add(src);
        parent.put(src, null);
        queue.enqueue(src);

        boolean found = false;
        while (!queue.isEmpty() && !found) {
            String current = queue.dequeue();
            for (String neighbor : socialGraph.getFriends(current)) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    parent.put(neighbor, current);
                    queue.enqueue(neighbor);
                    if (neighbor.equals(dest)) found = true;
                }
            }
        }

        if (!found) {
            System.out.println("No connection found");
            return;
        }

        LinkedList<String> path = new LinkedList<>();
        String step = dest;
        while (step != null) {
            path.addFirst(step);
            step = parent.get(step);
        }

        System.out.println("Shortest Path (" + (path.size()-1) + " hops):");
        System.out.println(String.join(" -> ", path));
    }

    // DFS - O(V+E)
    static void traverseNetworkDFS() {
        System.out.print("Starting user: ");
        String start = scanner.nextLine().trim();
        if (!socialGraph.hasUser(start)) {
            System.out.println("Error: User not found");
            return;
        }

        Set<String> visited = new LinkedHashSet<>();
        dfsRecursive(start, visited);

        System.out.println("DFS Order from " + start + ":");
        for (String user : visited) System.out.println("- " + user);
    }

    static void dfsRecursive(String current, Set<String> visited) {
        visited.add(current);
        for (String neighbor : socialGraph.getFriends(current)) {
            if (!visited.contains(neighbor))
                dfsRecursive(neighbor, visited);
        }
    }

    // ============ HISTORY & DISPLAY ============

    static void viewActivityHistory() {
        if (activityHistory.isEmpty()) {
            System.out.println("No activities");
            return;
        }

        System.out.println("Recent Activities (Newest First):");
        CustomStack<String> temp = new CustomStack<>(activityHistory.size());
        while (!activityHistory.isEmpty()) {
            String act = activityHistory.pop();
            System.out.println("- " + act);
            temp.push(act);
        }
        while (!temp.isEmpty())
            activityHistory.push(temp.pop());
    }

    static void displayCompleteGraph() {
        socialGraph.display();
    }

    // ============ INNER CLASSES ============

    static class Graph {
        private HashMap<String, ArrayList<String>> adjList = new HashMap<>();

        void addVertex(String user) {
            if (!adjList.containsKey(user))
                adjList.put(user, new ArrayList<>());
        }

        void removeVertex(String user) {
            for (String other : adjList.keySet())
                adjList.get(other).remove(user);
            adjList.remove(user);
        }

        void addEdge(String u, String v) {
            adjList.get(u).add(v);
            adjList.get(v).add(u);
        }

        void removeEdge(String u, String v) {
            adjList.get(u).remove(v);
            adjList.get(v).remove(u);
        }

        ArrayList<String> getFriends(String user) {
            return adjList.getOrDefault(user, new ArrayList<>());
        }

        boolean hasUser(String user) {
            return adjList.containsKey(user);
        }

        Set<String> getUsers() {
            return adjList.keySet();
        }

        void display() {
            if (adjList.isEmpty()) {
                System.out.println("Graph is empty");
                return;
            }
            System.out.println("Graph Adjacency List:");
            for (String user : adjList.keySet()) {
                List<String> friends = adjList.get(user);
                System.out.println(user + " -> " + (friends.isEmpty() ? "(no friends)" : friends));
            }
        }
    }

    static class CustomStack<T> {
        private T[] array;
        private int top = -1;

        @SuppressWarnings("unchecked")
        CustomStack(int capacity) {
            array = (T[]) new Object[capacity];
        }

        void push(T item) {
            if (top < array.length - 1) array[++top] = item;
        }

        T pop() {
            if (isEmpty()) throw new EmptyStackException();
            return array[top--];
        }

        boolean isEmpty() { return top == -1; }
        int size() { return top + 1; }
    }

    static class CustomQueue<T> {
        private Node<T> front, rear;

        private static class Node<T> {
            T data;
            Node<T> next;
            Node(T data) { this.data = data; }
        }

        void enqueue(T item) {
            Node<T> n = new Node<>(item);
            if (rear == null) front = rear = n;
            else { rear.next = n; rear = n; }
        }

        T dequeue() {
            if (isEmpty()) throw new NoSuchElementException();
            T data = front.data;
            front = front.next;
            if (front == null) rear = null;
            return data;
        }

        boolean isEmpty() { return front == null; }
    }
}
