#pragma once

#include <spine/Skeleton.h>
#include "../../../portation.h"

#ifdef __cplusplus
extern "C"
{
#endif

    PK_EXPORT spSkeleton *spiSkeleton_create(spSkeletonData *data);

    PK_EXPORT void spiSkeleton_dispose(spSkeleton *self);

    PK_EXPORT void spiSkeleton_update(spSkeleton *self, float deltaTime);

#ifdef __cplusplus
}
#endif
