#pragma once

class FunctionHolderBase
{
public:
    virtual void call() = 0;
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

class UniqueFunction
{
protected:
    FunctionHolderBase *_holder;

public:
    template <typename T>
    static UniqueFunction create(T f)
    {
        return UniqueFunction(new FunctionHolder<T>(f));
    }
    UniqueFunction(FunctionHolderBase *holder) : _holder(holder) {}
    UniqueFunction(const UniqueFunction &) = delete;
    UniqueFunction(UniqueFunction &&val) noexcept
    {
        _holder = val._holder;
        val._holder = nullptr;
    }
    virtual void operator()() { _holder->call(); }
    virtual ~UniqueFunction() { delete _holder; }
};