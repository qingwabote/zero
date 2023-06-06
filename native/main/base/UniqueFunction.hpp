#pragma once

class FunctionHolderBase
{
public:
    virtual void call() = 0;
    virtual ~FunctionHolderBase() = default;
};

template <typename T>
class FunctionHolder : public FunctionHolderBase
{
private:
    T _f;

public:
    FunctionHolder(T f) : _f(f) {}
    void call() override { (*_f)(); }
    ~FunctionHolder() { delete _f; }
};

/**
 * A move-only lambda container, hide lambda type by polymorphism, so it can be used as type by container like vector<UniqueFunction> to store any type of lambda
 */
class UniqueFunction
{
protected:
    FunctionHolderBase *_holder{nullptr};

public:
    template <typename T>
    static UniqueFunction create(T f)
    {
        return UniqueFunction(new FunctionHolder<T>(f));
    }

    UniqueFunction() noexcept = default;
    UniqueFunction(FunctionHolderBase *holder) : _holder(holder) {}

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

    virtual void operator()() { _holder->call(); }

    virtual ~UniqueFunction() { delete _holder; }
};