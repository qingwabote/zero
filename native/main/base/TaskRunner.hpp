#pragma once

#include "base/callable.hpp"

class TaskRunner
{
public:
    /**
     * @brief it takes the ownership of lambda.
     */
    template <typename T>
    void post(T f)
    {
        post(std::unique_ptr<callable::Callable<void>>(new callable::CallableLambda(f)));
    }

protected:
    virtual void post(std::unique_ptr<callable::Callable<void>> &&callable) = 0;
};
