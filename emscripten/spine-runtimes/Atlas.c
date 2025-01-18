#include <emscripten.h>
#include <spine/Atlas.h>

EMSCRIPTEN_KEEPALIVE
spAtlas *spiAtlas_create(const char *data, int length, const char *dir, void *rendererObject)
{
    return spAtlas_create(data, length, dir, rendererObject);
}

EMSCRIPTEN_KEEPALIVE
spAtlasPage *spiAtlas_getPages(const spAtlas *self)
{
    return self->pages;
}

EMSCRIPTEN_KEEPALIVE
spAtlasPage *spiAtlasPage_getNext(spAtlasPage *self)
{
    return self->next;
}

EMSCRIPTEN_KEEPALIVE
const char *spiAtlasPage_getName(spAtlasPage *self)
{
    return self->name;
}

EMSCRIPTEN_KEEPALIVE
void spiAtlasPage_setRendererObject(spAtlasPage *self, void *rendererObject)
{
    self->rendererObject = rendererObject;
}