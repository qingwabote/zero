#pragma once

#include "VkContext.hpp"

namespace binding
{
    namespace gfx
    {
        class ShaderImpl
        {
        private:
            Context *_context = nullptr;

            v8::Global<v8::Object> _info;

            std::vector<VkPipelineShaderStageCreateInfo> _stageInfos;

        public:
            ShaderImpl(Context *context);

            v8::Local<v8::Object> info();

            bool initialize(v8::Local<v8::Object> info);

            ~ShaderImpl();
        };
    }
}
