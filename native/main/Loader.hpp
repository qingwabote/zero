#pragma once

#include <string>
#include <memory>
#include "base/UniqueFunction.hpp"

namespace loader
{
    class Result
    {
    private:
        std::unique_ptr<char[]> _text{nullptr};

    public:
        Result(std::unique_ptr<char[]> text) : _text(std::move(text)) {}

        std::unique_ptr<char[]> takeText()
        {
            return std::move(_text);
        }
    };

    class Loader
    {
    public:
        static Loader &instance();

        void load(const std::string &path, UniqueFunction<void, std::unique_ptr<Result>> &&callback);
    };
}
