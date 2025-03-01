#include <phys/World.hpp>
#include "../wasm/imports.h"

extern "C"
{
    PK_EXPORT void physWorld_setDebugDrawer_PK(phys::World *world, int drawLineFunc)
    {
        physWorld_setDebugDrawer(
            world,
            [drawLineFunc](const phys::Vector3 &from, const phys::Vector3 &to, const phys::Vector3 &color)
            {
                pk_callback_table_invoke(drawLineFunc, &from, &to, &color);
            });
    }
}