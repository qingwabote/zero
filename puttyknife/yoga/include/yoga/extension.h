#pragma once

#include <yoga/YGNode.h>
#include <memory>

YG_EXTERN_C_BEGIN

YGNodeRef YGNodeNew_PK();

void YGNodeFree_PK(YGNodeRef node);

YGSize *YGSizeNew(float width = 0, float height = 0);

void YGSizeSet(YGSize *size, float width, float height);

void YGSizeFree(YGSize *size);

YG_EXTERN_C_END
