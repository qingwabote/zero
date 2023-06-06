#include "Loader.hpp"

#include "log.h"

Loader &Loader::instance()
{
    static Loader instance;
    return instance;
}

void Loader::load(const std::string &path, UniqueFunction &&callback)
{
    ZERO_LOG("%s", path.c_str());
    callback();
}