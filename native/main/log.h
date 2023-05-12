#pragma once

#include "SDL_log.h"

#define ZERO_LOG(fmt, ...) SDL_Log(fmt, ##__VA_ARGS__)

#define ZERO_LOG_ERROR(fmt, ...) SDL_LogError(0, fmt, ##__VA_ARGS__)