#include "gfx/Sampler.hpp"
#include "SamplerImpl.hpp"

namespace gfx
{
    SamplerImpl::SamplerImpl(DeviceImpl *device) : _device(device) {}
    SamplerImpl::~SamplerImpl() {}

    Sampler::Sampler(DeviceImpl *device) : impl(std::make_shared<SamplerImpl>(device)) {}

    bool Sampler::initialize(const std::shared_ptr<SamplerInfo> &info)
    {
        VkSamplerCreateInfo samplerInfo = {};
        samplerInfo.sType = VK_STRUCTURE_TYPE_SAMPLER_CREATE_INFO;
        samplerInfo.magFilter = static_cast<VkFilter>(info->magFilter);
        samplerInfo.minFilter = static_cast<VkFilter>(info->minFilter);
        samplerInfo.addressModeU = VK_SAMPLER_ADDRESS_MODE_REPEAT;
        samplerInfo.addressModeV = VK_SAMPLER_ADDRESS_MODE_REPEAT;
        samplerInfo.addressModeW = VK_SAMPLER_ADDRESS_MODE_REPEAT;
        if (vkCreateSampler(*impl->_device, &samplerInfo, nullptr, &impl->_sampler))
        {
            return true;
        }

        return false;
    }

    Sampler::~Sampler()
    {
        vkDestroySampler(*impl->_device, *impl, nullptr);
    }
}
