/*
 * ============================================================
 *  Multi-Agent Inference Demo in C++
 *
 *  A self-contained example that runs the same prompt through
 *  multiple lightweight "agents" (rule-based personas) and then
 *  compares / aggregates their outputs.
 *
 *  Build: g++ -std=c++17 -O2 -o multi_agent_inference multi_agent_inference.cpp
 *  Run:   ./multi_agent_inference
 *
 *  Notes:
 *  - This is an offline C++ example, not a real LLM API client.
 *  - It demonstrates a pattern you can later swap with actual model
 *    calls (OpenAI, Anthropic, local models, etc.).
 * ============================================================
 */

#include <algorithm>
#include <cctype>
#include <iostream>
#include <string>
#include <vector>

struct AgentResult {
    std::string name;
    std::string output;
};

static std::string lower_copy(std::string s) {
    std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) {
        return static_cast<char>(std::tolower(c));
    });
    return s;
}

static bool contains_any(const std::string& text, const std::vector<std::string>& needles) {
    const std::string haystack = lower_copy(text);
    for (const auto& needle : needles) {
        if (haystack.find(lower_copy(needle)) != std::string::npos) {
            return true;
        }
    }
    return false;
}

class Agent {
public:
    explicit Agent(std::string name) : name_(std::move(name)) {}
    virtual ~Agent() = default;

    const std::string& name() const { return name_; }
    virtual std::string infer(const std::string& prompt) const = 0;

protected:
    std::string name_;
};

class SummarizerAgent : public Agent {
public:
    SummarizerAgent() : Agent("Summarizer") {}

    std::string infer(const std::string& prompt) const override {
        if (contains_any(prompt, {"c++", "compile", "build", "header", "class"})) {
            return "Summarize the task into code structure first, then implement one clear C++ file with minimal dependencies.";
        }
        return "Provide a concise, direct answer focused on the core requirement.";
    }
};

class AnalystAgent : public Agent {
public:
    AnalystAgent() : Agent("Analyst") {}

    std::string infer(const std::string& prompt) const override {
        if (contains_any(prompt, {"agent", "agents", "multiple", "variety"})) {
            return "Model the problem as a dispatcher over several specialized agents: planner, coder, reviewer, and aggregator.";
        }
        return "Break the request into steps, identify constraints, and verify assumptions before acting.";
    }
};

class CoderAgent : public Agent {
public:
    CoderAgent() : Agent("Coder") {}

    std::string infer(const std::string& prompt) const override {
        if (contains_any(prompt, {"c++", "file", "example"})) {
            return "Create a single .cpp file with structs/classes, a vector of agents, and a loop that gathers their outputs.";
        }
        return "Generate implementation-oriented output with concrete data structures and functions.";
    }
};

class ReviewerAgent : public Agent {
public:
    ReviewerAgent() : Agent("Reviewer") {}

    std::string infer(const std::string& prompt) const override {
        if (contains_any(prompt, {"inference", "agent", "ai"})) {
            return "Check for clarity, portability, and compileability; keep the demo dependency-free and explain that it is a pattern, not a real LLM backend.";
        }
        return "Validate the solution for edge cases and note missing assumptions.";
    }
};

class Orchestrator {
public:
    void add_agent(const Agent* agent) { agents_.push_back(agent); }

    std::vector<AgentResult> run_all(const std::string& prompt) const {
        std::vector<AgentResult> results;
        results.reserve(agents_.size());
        for (const auto* agent : agents_) {
            results.push_back({agent->name(), agent->infer(prompt)});
        }
        return results;
    }

    std::string aggregate(const std::vector<AgentResult>& results) const {
        std::string merged = "Aggregated answer:\n";
        for (const auto& r : results) {
            merged += "- [" + r.name + "] " + r.output + "\n";
        }
        merged += "\nSuggested final plan: use a multi-agent pipeline with specialized roles, then merge outputs into a single response or decision.";
        return merged;
    }

private:
    std::vector<const Agent*> agents_;
};

int main() {
    const std::string prompt =
        "Create a file to inference with a variety of AI agents in C++.";

    SummarizerAgent summarizer;
    AnalystAgent analyst;
    CoderAgent coder;
    ReviewerAgent reviewer;

    Orchestrator orchestrator;
    orchestrator.add_agent(&summarizer);
    orchestrator.add_agent(&analyst);
    orchestrator.add_agent(&coder);
    orchestrator.add_agent(&reviewer);

    const auto results = orchestrator.run_all(prompt);

    std::cout << "Prompt: " << prompt << "\n\n";
    std::cout << "Individual agent outputs:\n";
    for (const auto& r : results) {
        std::cout << "[" << r.name << "] " << r.output << "\n";
    }

    std::cout << "\n" << orchestrator.aggregate(results) << "\n";
    return 0;
}
