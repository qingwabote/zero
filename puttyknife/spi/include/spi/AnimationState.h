#pragma once

#include <spine/SkeletonData.h>
#include <spine/AnimationState.h>
#include <spine/Skeleton.h>
#include "../../../portation.h"

#ifdef __cplusplus
extern "C"
{
#endif

    PK_EXPORT spAnimationState *spiAnimationState_create(spSkeletonData *skeletonData);

    PK_EXPORT void spiAnimationState_dispose(spAnimationState *self);

    PK_EXPORT spTrackEntry *spiAnimationState_addAnimationByName(spAnimationState *self, int trackIndex, const char *animationName,
                                                                 int /*bool*/ loop, float delay);

    PK_EXPORT void spiAnimationState_update(spAnimationState *self, float delta);

    PK_EXPORT int spiAnimationState_apply(spAnimationState *self, spSkeleton *skeleton);

#ifdef __cplusplus
}
#endif