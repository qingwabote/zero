#include <yoga/Yoga.h>
#include "../wasm/c/imports.h"

YG_EXTERN_C_BEGIN

void YGNodeSetDirtiedFunc_PK(YGNodeRef node, uintptr_t index)
{
    YGNodeSetContext(node, reinterpret_cast<void *>(index));
    YGNodeSetDirtiedFunc(node,
                         [](YGNodeConstRef node)
                         {
                             uintptr_t index = reinterpret_cast<uintptr_t>(YGNodeGetContext(node));
                             pk_callback_table_invoke(index, node);
                         });
}

YG_EXTERN_C_END