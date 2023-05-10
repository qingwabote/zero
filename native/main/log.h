#pragma once

#include "SDL_log.h"

#define ZERO_LOG(fmt, ...) SDL_Log(fmt, ##__VA_ARGS__)