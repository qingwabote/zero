#include "ImportMap.hpp"
#include "log.h"
#include <fstream>
#include <nlohmann/json.hpp>

namespace sugar::v8
{
    namespace
    {
        bool imports_parse(nlohmann::json &in, Imports &out)
        {
            for (auto &&i : in.items())
            {
                std::error_code ec;
                auto path = std::filesystem::canonical(i.value(), ec);
                if (ec)
                {
                    ZERO_LOG_ERROR("%s %s", ec.message().c_str(), i.value().dump().c_str());
                    return true;
                }
                out.emplace(i.key(), path);
            }
            return false;
        }

        std::filesystem::path imports_resolve(const std::string &specifier, const Imports &imports)
        {
            auto it = imports.find(specifier);
            if (it != imports.end())
            {
                return it->second;
            }

            return {};
        }
    }

    bool ImportMap::initialize(std::filesystem::path &file)
    {
        std::error_code ec;
        std::uintmax_t size = std::filesystem::file_size(file, ec);
        if (ec)
        {
            ZERO_LOG_ERROR("failed to get size of %s, %s", file.string().c_str(), ec.message().c_str());
            return true;
        }

        std::unique_ptr<char[]> buffer{new char[size]};

        std::ifstream stream{file, std::ios::binary};
        stream.read(buffer.get(), size);

        nlohmann::json json;
        try
        {
            json = nlohmann::json::parse(buffer.get(), buffer.get() + size);
        }
        catch (nlohmann::json::parse_error &e)
        {
            ZERO_LOG_ERROR("failed to parse %s %s", file.string().c_str(), e.what());
            return true;
        }

        std::filesystem::current_path(file.parent_path());

        if (imports_parse(json["imports"], _imports))
        {
            return true;
        }

        auto &scopes = json["scopes"];
        for (auto &&i : scopes.items())
        {
            Imports imports;
            if (imports_parse(i.value(), imports))
            {
                return true;
            }
            std::error_code ec;
            auto path = std::filesystem::canonical(i.key(), ec);
            if (ec)
            {
                ZERO_LOG_ERROR("%s", ec.message().c_str());
                return true;
            }
            _scopes.emplace(path, std::move(imports));
        }

        return false;
    }

    std::filesystem::path ImportMap::resolve(const std::string &specifier, const std::filesystem::path &referrer)
    {
        for (const auto &entry : _scopes)
        {
            if (referrer.string().rfind(entry.first.string(), 0) != std::string::npos)
            {
                auto path = imports_resolve(specifier, entry.second);
                if (!path.empty())
                {
                    return path;
                }
            }
        }

        return imports_resolve(specifier, _imports);
    }
}