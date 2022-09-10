#pragma once

#include "VkDeviceImpl.hpp"

namespace binding
{
    namespace gfx
    {
        class CommandBufferImpl
        {
        private:
            VkCommandBuffer _commandBuffer = nullptr;

        public:
            void begin();
            void beginRenderPass(v8::Local<v8::Object> area);
            CommandBufferImpl(DeviceImpl *device);
            ~CommandBufferImpl();
        };
    }
}
