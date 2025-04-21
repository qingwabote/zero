#include <cstdlib>
#include "../portation.h"

PK_EXPORT void *aligned_alloc(size_t alignment, size_t size)
{
    void *ptr = nullptr;
    posix_memalign(&ptr, alignment, size);
    return ptr;
}