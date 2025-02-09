#pragma once

#include <spine/SkeletonData.h>
#include <spine/AnimationState.h>
#include <spine/Skeleton.h>

#ifdef __cplusplus
extern "C"
{
#endif

    spAnimationState *spiAnimationState_create(spSkeletonData *skeletonData);

    void spiAnimationState_dispose(spAnimationState *self);

    spTrackEntry *spiAnimationState_addAnimationByName(spAnimationState *self, int trackIndex, const char *animationName,
                                                       int /*bool*/ loop, float delay);

    void spiAnimationState_update(spAnimationState *self, float delta);

    int spiAnimationState_apply(spAnimationState *self, spSkeleton *skeleton);

#ifdef __cplusplus
}
#endif