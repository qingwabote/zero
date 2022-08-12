#pragma once

#include <memory>

namespace zero
{
    typedef std::unique_ptr<char, void (*)(char *)> unique_char;

    unique_char readUtf8(const char *file);
}