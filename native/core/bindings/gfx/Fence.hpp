#pragma once

#include "Binding.hpp"

namespace binding::gfx
{
    class Fence_impl;

    class Fence : public Binding
    {
    private:
        std::unique_ptr<Fence_impl> _impl;

    protected:
        v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Fence_impl &impl() { return *_impl.get(); }

        sugar::v8::Weak<v8::Object> submitInfo;

        Fence(std::unique_ptr<Fence_impl> impl);

        bool initialize(bool signaled);

        ~Fence();
    };
}
