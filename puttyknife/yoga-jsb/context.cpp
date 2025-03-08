#include <yoga/context.h>
#include "NodeContext.hpp"

YG_EXTERN_C_BEGIN

void *YGNodeContextNew()
{
    return new puttyknife::yoga::NodeContext();
}

void YGNodeContextFree(void *context)
{
    delete reinterpret_cast<puttyknife::yoga::NodeContext *>(context);
}

YG_EXTERN_C_END