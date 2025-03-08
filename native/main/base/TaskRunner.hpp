#pragma once

#include <bastard/lambda.hpp>

class TaskRunner
{
public:
    template <typename T>
    void post(T &&lambda)
    {
        post(bastard::take_lambda(std::move(lambda)));
    }

protected:
    virtual void post(std::unique_ptr<bastard::Lambda<void>> &&lambda) = 0;
};
