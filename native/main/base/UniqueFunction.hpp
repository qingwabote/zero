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
        // if (_holder)
        // {
        //     delete _holder;
        // }

        // _holder = val._holder;
        // val._holder = nullptr;
        std::swap(this->_holder, val._holder);
        return *this;
    }

    virtual void operator()() { _holder->call(); }

    virtual ~UniqueFunction() { delete _holder; }
};