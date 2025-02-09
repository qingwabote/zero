#include <spi/Atlas.h>

spAtlas *spiAtlas_create(const char *data, int length)
{
    return spAtlas_create(data, length, "", 0);
}

spAtlasPage *spiAtlas_getPages(const spAtlas *self)
{
    return self->pages;
}

spAtlasPage *spiAtlasPage_getNext(spAtlasPage *self)
{
    return self->next;
}

const char *spiAtlasPage_getName(spAtlasPage *self)
{
    return self->name;
}

void spiAtlasPage_setRendererObject(spAtlasPage *self, void *rendererObject)
{
    self->rendererObject = rendererObject;
}