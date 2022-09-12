#pragma once

#include "Binding.hpp"
#include "SDL_video.h"
#include "CommandBuffer.hpp"
#include "Buffer.hpp"
#include "Shader.hpp"
#include "DescriptorSetLayout.hpp"
#include "DescriptorSet.hpp"
#include "Pipeline.hpp"

namespace binding
{
    namespace gfx
    {
        class DeviceImpl;

        class Device : public Binding
        {
        private:
            DeviceImpl *_impl = nullptr;

        protected:
            v8::Local<v8::FunctionTemplate> createTemplate() override;

        public:
            Device(SDL_Window *window);

            CommandBuffer *commandBuffer();

            bool initialize();

            Buffer *createBuffer();

            Shader *createShader();

            DescriptorSetLayout *createDescriptorSetLayout();

            DescriptorSet *createDescriptorSet();

            Pipeline *createPipeline();

            ~Device();
        };
    }
}
