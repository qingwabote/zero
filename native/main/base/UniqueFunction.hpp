#pragma once

template <typename Ret, typename... Args>
class FunctionHolderBase
{
public:
    virtual Ret call(Args &&...args) = 0;
    virtual ~FunctionHolderBase() = default;
};

template <typename T, typename Ret, typename... Args>
class FunctionHolder : public FunctionHolderBase<Ret, Args...>
{
private:
    T _f;

public:
    FunctionHolder(T f) : _f(f) {}
    Ret call(Args &&...args) override { return (*_f)(std::forward<Args>(args)...); }
    ~FunctionHolder() { delete _f; }
};

/**
 * A move-only lambda container, hide lambda type by polymorphism, so it can be used as type by container like vector<UniqueFunction> to store any type of lambda
 */
template <typename Ret, typename... Args>
class UniqueFunction
{
protected:
    FunctionHolderBase<Ret, Args...> *_holder{nullptr};

public:
    template <typename T>
    static UniqueFunction create(T f)
    {
        return UniqueFunction(new FunctionHolder<T, Ret, Args...>(f));
    }

    UniqueFunction() noexcept = default;
    UniqueFunction(FunctionHolderBase<Ret, Args...> *holder) : _holder(holder) {}

    UniqueFunction(const UniqueFunction &) = delete;
    UniqueFunction(UniqueFunction &&val) noexcept
    {
        _holder = val._holder;
        val._holder = nullptr;
    }

    UniqueFunction &operator=(UniqueFunction const &) = delete;
    UniqueFunction &operator=(UniqueFunction &&val) noexcept
    {
        std::swap(this->_holder, val._holder);
        return *this;
    }

    virtual Ret operator()(Args &&...args) { return _holder->call(std::forward<Args>(args)...); }

    virtual ~UniqueFunction() { delete _holder; }
};
