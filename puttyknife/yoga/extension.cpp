#include <yoga/extension.h>
#include <yoga/context.h>

YG_EXTERN_C_BEGIN

YGNodeRef YGNodeNew_PK()
{
    void *context = YGNodeContextNew();
    auto node = YGNodeNew();
    YGNodeSetContext(node, context);
    return node;
}

void YGNodeFree_PK(YGNodeRef node)
{
    YGNodeContextFree(YGNodeGetContext(node));
    YGNodeFree(node);
}

YGSize *YGSizeNew(float width, float height)
{
    return new YGSize{width, height};
}

void YGSizeSet(YGSize *size, float width, float height)
{
    size->width = width;
    size->height = height;
}

void YGSizeFree(YGSize *size)
{
    delete size;
}

YG_EXTERN_C_END