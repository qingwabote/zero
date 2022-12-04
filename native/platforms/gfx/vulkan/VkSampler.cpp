#include "bindings/gfx/Sampler.hpp"
#include "VkSampler_impl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        Sampler_impl::Sampler_impl(Device_impl *device) : _device(device) {}
        Sampler_impl::~Sampler_impl() {}

        Sampler::Sampler(std::unique_ptr<Sampler_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        bool Sampler::initialize(v8::Local<v8::Object> info)
        {
            VkSamplerCreateInfo samplerInfo = {};
            samplerInfo.sType = VK_STRUCTURE_TYPE_SAMPLER_CREATE_INFO;
            samplerInfo.magFilter = static_cast<VkFilter>(sugar::v8::object_get(info, "magFilter").As<v8::Number>()->Value());
            samplerInfo.minFilter = static_cast<VkFilter>(sugar::v8::object_get(info, "minFilter").As<v8::Number>()->Value());
            samplerInfo.addressModeU = VK_SAMPLER_ADDRESS_MODE_REPEAT;
            samplerInfo.addressModeV = VK_SAMPLER_ADDRESS_MODE_REPEAT;
            samplerInfo.addressModeW = VK_SAMPLER_ADDRESS_MODE_REPEAT;
            if (vkCreateSampler(*_impl->_device, &samplerInfo, nullptr, &_impl->_sampler))
            {
                return true;
            }

            return false;
        }

        Sampler::~Sampler()
        {
            vkDestroySampler(*_impl->_device, *_impl, nullptr);
        }
    }
}
