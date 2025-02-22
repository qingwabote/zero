#pragma once

#include <spine/Atlas.h>
#include <spine/SkeletonData.h>
#include <spine/SkeletonBinary.h>
#include "../../../portation.h"

#ifdef __cplusplus
extern "C"
{
#endif

    PK_EXPORT spSkeletonBinary *spiSkeletonBinary_create(spAtlas *atlas);

    PK_EXPORT const char *spiSkeletonBinary_getError(spSkeletonBinary *self);

    PK_EXPORT void spiSkeletonBinary_dispose(spSkeletonBinary *self);

    PK_EXPORT void spiSkeletonBinary_setScale(spSkeletonBinary *self, float scale);

    PK_EXPORT spSkeletonData *spiSkeletonBinary_readSkeletonData(spSkeletonBinary *self, const unsigned char *binary, const int length);

#ifdef __cplusplus
}
#endif