#pragma once

template <typename Ret, typename... Args>
class FunctionHolderBase
{
public:
    virtual Ret call(Args &&...args) = 0;
    virtual ~FunctionHolderBase() = default;
};

template <typename Lambda, typename Ret, typename... Args>
class FunctionHolder : public FunctionHolderBase<Ret, Args...>
{
private:
    Lambda _f;

public:
    FunctionHolder(Lambda f) : _f(f) {}
    Ret call(Args &&...args) override { return (*_f)(std::forward<Args>(args)...); }
    ~FunctionHolder() { delete _f; }
};

/**
 * A move-only lambda container, hide lambda type by polymorphism, so it can be used as type by container like std::vector<UniqueFunction<...>> to store any type of lambda
 */
template <typename Ret, typename... Args>
class UniqueFunction
{
protected:
    FunctionHolderBase<Ret, Args...> *_holder{nullptr};

public:
    template <typename Lambda>
    static UniqueFunction create(Lambda f)
    {
        return UniqueFunction(new FunctionHolder<Lambda, Ret, Args...>(f));
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

    operator bool() const { return _holder != nullptr; }

    virtual ~UniqueFunction() { delete _holder; }
};
