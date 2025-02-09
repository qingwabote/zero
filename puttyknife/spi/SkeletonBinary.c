#include <spi/SkeletonBinary.h>

spSkeletonBinary *spiSkeletonBinary_create(spAtlas *atlas)
{
    return spSkeletonBinary_create(atlas);
}

const char *spiSkeletonBinary_getError(spSkeletonBinary *self)
{
    return self->error;
}

void spiSkeletonBinary_dispose(spSkeletonBinary *self)
{
    spSkeletonBinary_dispose(self);
}

void spiSkeletonBinary_setScale(spSkeletonBinary *self, float scale)
{
    self->scale = scale;
}

spSkeletonData *spiSkeletonBinary_readSkeletonData(spSkeletonBinary *self, const unsigned char *binary, const int length)
{
    return spSkeletonBinary_readSkeletonData(self, binary, length);
}