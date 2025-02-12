#pragma once

// https://github.com/emscripten-core/emscripten/blob/main/system/include/emscripten/em_macros.h
#ifdef __wasm__
#define EM_IMPORT(NAME) __attribute__((import_module("env"), import_name(#NAME)))
#else
#define EM_IMPORT(NAME)
#endif

#ifdef __cplusplus
extern "C"
{
#endif

    EM_IMPORT(pk_callback_table_invoke)
    void pk_callback_table_invoke(int index, ...);

#ifdef __cplusplus
}
#endif