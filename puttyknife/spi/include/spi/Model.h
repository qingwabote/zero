#pragma once

#include <spine/spine.h>
#include <spine/extension.h>
#include "../../../portation.h"

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

    PK_EXPORT int spiSubModel_getRange(spiSubModel *self);

    PK_EXPORT spBlendMode spiSubModel_getBlend(spiSubModel *self);

    PK_EXPORT uintptr_t spiSubModel_getRendererObject(spiSubModel *self);

#ifndef SWIG
    _SP_ARRAY_DECLARE_TYPE(spiSubModelArray, spiSubModel *)
#endif

    typedef struct spiModel
    {
        spFloatArray *vertices;
        spUnsignedShortArray *indices;
        spiSubModelArray *subModels;
    } spiModel;

    PK_EXPORT spiModel *spiModel_create();

    PK_EXPORT void spiModel_dispose(spiModel *self);

    PK_EXPORT int spiModel_getVerticesSize(spiModel *self);

    PK_EXPORT float *spiModel_getVertices(spiModel *self);

    PK_EXPORT int spiModel_getIndicesSize(spiModel *self);

    PK_EXPORT unsigned short *spiModel_getIndices(spiModel *self);

    PK_EXPORT int spiModel_getSubModelsSize(spiModel *self);

    PK_EXPORT spiSubModel **spiModel_getSubModels(spiModel *self);

    PK_EXPORT void spiModel_update(spiModel *self, const spSkeleton *skeleton);

#ifdef __cplusplus
}
#endif
