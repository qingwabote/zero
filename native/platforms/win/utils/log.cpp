#include "utils/log.hpp"
#include <stdio.h>
#include <cstddef>
#include <windows.h>

namespace zero
{
    void log(const char *formats, ...)
    {
        char buff[4096];
        char *p = buff;
        char *last = buff + sizeof(buff) - 3;

        va_list args;
        va_start(args, formats);
        // p += StringUtil::vprintf(p, last, formats, args);

        std::ptrdiff_t count = (last - p);
        int ret = vsnprintf(p, count, formats, args);
        if (ret >= count - 1)
        {
            p += (count - 1);
        }
        else if (ret >= 0)
        {
            p += ret;
        }

        va_end(args);

        *p++ = '\n';
        *p = 0;

        WCHAR wszBuf[4096] = {0};
        MultiByteToWideChar(CP_UTF8, 0, buff, -1, wszBuf, sizeof(wszBuf));
        OutputDebugStringW(wszBuf);
    }
}