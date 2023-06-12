#pragma once

#include "base/UniqueFunction.hpp"

class TaskRunner
{
public:
    /**
     * @brief it takes the ownership of lambda.
     */
    template <typename T>
    void post(T f)
    {
        post(UniqueFunction<void>::create(f));
    }

protected:
    virtual void post(UniqueFunction<void> &&func) = 0;
};
