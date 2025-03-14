#pragma once

#include <memory>

/**
 * @brief std::function is copyable, the standard requires that callables used to construct it also be copyable,
 * so we can't construct it from a lambda with captured move-only values like unique_ptr.
 * here is a lambda container with no copy
 */

namespace bastard
{
    class LambdaBase
    {
    public:
        virtual ~LambdaBase() = default;
    };

    template <typename Ret, typename... Args>
    class Lambda : public LambdaBase
    {
    public:
        virtual Ret call(Args &&...args) = 0;
    };

    template <typename A, typename B>
    class LambdaImpl
    {
    };

    template <typename T, typename Ret, typename... Args>
    class LambdaImpl<T, Ret (T::*)(Args...)> : public Lambda<Ret, Args...>
    {
    private:
        T _lambda;

    public:
        using BaseType = Lambda<Ret, Args...>;

        LambdaImpl(T &&lambda) : _lambda(std::move(lambda)) {}

        Ret call(Args &&...args) override
        {
            return _lambda(std::forward<Args>(args)...);
        }
    };

    template <typename T, typename Ret, typename... Args>
    class LambdaImpl<T, Ret (T::*)(Args...) const> : public Lambda<Ret, Args...>
    {
    private:
        T _lambda;

    public:
        using BaseType = Lambda<Ret, Args...>;

        LambdaImpl(T &&lambda) : _lambda(std::move(lambda)) {}

        Ret call(Args &&...args) override
        {
            return _lambda(std::forward<Args>(args)...);
        }
    };

    template <typename T>
    std::unique_ptr<typename LambdaImpl<T, decltype(&T::operator())>::BaseType> take_lambda(T &&lambda)
    {
        return std::make_unique<LambdaImpl<T, decltype(&T::operator())>>(std::move(lambda));
    }
}