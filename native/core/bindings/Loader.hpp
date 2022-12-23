#pragma once

#include "Binding.hpp"
#include <filesystem>
#include "base/threading/ThreadSafeQueue.hpp"
#include "base/UniqueFunction.hpp"

namespace binding
{
    class Loader : public Binding
    {
    private:
        std::filesystem::path _currentPath;

    protected:
        virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Loader(std::filesystem::path currentPath) : Binding(), _currentPath(currentPath) {}

        v8::Local<v8::Promise> load(std::filesystem::path path, const std::string type);

        ~Loader() {}
    };
}