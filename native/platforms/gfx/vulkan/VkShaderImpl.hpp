#pragma once

#include "VkDeviceImpl.hpp"

namespace binding
{
    namespace gfx
    {
        class ShaderImpl
        {
        private:
            DeviceImpl *_device = nullptr;

            v8::Global<v8::Object> _info;

            std::vector<VkPipelineShaderStageCreateInfo> _stageInfos;

        public:
            ShaderImpl(DeviceImpl *device);

            v8::Local<v8::Object> info();

            bool initialize(v8::Local<v8::Object> info);

            ~ShaderImpl();
        };
    }
}
