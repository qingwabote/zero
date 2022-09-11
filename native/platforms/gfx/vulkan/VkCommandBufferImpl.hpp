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
            DeviceImpl *_device = nullptr;

        public:
            bool initialize();
            void begin();
            void beginRenderPass(v8::Local<v8::Object> area);
            CommandBufferImpl(DeviceImpl *device);
            ~CommandBufferImpl();
        };
    }
}
