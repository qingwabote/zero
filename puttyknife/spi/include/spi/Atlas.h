#pragma once

#include <spine/Atlas.h>

#ifdef __cplusplus
extern "C"
{
#endif

    spAtlas *spiAtlas_create(const char *data, int length);

    spAtlasPage *spiAtlas_getPages(const spAtlas *self);

    spAtlasPage *spiAtlasPage_getNext(spAtlasPage *self);

    const char *spiAtlasPage_getName(spAtlasPage *self);

    void spiAtlasPage_setRendererObject(spAtlasPage *self, void *rendererObject);

#ifdef __cplusplus
}
#endif