#pragma once

#include <cstdlib>

namespace sted
{
#ifdef _WIN32
        inline void *aligned_alloc(size_t alignment, size_t size)
        {
                return _aligned_malloc(size, alignment);
        }

        inline void *malloc(size_t size)
        {
                return _aligned_malloc(size, 16);
        }

        inline void free(void *ptr)
        {
                _aligned_free(ptr);
        }
#else
        inline void *aligned_alloc(size_t alignment, size_t size)
        {
                void *ptr = nullptr;
                posix_memalign(&ptr, alignment, size);
                return ptr;
        }

        inline void *malloc(size_t size)
        {
                return ::malloc(size);
        }

        inline void free(void *ptr)
        {
                ::free(ptr);
        }
#endif
}
