#include "vulkan/vulkan.hpp"

namespace binding
{
    namespace gfx
    {
        class ShaderImpl
        {
        private:
            /* data */
        public:
            ShaderImpl(VkDevice device);

            bool initialize(v8::Local<v8::Object> info);

            ~ShaderImpl();
        };
    }
}
