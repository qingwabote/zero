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
    model->subModels = spiSubModelArray_create(0);
    return model;
}

EMSCRIPTEN_KEEPALIVE
void spiModel_dispose(spiModel *self)
{
    spFloatArray_dispose(self->vertices);

    spUnsignedShortArray_dispose(self->indices);

    for (int i = 0; i < self->subModels->capacity; i++)
    {
        FREE(self->subModels->items[i]);
    }
    spiSubModelArray_dispose(self->subModels);

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

    spiSubModelArray_clear(self->subModels);
    int model_vertexCount = 0;
    int model_indexCount = 0;
    for (int i = 0; i < skeleton->slotsCount; i++)
    {
        spSlot *slot = skeleton->drawOrder[i];
        spAttachment *attachment = slot->attachment;
        if (!attachment)
            continue;

        float *uvs = 0;
        int vertexCount = 0;
        unsigned short *indices = 0;
        int indexCount = 0;

        void *rendererObject = 0;

        if (attachment->type == SP_ATTACHMENT_REGION)
        {
            float *vertices = spFloatArray_setSize(self->vertices, (model_vertexCount + 4) * 4)->items;
            spRegionAttachment *region = (spRegionAttachment *)attachment;
            spRegionAttachment_computeWorldVertices(region, slot->bone, vertices, model_vertexCount * 4, 4 /*xyuv*/);
            uvs = region->uvs;
            vertexCount = 4;
            indices = quadIndices;
            indexCount = 6;

            rendererObject = ((spAtlasRegion *)region->rendererObject)->page->rendererObject;
        }
        else if (attachment->type == SP_ATTACHMENT_MESH)
        {
            spMeshAttachment *mesh = (spMeshAttachment *)attachment;
            rendererObject = ((spAtlasRegion *)mesh->rendererObject)->page->rendererObject;
            printf("SP_ATTACHMENT_MESH unimplemented\n");
        }
        else
        {
            printf("unimplemented\n");
        }

        if (rendererObject)
        {
            float *model_vertices = self->vertices->items;
            for (int i = 0; i < vertexCount; i++)
            {
                model_vertices[(model_vertexCount + i) * 4 + 2] = uvs[2 * i];
                model_vertices[(model_vertexCount + i) * 4 + 3] = uvs[2 * i + 1];
            }

            unsigned short *model_indices = spUnsignedShortArray_setSize(self->indices, model_indexCount + indexCount)->items;
            for (int i = 0; i < indexCount; i++)
            {
                model_indices[model_indexCount + i] = indices[i] + model_vertexCount;
            }

            model_indexCount += indexCount;
            model_vertexCount += vertexCount;

            spiSubModel *subModel = self->subModels->size ? spiSubModelArray_peek(self->subModels) : 0;
            if (subModel)
            {
                if (subModel->blend == slot->data->blendMode && subModel->rendererObject == rendererObject)
                {
                    subModel->range += indexCount;
                    continue;
                }
            }

            if (self->subModels->size < self->subModels->capacity)
            {
                spiSubModelArray_setSize(self->subModels, self->subModels->size + 1);
                subModel = spiSubModelArray_peek(self->subModels);
            }
            else
            {
                spiSubModelArray_ensureCapacity(self->subModels, self->subModels->size + 1); // ensure capacity add one at a time
                subModel = NEW(spiSubModel);
                spiSubModelArray_add(self->subModels, subModel);
            }
            subModel->blend = slot->data->blendMode;
            subModel->rendererObject = rendererObject;
            subModel->range = indexCount;
        }
    }
}
