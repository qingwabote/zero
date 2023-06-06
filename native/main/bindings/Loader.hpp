#pragma once

#include "Binding.hpp"
#include "base/TaskRunner.hpp"
#include <filesystem>

namespace binding
{
    class Loader : public Binding
    {
    private:
        std::filesystem::path _currentPath;

        TaskRunner *_foreground;
        TaskRunner *_background;

    protected:
        virtual v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Loader(std::filesystem::path currentPath, TaskRunner *foreground, TaskRunner *background)
            : Binding(), _currentPath(currentPath), _foreground(foreground), _background(background) {}

        v8::Local<v8::Promise> load(std::filesystem::path path, const std::string type);

        ~Loader() {}
    };
}