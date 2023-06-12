#include "Loader.hpp"

#include "log.h"

namespace loader
{
    Loader &Loader::instance()
    {
        static Loader instance;
        return instance;
    }

    void Loader::load(const std::string &path, UniqueFunction<void, std::unique_ptr<Result>> &&callback)
    {
        ZERO_LOG("%s", path.c_str());

        std::unique_ptr<char[]> text{new char[4]};
        strcpy(text.get(), "abc");

        callback(std::make_unique<Result>(std::move(text)));
    }
}