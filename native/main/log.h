#pragma once

#include "SDL_log.h"

#define ZERO_LOG_INFO(fmt, ...) SDL_LogInfo(0, fmt, ##__VA_ARGS__)
#define ZERO_LOG_ERROR(fmt, ...) SDL_LogError(0, fmt, ##__VA_ARGS__)
#define ZERO_LOG_WARN(fmt, ...) SDL_LogWarn(0, fmt, ##__VA_ARGS__)
#define ZERO_LOG_VERBOSE(fmt, ...) SDL_LogVerbose(0, fmt, ##__VA_ARGS__)