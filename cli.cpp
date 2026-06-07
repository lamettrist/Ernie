#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>

namespace fs = std::filesystem;

static std::string readFile(const fs::path& p) {
    std::ifstream in(p, std::ios::binary);
    if (!in) return {};
    std::ostringstream ss;
    ss << in.rdbuf();
    return ss.str();
}

static bool writeFile(const fs::path& p, const std::string& content) {
    std::ofstream out(p, std::ios::binary);
    if (!out) return false;
    out << content;
    return true;
}

static std::string escapeJson(const std::string& s) {
    std::string out;
    out.reserve(s.size() + 32);
    for (char c : s) {
        switch (c) {
            case '\\': out += "\\\\"; break;
            case '"': out += "\\\""; break;
            case '\n': out += "\\n"; break;
            case '\r': break;
            case '\t': out += "\\t"; break;
            default: out += c; break;
        }
    }
    return out;
}

int main(int argc, char** argv) {
    if (argc < 3) {
        std::cerr << "Usage: " << argv[0] << " <script.js> <prompt> [model]\n";
        return 1;
    }

    fs::path script = argv[1];
    if (!fs::exists(script)) {
        std::cerr << "Script not found: " << script << "\n";
        return 1;
    }

    std::string prompt = argv[2];
    std::string model = (argc >= 4) ? argv[3] : "medium";

    const fs::path tmpDir = fs::temp_directory_path() / "ernie-cli-bridge";
    fs::create_directories(tmpDir);
    const fs::path requestPath = tmpDir / "request.json";
    const fs::path responsePath = tmpDir / "response.json";

    std::ostringstream req;
    req << "{\n"
        << "  \"prompt\": \"" << escapeJson(prompt) << "\",\n"
        << "  \"model\": \"" << escapeJson(model) << "\",\n"
        << "  \"cwd\": \"" << escapeJson(fs::current_path().string()) << "\",\n"
        << "  \"responsePath\": \"" << escapeJson(responsePath.string()) << "\",\n"
        << "  \"requestPath\": \"" << escapeJson(requestPath.string()) << "\"\n"
        << "}\n";

    if (!writeFile(requestPath, req.str())) {
        std::cerr << "Failed to write request file\n";
        return 1;
    }

    std::string cmd = "bun " + script.string() + " " + requestPath.string();
    int code = std::system(cmd.c_str());
    if (code != 0) {
        std::cerr << "JavaScript exited with code " << code << "\n";
        return code;
    }

    std::string response = readFile(responsePath);
    if (response.empty()) {
        std::cerr << "No response written to " << responsePath << "\n";
        return 1;
    }

    std::cout << response;
    return 0;
}
