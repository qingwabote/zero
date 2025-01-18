#include <emscripten.h>
#include <spine/SkeletonData.h>
#include <spine/AnimationState.h>
#include <spine/Skeleton.h>

EMSCRIPTEN_KEEPALIVE
spAnimationState *spiAnimationState_create(spSkeletonData *skeletonData)
{

    return spAnimationState_create(spAnimationStateData_create(skeletonData));
}

EMSCRIPTEN_KEEPALIVE
void spiAnimationState_dispose(spAnimationState *self)
{
    spAnimationStateData_dispose(self->data);
    spAnimationState_dispose(self);
}

EMSCRIPTEN_KEEPALIVE
spTrackEntry *spiAnimationState_addAnimationByName(spAnimationState *self, int trackIndex, const char *animationName,
                                                   int /*bool*/ loop, float delay)
{
    return spAnimationState_addAnimationByName(self, trackIndex, animationName, loop, delay);
}

EMSCRIPTEN_KEEPALIVE
void spiAnimationState_update(spAnimationState *self, float delta)
{
    spAnimationState_update(self, delta);
}

EMSCRIPTEN_KEEPALIVE
int spiAnimationState_apply(spAnimationState *self, spSkeleton *skeleton)
{
    return spAnimationState_apply(self, skeleton);
}