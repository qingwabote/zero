#include <emscripten.h>
#include <spine/Skeleton.h>

EMSCRIPTEN_KEEPALIVE
spSkeleton *spiSkeleton_create(spSkeletonData *data)
{
    return spSkeleton_create(data);
}

EMSCRIPTEN_KEEPALIVE
void spiSkeleton_dispose(spSkeleton *self)
{
    spSkeleton_dispose(self);
}

EMSCRIPTEN_KEEPALIVE
void spiSkeleton_update(spSkeleton *self, float deltaTime)
{
    spSkeleton_update(self, deltaTime);
}
