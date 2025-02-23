#include <yoga/Yoga.h>
#include "../wasm/imports.h"
#include "../portation.h"
#include "NodeContext.hpp"

YG_EXTERN_C_BEGIN

PK_EXPORT void YGNodeSetDirtiedFunc_PK(YGNodeRef node, int index)
{
    reinterpret_cast<puttyknife::yoga::NodeContext *>(YGNodeGetContext(node))->dirtiedFunc = index;
    YGNodeSetDirtiedFunc(node,
                         [](YGNodeConstRef node)
                         {
                             int index = reinterpret_cast<puttyknife::yoga::NodeContext *>(YGNodeGetContext(node))->dirtiedFunc;
                             pk_callback_table_invoke(index, node);
                         });
}

PK_EXPORT void YGNodeSetMeasureFunc_PK(YGNodeRef node, int index)
{
    reinterpret_cast<puttyknife::yoga::NodeContext *>(YGNodeGetContext(node))->measureFunc = index;
    YGNodeSetMeasureFunc(node,
                         [](YGNodeConstRef node, float width, YGMeasureMode widthMode, float height, YGMeasureMode heightMode)
                         {
                             int index = reinterpret_cast<puttyknife::yoga::NodeContext *>(YGNodeGetContext(node))->measureFunc;
                             YGSize size{};
                             pk_callback_table_invoke(index, &size, node, width, widthMode, height, heightMode);
                             return size;
                         });
}

YG_EXTERN_C_END