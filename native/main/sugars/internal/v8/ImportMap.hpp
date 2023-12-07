#pragma once

#include <filesystem>
#include <unordered_map>

namespace sugar::v8
{
    using Imports = std::unordered_map<std::string, std::filesystem::path>;
    using Scopes = std::unordered_map<std::filesystem::path, Imports>;

    class ImportMap
    {
    private:
        Imports _imports;
        Scopes _scopes;

    public:
        bool initialize(std::filesystem::path &file);

        std::filesystem::path resolve(const std::string &specifier, const std::filesystem::path &referrer);
    };
}