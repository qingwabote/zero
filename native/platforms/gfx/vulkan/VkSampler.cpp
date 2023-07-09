#include "gfx/Sampler.hpp"
#include "VkSampler_impl.hpp"

namespace gfx
{
    Sampler_impl::Sampler_impl(Device_impl *device) : _device(device) {}
    Sampler_impl::~Sampler_impl() {}

    Sampler::Sampler(Device_impl *device) : _impl(std::make_unique<Sampler_impl>(device)) {}

    bool Sampler::initialize(const std::shared_ptr<SamplerInfo> &info)
    {
        VkSamplerCreateInfo samplerInfo = {};
        samplerInfo.sType = VK_STRUCTURE_TYPE_SAMPLER_CREATE_INFO;
        samplerInfo.magFilter = static_cast<VkFilter>(info->magFilter);
        samplerInfo.minFilter = static_cast<VkFilter>(info->minFilter);
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
