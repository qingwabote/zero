#include <yoga/extension.h>

YG_EXTERN_C_BEGIN

YGSize *YGSizeNew(float width, float height)
{
    return new YGSize{width, height};
}

void YGSizeFree(YGSize *size)
{
    delete size;
}

YG_EXTERN_C_END