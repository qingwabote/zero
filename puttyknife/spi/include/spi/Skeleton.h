#pragma once

#include <spine/Skeleton.h>

#ifdef __cplusplus
extern "C"
{
#endif

    spSkeleton *spiSkeleton_create(spSkeletonData *data);

    void spiSkeleton_dispose(spSkeleton *self);

    void spiSkeleton_update(spSkeleton *self, float deltaTime);

#ifdef __cplusplus
}
#endif
