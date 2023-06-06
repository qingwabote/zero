#pragma once

#include "base/UniqueFunction.hpp"

class TaskRunner
{
public:
    virtual void post(UniqueFunction &&func) = 0;
};
