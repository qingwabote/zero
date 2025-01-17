#include <emscripten.h>
#include <spine/spine.h>

EMSCRIPTEN_KEEPALIVE
void spiSkeleton_updateWorldTransform(const spSkeleton *self)
{
    spSkeleton_updateWorldTransform(self);
}

EMSCRIPTEN_KEEPALIVE
int spiSkeleton_getSlotsCount(const spSkeleton *self)
{
    return self->slotsCount;
}

EMSCRIPTEN_KEEPALIVE
spSlot **spiSkeleton_getDrawOrder(const spSkeleton *self)
{
    return self->drawOrder;
}

// Slot

EMSCRIPTEN_KEEPALIVE
spAttachment *spiSlot_getAttachment(const spSlot *self)
{
    return self->attachment;
}

EMSCRIPTEN_KEEPALIVE
spBone *spiSlot_getBone(const spSlot *self)
{
    return self->bone;
}

// Attachment

EMSCRIPTEN_KEEPALIVE
spAttachmentType spiAttachment_getType(spAttachment *self)
{
    return self->type;
}

EMSCRIPTEN_KEEPALIVE
void spiRegionAttachment_computeWorldVertices(spRegionAttachment *self, spBone *bone, float *vertices, int offset, int stride)
{
    spRegionAttachment_computeWorldVertices(self, bone, vertices, offset, stride);
}