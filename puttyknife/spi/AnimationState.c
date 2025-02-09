#include <spi/AnimationState.h>

spAnimationState *spiAnimationState_create(spSkeletonData *skeletonData)
{

    return spAnimationState_create(spAnimationStateData_create(skeletonData));
}

void spiAnimationState_dispose(spAnimationState *self)
{
    spAnimationStateData_dispose(self->data);
    spAnimationState_dispose(self);
}

spTrackEntry *spiAnimationState_addAnimationByName(spAnimationState *self, int trackIndex, const char *animationName,
                                                   int /*bool*/ loop, float delay)
{
    return spAnimationState_addAnimationByName(self, trackIndex, animationName, loop, delay);
}

void spiAnimationState_update(spAnimationState *self, float delta)
{
    spAnimationState_update(self, delta);
}

int spiAnimationState_apply(spAnimationState *self, spSkeleton *skeleton)
{
    return spAnimationState_apply(self, skeleton);
}