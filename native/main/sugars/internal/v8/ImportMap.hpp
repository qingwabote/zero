#pragma once

#include <filesystem>
#include <unordered_map>

namespace sugar::v8
{
    namespace
    {
        // https://cplusplus.github.io/LWG/issue3657
        struct path_hash
        {
            size_t operator()(const std::filesystem::path &path) const
            {
                return std::filesystem::hash_value(path);
            }
        };
    }

    using Imports = std::unordered_map<std::string, std::filesystem::path>;
    using Scopes = std::unordered_map<std::filesystem::path, Imports, path_hash>;

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