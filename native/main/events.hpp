#pragma once

#include <memory>
#include <vector>

struct Touch
{
    int32_t x;
    int32_t y;
};

using TouchVector = std::vector<std::shared_ptr<Touch>>;

struct TouchEvent
{
    std::shared_ptr<TouchVector> touches;
};

struct WheelEvent : TouchEvent
{
    int32_t delta;
};