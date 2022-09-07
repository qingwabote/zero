#include "vulkan/vulkan.hpp"

namespace binding
{
    namespace gfx
    {
        class ShaderImpl
        {
        private:
            v8::Global<v8::Object> _info;

        public:
            ShaderImpl(VkDevice device);

            v8::Local<v8::Object> info();

            bool initialize(v8::Local<v8::Object> info);

            ~ShaderImpl();
        };
    }
}
