#include "bindings/gfx/DescriptorSet.hpp"
#include "VkDescriptorSet_impl.hpp"
#include "VkDescriptorSetLayout_impl.hpp"
#include "VkBufferImpl.hpp"
#include "sugars/v8sugar.hpp"

namespace binding
{
    namespace gfx
    {
        DescriptorSet_impl::DescriptorSet_impl(DeviceImpl *device) : _device(device) {}

        bool DescriptorSet_impl::initialize(DescriptorSetLayout *gfx_setLayout)
        {
            VkDescriptorSetAllocateInfo allocInfo = {};
            allocInfo.pNext = nullptr;
            allocInfo.sType = VK_STRUCTURE_TYPE_DESCRIPTOR_SET_ALLOCATE_INFO;
            allocInfo.descriptorPool = _device->descriptorPool();
            allocInfo.descriptorSetCount = 1;
            VkDescriptorSetLayout setLayout = gfx_setLayout->impl()->setLayout();
            allocInfo.pSetLayouts = &setLayout;

            if (vkAllocateDescriptorSets(_device->device(), &allocInfo, &_descriptorSet))
            {
                return true;
            }

            return false;
        }

        void DescriptorSet_impl::bindBuffer(uint32_t binding, Buffer *buffer)
        {
            auto size = sugar::v8::object_get(buffer->info(), "size").As<v8::Number>();

            VkDescriptorBufferInfo bufferInfo;
            bufferInfo.buffer = buffer->impl()->buffer();
            bufferInfo.offset = 0;
            bufferInfo.range = size->Value();

            VkWriteDescriptorSet write = {};
            write.sType = VK_STRUCTURE_TYPE_WRITE_DESCRIPTOR_SET;
            write.pNext = nullptr;
            write.dstBinding = binding;
            write.dstSet = _descriptorSet;
            write.descriptorCount = 1;
            write.descriptorType = VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER;
            write.pBufferInfo = &bufferInfo;

            vkUpdateDescriptorSets(_device->device(), 1, &write, 0, nullptr);
        }

        DescriptorSet_impl::~DescriptorSet_impl() {}

        DescriptorSet::DescriptorSet(std::unique_ptr<DescriptorSet_impl> impl) : Binding(), _impl(std::move(impl)) {}
        bool DescriptorSet::initialize(DescriptorSetLayout *setLayout) { return _impl->initialize(setLayout); }
        void DescriptorSet::bindBuffer(uint32_t binding, Buffer *buffer) { _impl->bindBuffer(binding, buffer); }
        DescriptorSet::~DescriptorSet() {}
    }
}