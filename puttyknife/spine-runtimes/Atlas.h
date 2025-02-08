#include <spine/Atlas.h>

spAtlas *spiAtlas_create(const char *data, int length, const char *dir, void *rendererObject);

spAtlasPage *spiAtlas_getPages(const spAtlas *self);

spAtlasPage *spiAtlasPage_getNext(spAtlasPage *self);

const char *spiAtlasPage_getName(spAtlasPage *self);

void spiAtlasPage_setRendererObject(spAtlasPage *self, void *rendererObject);