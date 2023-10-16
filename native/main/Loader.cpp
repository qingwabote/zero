#include "Loader.hpp"

#include <fstream>
#include "log.h"

#define STB_IMAGE_IMPLEMENTATION
#include "internal/stb_image.h"

namespace loader
{
    uint32_t Loader::_taskCount = 0;

    void Loader::load(const std::string &path, const std::string &type, std::unique_ptr<callable::Callable<void, std::unique_ptr<Result>>> &&callback)
    {
        std::filesystem::current_path(_currentPath);
        std::error_code ec;
        std::filesystem::path abs_path = std::filesystem::canonical(path, ec);
        if (ec)
        {
            callback->call(std::make_unique<Result>(ec.message() + ": " + path));
            return;
        }
        std::uintmax_t size = std::filesystem::file_size(abs_path, ec);
        if (ec)
        {
            callback->call(std::make_unique<Result>(ec.message() + ": " + path));
            return;
        }

        auto foreground = _foreground;
        _background->post(new auto(
            [foreground, type, abs_path, size, callback = std::move(callback)]() mutable
            {
                std::unique_ptr<Result> result;
                if (type == "text")
                {
                    std::unique_ptr<char[]> c_str{new char[size + 1]};
                    std::ifstream stream{abs_path.string(), std::ios::binary};
                    stream.read(c_str.get(), size);
                    c_str.get()[size] = '\0';

                    result = std::make_unique<Result>(std::move(c_str));
                }
                else if (type == "buffer")
                {
                    auto buffer = std::make_unique<std::vector<char>>(size);
                    std::ifstream stream{abs_path.string(), std::ios::binary};
                    stream.read(buffer->data(), size);

                    result = std::make_unique<Result>(std::move(buffer));
                }
                else if (type == "bitmap")
                {
                    auto buffer = std::make_unique<std::vector<char>>(size);
                    std::ifstream stream{abs_path.string(), std::ios::binary};
                    stream.read(buffer->data(), size);

                    int x{0}, y{0}, channels{0};
                    std::unique_ptr<void, void (*)(void *)> pixels{
                        stbi_load_from_memory(reinterpret_cast<stbi_uc *>(buffer->data()), size, &x, &y, &channels, STBI_rgb_alpha),
                        stbi_image_free};
                    auto bitmap = std::make_unique<ImageBitmap>(std::move(pixels), x, y);

                    result = std::make_unique<Result>(std::move(bitmap));
                }
                else
                {
                    result = std::make_unique<Result>("unsupported type: " + type);
                }

                foreground->post(new auto(
                    [callback = std::move(callback), result = std::move(result)]() mutable
                    {
                        callback->call(std::move(result));
                        Loader::_taskCount--;
                    }));
            }));

        Loader::_taskCount++;
    }
}