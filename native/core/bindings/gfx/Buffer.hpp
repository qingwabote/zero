#pragma once

#include "Binding.hpp"

namespace binding::gfx
{
    struct BufferInfo
    {
        int32_t usage;
        uint64_t size;
        int32_t mem_usage;
    };

    class Buffer_impl;

    class Buffer : public Binding
    {
    private:
        std::unique_ptr<Buffer_impl> _impl;

    protected:
        v8::Local<v8::FunctionTemplate> createTemplate() override;

    public:
        Buffer_impl &impl() { return *_impl.get(); }

        Buffer(std::unique_ptr<Buffer_impl> impl);

        bool initialize(BufferInfo &info);

        void update(v8::Local<v8::ArrayBufferView> buffer);

        ~Buffer();
    };
}
