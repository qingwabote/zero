#pragma once

#include <yoga/YGNode.h>

YG_EXTERN_C_BEGIN

YGSize *YGSizeNew(float width, float height);

void YGSizeFree(YGSize *size);

YG_EXTERN_C_END
