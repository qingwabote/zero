#pragma once

#include <spine/Atlas.h>
#include <spine/SkeletonData.h>
#include <spine/SkeletonBinary.h>

#ifdef __cplusplus
extern "C"
{
#endif

    spSkeletonBinary *spiSkeletonBinary_create(spAtlas *atlas);

    const char *spiSkeletonBinary_getError(spSkeletonBinary *self);

    void spiSkeletonBinary_dispose(spSkeletonBinary *self);

    void spiSkeletonBinary_setScale(spSkeletonBinary *self, float scale);

    spSkeletonData *spiSkeletonBinary_readSkeletonData(spSkeletonBinary *self, const unsigned char *binary, const int length);

#ifdef __cplusplus
}
#endif