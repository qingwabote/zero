#pragma once

#include <v8.h>

namespace puttyknife::yoga
{
    class NodeContext
    {
    public:
        v8::Global<v8::Function> dirtiedFunc;
        v8::Global<v8::Function> measureFunc;
    };
}