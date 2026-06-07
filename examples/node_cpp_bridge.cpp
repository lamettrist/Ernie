/*
 * Node <-> C++ bridge example for Ernie
 *
 * This program prints a JSON payload to stdout, receives a JSON response from
 * stdin, and exits. It's meant to be spawned from Node.js.
 *
 * Build:
 *   g++ -std=c++17 -O2 -o node_cpp_bridge examples/node_cpp_bridge.cpp
 *
 * Run via Node:
 *   const child = spawn('./node_cpp_bridge', [], { stdio: ['pipe', 'pipe', 'inherit'] });
 *   child.stdin.write(JSON.stringify({ prompt: 'Hello' }) + '\n');
 *   child.stdin.end();
 */

#include <iostream>
#include <string>
#include <sstream>

static std::string read_all_stdin() {
    std::ostringstream ss;
    ss << std::cin.rdbuf();
    return ss.str();
}

int main() {
    // Read request from stdin
    std::string request = read_all_stdin();

    // Minimal demo response: echo request back in a structured way.
    // Replace this with your own logic if you want the C++ side to do more.
    std::cout << "{\n"
              << "  \"ok\": true,\n"
              << "  \"from_cpp\": true,\n"
              << "  \"received\": " << std::quoted(request) << "\n"
              << "}\n";

    return 0;
}
