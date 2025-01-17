#include <emscripten.h>
#include <spine/spine.h>
#include <spine/extension.h>
#include <stdio.h>

typedef struct spiSubModel
{
    int range;
    spBlendMode blend;
    void *rendererObject;
} spiSubModel;

EMSCRIPTEN_KEEPALIVE
int spiSubModel_getRange(spiSubModel *self)
{
    return self->range;
}

EMSCRIPTEN_KEEPALIVE
spBlendMode spiSubModel_getBlend(spiSubModel *self)
{
    return self->blend;
}

EMSCRIPTEN_KEEPALIVE
void *spiSubModel_getRendererObject(spiSubModel *self)
{
    return self->rendererObject;
}

_SP_ARRAY_DECLARE_TYPE(spiSubModelArray, spiSubModel *)
_SP_ARRAY_IMPLEMENT_TYPE(spiSubModelArray, spiSubModel *)

typedef struct spiModel
{
    spFloatArray *vertices;
    spUnsignedShortArray *indices;
    spiSubModelArray *subModels;
} spiModel;

EMSCRIPTEN_KEEPALIVE
spiModel *spiModel_create()
{
    spiModel *model = NEW(spiModel);
    model->vertices = spFloatArray_create(1024);
    model->indices = spUnsignedShortArray_create(512);
    model->subModels = spiSubModelArray_create(1);
    return model;
}

EMSCRIPTEN_KEEPALIVE
void spiModel_dispose(spiModel *self)
{
    FREE(self);
}

EMSCRIPTEN_KEEPALIVE
int spiModel_getVerticesSize(spiModel *self)
{
    return self->vertices->size;
}

EMSCRIPTEN_KEEPALIVE
float *spiModel_getVertices(spiModel *self)
{
    return self->vertices->items;
}

EMSCRIPTEN_KEEPALIVE
int spiModel_getIndicesSize(spiModel *self)
{
    return self->indices->size;
}

EMSCRIPTEN_KEEPALIVE
unsigned short *spiModel_getIndices(spiModel *self)
{
    return self->indices->items;
}

EMSCRIPTEN_KEEPALIVE
int spiModel_getSubModelsSize(spiModel *self)
{
    return self->subModels->size;
}

EMSCRIPTEN_KEEPALIVE
spiSubModel **spiModel_getSubModels(spiModel *self)
{
    return self->subModels->items;
}

EMSCRIPTEN_KEEPALIVE
void spiModel_update(spiModel *self, const spSkeleton *skeleton)
{
    // static float vertexPositions[1];

    static unsigned short quadIndices[6] = {0, 1, 2, 2, 3, 0};

    spSkeleton_updateWorldTransform(skeleton);

    int vertexCount = 0;
    int indexCount = 0;
    void *rendererObject = 0;
    int blend = 0;
    for (int i = 0; i < skeleton->slotsCount; i++)
    {
        spSlot *slot = skeleton->drawOrder[i];
        spAttachment *attachment = slot->attachment;
        if (!attachment)
            continue;

        float *attachment_uvs = 0;
        int attachment_verticesCount = 0;
        unsigned short *attachment_indices = 0;
        int attachment_indicesCount = 0;

        void *attachment_rendererObject = 0;

        if (attachment->type == SP_ATTACHMENT_REGION)
        {
            float *vertices = spFloatArray_setSize(self->vertices, (vertexCount + 4) * 4)->items;
            spRegionAttachment *region = (spRegionAttachment *)attachment;
            spRegionAttachment_computeWorldVertices(region, slot->bone, vertices, vertexCount * 4, 4 /*xyuv*/);
            attachment_uvs = region->uvs;
            attachment_verticesCount = 4;
            attachment_indices = quadIndices;
            attachment_indicesCount = 6;

            attachment_rendererObject = ((spAtlasRegion *)region->rendererObject)->page->rendererObject;
        }
        else if (attachment->type == SP_ATTACHMENT_MESH)
        {
            spMeshAttachment *mesh = (spMeshAttachment *)attachment;
            attachment_rendererObject = ((spAtlasRegion *)mesh->rendererObject)->page->rendererObject;
            printf("SP_ATTACHMENT_MESH unimplemented\n");
        }
        else
        {
            printf("unimplemented\n");
        }

        if (attachment_rendererObject)
        {
            float *vertices = self->vertices->items;
            for (int i = 0; i < attachment_verticesCount; i++)
            {
                vertices[(vertexCount + i) * 4 + 2] = attachment_uvs[2 * i];
                vertices[(vertexCount + i) * 4 + 3] = attachment_uvs[2 * i + 1];
            }

            unsigned short *indices = spUnsignedShortArray_setSize(self->indices, indexCount + attachment_indicesCount)->items;
            for (int i = 0; i < attachment_indicesCount; i++)
            {
                indices[indexCount + i] = attachment_indices[i] + vertexCount;
            }

            indexCount += attachment_indicesCount;
            vertexCount += attachment_verticesCount;

            rendererObject = attachment_rendererObject;

            blend = slot->data->blendMode;
        }
    }

    if (self->subModels->size <= 1)
    {
        int size = self->subModels->size;
        spiSubModelArray_setSize(self->subModels, 1)->items[0] = NEW(spiSubModel);
    }
    for (int i = 0; i < 1; i++)
    {
        spiSubModel *submodel = self->subModels->items[0];
        submodel->range = indexCount;
        submodel->rendererObject = rendererObject;
        submodel->blend = blend;
    }
}
