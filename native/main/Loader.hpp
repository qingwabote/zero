#pragma once

#include <string>
#include <vector>
#include <memory>
#include <filesystem>
#include "base/TaskRunner.hpp"
#include "ImageBitmap.hpp"

namespace loader
{
    class Result
    {
    private:
        std::string _error;

        std::unique_ptr<char[]> _text{nullptr};

        std::unique_ptr<std::vector<char>> _buffer{nullptr};

        std::unique_ptr<ImageBitmap> _bitmap{nullptr};

    public:
        Result(std::string &&error) : _error(std::move(error)) {}

        Result(std::unique_ptr<char[]> text) : _text(std::move(text)) {}

        Result(std::unique_ptr<std::vector<char>> buffer) : _buffer(std::move(buffer)) {}

        Result(std::unique_ptr<ImageBitmap> bitmap) : _bitmap(std::move(bitmap)) {}

        std::string &error() { return _error; }

        /*C String*/
        std::unique_ptr<char[]> takeText() { return std::move(_text); }

        std::unique_ptr<std::vector<char>> takeBuffer() { return std::move(_buffer); }

        std::shared_ptr<ImageBitmap> takeBitmap() { return std::move(_bitmap); }
    };

    class Loader
    {
    private:
        static uint32_t _taskCount;

        std::filesystem::path _currentPath;

        TaskRunner *_foreground{nullptr};
        TaskRunner *_background{nullptr};

    public:
        uint32_t taskCount() { return Loader::_taskCount; }

        Loader(std::filesystem::path currentPath, TaskRunner *foreground, TaskRunner *background)
            : _currentPath(currentPath), _foreground(foreground), _background(background) {}

        void load(const std::string &path, const std::string &type, std::unique_ptr<callable::Callable<void, std::unique_ptr<Result>>> &&callback);
    };
}
