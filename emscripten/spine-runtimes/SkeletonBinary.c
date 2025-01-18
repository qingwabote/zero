#include <emscripten.h>
#include <spine/Atlas.h>
#include <spine/SkeletonData.h>
#include <spine/SkeletonBinary.h>

EMSCRIPTEN_KEEPALIVE
spSkeletonBinary *spiSkeletonBinary_create(spAtlas *atlas)
{
    return spSkeletonBinary_create(atlas);
}

EMSCRIPTEN_KEEPALIVE
const char *spiSkeletonBinary_getError(spSkeletonBinary *self)
{
    return self->error;
}

EMSCRIPTEN_KEEPALIVE
void spiSkeletonBinary_dispose(spSkeletonBinary *self)
{
    spSkeletonBinary_dispose(self);
}

EMSCRIPTEN_KEEPALIVE
void spiSkeletonBinary_setScale(spSkeletonBinary *self, float scale)
{
    self->scale = scale;
}

EMSCRIPTEN_KEEPALIVE
spSkeletonData *spiSkeletonBinary_readSkeletonData(spSkeletonBinary *self, const unsigned char *binary, const int length)
{
    return spSkeletonBinary_readSkeletonData(self, binary, length);
}