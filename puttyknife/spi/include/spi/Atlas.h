#pragma once

#include <spine/Atlas.h>
#include <stdint.h>
#include "../../../portation.h"

#ifdef __cplusplus
extern "C"
{
#endif

    PK_EXPORT spAtlas *spiAtlas_create(const char *data, int length);

    PK_EXPORT spAtlasPage *spiAtlas_getPages(const spAtlas *self);

    PK_EXPORT spAtlasPage *spiAtlasPage_getNext(spAtlasPage *self);

    PK_EXPORT const char *spiAtlasPage_getName(spAtlasPage *self);

    PK_EXPORT void spiAtlasPage_setRendererObject(spAtlasPage *self, uintptr_t rendererObject);

#ifdef __cplusplus
}
#endif