#pragma once

// https://github.com/emscripten-core/emscripten/blob/main/system/include/emscripten/em_macros.h
#ifdef __EMSCRIPTEN__
#define PK_EXPORT __attribute__((used))
#else
#define PK_EXPORT
#endif
