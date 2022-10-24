#pragma once

#include "Binding.hpp"
#include <filesystem>
#include "ThreadSafeQueue.hpp"

namespace binding
{
    struct LoaderItem
    {
        std::string file;
        std::string type;
        v8::Global<v8::Promise::Resolver> resolver;

        LoaderItem(const std::string &file, const char *type, const v8::Local<v8::Promise::Resolver> &resolver)
        {
            this->file = file;
            this->type = type;
            this->resolver.Reset(v8::Isolate::GetCurrent(), resolver);
        }

        // FIXME https://stackoverflow.com/questions/25330716/move-only-version-of-stdfunction
        LoaderItem(const LoaderItem &item)
        {
            throw "should not be here";
        }

        LoaderItem(LoaderItem &&item) noexcept = default;
    };

    class Loader : public Binding
    {
    private:
        static ThreadSafeQueue<LoaderItem> _loaderItemQueue;

        std::filesystem::path _currentPath;
        bool _loaderThreadCreated = false;

    protected:
        virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Loader(std::filesystem::path currentPath) : Binding(), _currentPath(currentPath) {}

        v8::Local<v8::Promise> load(std::filesystem::path path, const char *type);

        ~Loader() {}
    };
}