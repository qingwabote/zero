#pragma once

#include <emscripten/em_macros.h>

#ifdef __cplusplus
extern "C"
{
#endif

    EM_IMPORT(pk_callback_table_invoke)
    void pk_callback_table_invoke(int index, ...);

#ifdef __cplusplus
}
#endif