#pragma once

#include <memory>

/**
 * @brief std::function is copyable, the standard requires that callables used to construct it also be copyable,
 * so we can't construct it from a lambda with a captured unique_ptr.
 * here is a lambda container with no copy
 */
namespace callable
{
    class CallableBase
    {
    public:
        virtual ~CallableBase() = default;
    };

    template <typename Ret, typename... Args>
    class Callable : public CallableBase
    {
    public:
        virtual Ret call(Args &&...args) = 0;
    };

    template <typename A, typename B>
    class _CallableLambda
    {
    };

    template <typename Lambda, typename Ret, typename... Args>
    class _CallableLambda<Lambda, Ret (Lambda::*)(Args...)> : public Callable<Ret, Args...>
    {
    private:
        std::unique_ptr<Lambda> _lambda;

    public:
        _CallableLambda(Lambda *lambda) : _lambda(lambda) {}

        Ret call(Args &&...args) override
        {
            return (*_lambda)(std::forward<Args>(args)...);
        }
    };

    template <typename Lambda, typename Ret, typename... Args>
    class _CallableLambda<Lambda, Ret (Lambda::*)(Args...) const> : public Callable<Ret, Args...>
    {
    private:
        std::unique_ptr<Lambda> _lambda;

    public:
        _CallableLambda(Lambda *lambda) : _lambda(lambda) {}

        Ret call(Args &&...args) override
        {
            return (*_lambda)(std::forward<Args>(args)...);
        }
    };

    // https://stackoverflow.com/questions/41008092/class-template-argument-deduction-not-working-with-alias-template
    // template <typename Lambda>
    // using CallableLambda = _CallableLambda<Lambda, decltype(&Lambda::operator())>;

    template <typename Lambda>
    class CallableLambda : public _CallableLambda<Lambda, decltype(&Lambda::operator())>
    {
    public:
        CallableLambda(Lambda *lambda) : _CallableLambda<Lambda, decltype(&Lambda::operator())>(lambda) {}
    };
}