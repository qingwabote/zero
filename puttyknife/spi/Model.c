#include <spi/Model.h>

#define VERTEX_STRIDE 4 /*xyuv*/

int spiSubModel_getRange(spiSubModel *self)
{
    return self->range;
}

spBlendMode spiSubModel_getBlend(spiSubModel *self)
{
    return self->blend;
}

void *spiSubModel_getRendererObject(spiSubModel *self)
{
    return self->rendererObject;
}

_SP_ARRAY_IMPLEMENT_TYPE(spiSubModelArray, spiSubModel *)

spiModel *spiModel_create()
{
    spiModel *model = NEW(spiModel);
    model->vertices = spFloatArray_create(1024);
    model->indices = spUnsignedShortArray_create(512);
    model->subModels = spiSubModelArray_create(0);
    return model;
}

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

int spiModel_getVerticesSize(spiModel *self)
{
    return self->vertices->size;
}

float *spiModel_getVertices(spiModel *self)
{
    return self->vertices->items;
}

int spiModel_getIndicesSize(spiModel *self)
{
    return self->indices->size;
}

unsigned short *spiModel_getIndices(spiModel *self)
{
    return self->indices->items;
}

int spiModel_getSubModelsSize(spiModel *self)
{
    return self->subModels->size;
}

spiSubModel **spiModel_getSubModels(spiModel *self)
{
    return self->subModels->items;
}

void spiModel_update(spiModel *self, const spSkeleton *skeleton)
{
    static unsigned short quadIndices[6] = {0, 1, 2, 2, 3, 0};

    static spSkeletonClipping *clipper = 0;
    if (!clipper)
    {
        clipper = spSkeletonClipping_create();
    }

    spSkeleton_updateWorldTransform(skeleton, 0);

    spiSubModelArray_clear(self->subModels);
    int model_vertexCount = 0;
    int model_indexCount = 0;
    for (int i = 0; i < skeleton->slotsCount; i++)
    {
        spSlot *slot = skeleton->drawOrder[i];
        spAttachment *attachment = slot->attachment;
        if (!attachment)
        {
            continue;
        }

        int vertexCount = 0;
        unsigned short *indices = 0;
        int indexCount = 0;

        void *rendererObject = 0;

        if (attachment->type == SP_ATTACHMENT_REGION)
        {
            spRegionAttachment *region = (spRegionAttachment *)attachment;

            vertexCount = 4;
            float *vertices = spFloatArray_setSize(self->vertices, (model_vertexCount + vertexCount) * VERTEX_STRIDE)->items + model_vertexCount * VERTEX_STRIDE;
            spRegionAttachment_computeWorldVertices(region, slot, vertices, 0, VERTEX_STRIDE);
            for (int i = 0; i < vertexCount; i++)
            {
                vertices[VERTEX_STRIDE * i + 2] = region->uvs[2 * i];
                vertices[VERTEX_STRIDE * i + 3] = region->uvs[2 * i + 1];
            }

            indices = quadIndices;
            indexCount = 6;

            rendererObject = ((spAtlasRegion *)region->rendererObject)->page->rendererObject;
        }
        else if (attachment->type == SP_ATTACHMENT_MESH)
        {
            spMeshAttachment *mesh = (spMeshAttachment *)attachment;

            vertexCount = SUPER(mesh)->worldVerticesLength >> 1;
            float *vertices = spFloatArray_setSize(self->vertices, (model_vertexCount + vertexCount) * VERTEX_STRIDE)->items + model_vertexCount * VERTEX_STRIDE;
            spVertexAttachment_computeWorldVertices(SUPER(mesh), slot, 0, SUPER(mesh)->worldVerticesLength, vertices, 0, VERTEX_STRIDE);
            for (int i = 0; i < vertexCount; i++)
            {
                vertices[VERTEX_STRIDE * i + 2] = mesh->uvs[2 * i];
                vertices[VERTEX_STRIDE * i + 3] = mesh->uvs[2 * i + 1];
            }

            indices = mesh->triangles;
            indexCount = mesh->trianglesCount;

            rendererObject = ((spAtlasRegion *)mesh->rendererObject)->page->rendererObject;
        }
        else if (attachment->type == SP_ATTACHMENT_CLIPPING)
        {
            spSkeletonClipping_clipStart(clipper, slot, (spClippingAttachment *)slot->attachment);
            continue;
        }
        else
        {
            spSkeletonClipping_clipEnd(clipper, slot);
            // printf("unimplemented\n");
            continue;
        }

        if (spSkeletonClipping_isClipping(clipper))
        {
            float *vertices = self->vertices->items + model_vertexCount * VERTEX_STRIDE;
            spSkeletonClipping_clipTriangles(clipper, vertices, vertexCount * VERTEX_STRIDE, indices, indexCount, vertices + 2, VERTEX_STRIDE);
            float *positions = clipper->clippedVertices->items;
            float *uvs = clipper->clippedUVs->items;
            vertexCount = clipper->clippedVertices->size >> 1;
            vertices = spFloatArray_setSize(self->vertices, (model_vertexCount + vertexCount) * VERTEX_STRIDE)->items + model_vertexCount * VERTEX_STRIDE;
            for (int i = 0; i < vertexCount; i++)
            {
                vertices[VERTEX_STRIDE * i] = positions[2 * i];
                vertices[VERTEX_STRIDE * i + 1] = positions[2 * i + 1];
                vertices[VERTEX_STRIDE * i + 2] = uvs[2 * i];
                vertices[VERTEX_STRIDE * i + 3] = uvs[2 * i + 1];
            }

            indices = clipper->clippedTriangles->items;
            indexCount = clipper->clippedTriangles->size;
        }

        unsigned short *model_indices = spUnsignedShortArray_setSize(self->indices, model_indexCount + indexCount)->items;
        for (int i = 0; i < indexCount; i++)
        {
            model_indices[model_indexCount + i] = indices[i] + model_vertexCount;
        }

        model_indexCount += indexCount;
        model_vertexCount += vertexCount;

        spSkeletonClipping_clipEnd(clipper, slot);

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
    spSkeletonClipping_clipEnd2(clipper);
}
