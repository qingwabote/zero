#pragma once

#include <string>
#include "base/UniqueFunction.hpp"

class Loader
{
public:
    static Loader &instance();

    void load(const std::string &path, UniqueFunction &&callback);
};
