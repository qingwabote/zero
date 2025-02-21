#pragma once

#include <yoga/YGNode.h>
#include <memory>
#include "../../../portation.h"

YG_EXTERN_C_BEGIN

PK_EXPORT YGNodeRef YGNodeNew_PK();

PK_EXPORT void YGNodeFree_PK(YGNodeRef node);

PK_EXPORT YGSize *YGSizeNew(float width = 0, float height = 0);

PK_EXPORT void YGSizeSet(YGSize *size, float width, float height);

PK_EXPORT void YGSizeFree(YGSize *size);

YG_EXTERN_C_END
