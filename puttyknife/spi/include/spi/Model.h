#pragma once

#include <spine/spine.h>
#include <spine/extension.h>

#ifdef __cplusplus
extern "C"
{
#endif

    typedef struct spiSubModel
    {
        int range;
        spBlendMode blend;
        void *rendererObject;
    } spiSubModel;

    int spiSubModel_getRange(spiSubModel *self);

    spBlendMode spiSubModel_getBlend(spiSubModel *self);

    void *spiSubModel_getRendererObject(spiSubModel *self);

    _SP_ARRAY_DECLARE_TYPE(spiSubModelArray, spiSubModel *)

    typedef struct spiModel
    {
        spFloatArray *vertices;
        spUnsignedShortArray *indices;
        spiSubModelArray *subModels;
    } spiModel;

    spiModel *spiModel_create();

    void spiModel_dispose(spiModel *self);

    int spiModel_getVerticesSize(spiModel *self);

    float *spiModel_getVertices(spiModel *self);

    int spiModel_getIndicesSize(spiModel *self);

    unsigned short *spiModel_getIndices(spiModel *self);

    int spiModel_getSubModelsSize(spiModel *self);

    spiSubModel **spiModel_getSubModels(spiModel *self);

    void spiModel_update(spiModel *self, const spSkeleton *skeleton);

#ifdef __cplusplus
}
#endif
