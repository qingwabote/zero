%module gfx

%include "std_shared_ptr.i"
%include "std_vector.i"
%include "std_string.i"
%include "stdint.i"
%include "attribute.i"

%shared_ptr(ImageBitmap)

%{
#include "bindings/gfx/Device.hpp"
%}

%ignore binding::gfx::BufferUsageFlagBits;
%ignore binding::gfx::MemoryUsage;
%ignore binding::gfx::ShaderStageFlagBits;
%ignore binding::gfx::DescriptorType;
%ignore binding::gfx::SampleCountFlagBits;
%ignore binding::gfx::TextureUsageBits;
%ignore binding::gfx::LOAD_OP;
%ignore binding::gfx::ImageLayout;
%ignore binding::gfx::Filter;
%ignore binding::gfx::CullMode;
%ignore binding::gfx::BlendFactor;
%ignore binding::gfx::PrimitiveTopology;
%ignore binding::gfx::IndexType;

%shared_ptr(binding::gfx::FloatVector)
%shared_ptr(binding::gfx::Uint32Vector)
%shared_ptr(binding::gfx::StringVector)

%shared_ptr(binding::gfx::BufferInfo)
%shared_ptr(binding::gfx::SamplerInfo)
%shared_ptr(binding::gfx::TextureInfo)

%shared_ptr(binding::gfx::Texture);
%shared_ptr(binding::gfx::TextureVector)

%shared_ptr(binding::gfx::RenderPassInfo);
%shared_ptr(binding::gfx::RenderPass);
%shared_ptr(binding::gfx::FramebufferInfo)

%shared_ptr(binding::gfx::DescriptorSetLayoutBinding)
%shared_ptr(binding::gfx::DescriptorSetLayoutBindingVector)
%shared_ptr(binding::gfx::DescriptorSetLayoutInfo)

%shared_ptr(binding::gfx::AttachmentDescription)
%shared_ptr(binding::gfx::AttachmentDescriptionVector)

%shared_ptr(binding::gfx::DescriptorSetLayout);
%shared_ptr(binding::gfx::DescriptorSetLayoutVector)
%shared_ptr(binding::gfx::PipelineLayoutInfo)
%shared_ptr(binding::gfx::PipelineLayout)

%shared_ptr(binding::gfx::ShaderInfo)

%shared_ptr(binding::gfx::Buffer);
%shared_ptr(binding::gfx::BufferVector)
%shared_ptr(binding::gfx::VertexInputAttributeDescription);
%shared_ptr(binding::gfx::VertexInputBindingDescription)
%shared_ptr(binding::gfx::VertexInputAttributeDescriptionVector)
%shared_ptr(binding::gfx::VertexInputBindingDescriptionVector)
%shared_ptr(binding::gfx::VertexInputState)
%shared_ptr(binding::gfx::VertexInput)
%shared_ptr(binding::gfx::IndexInput)
%shared_ptr(binding::gfx::InputAssemblerInfo)

%shared_ptr(binding::gfx::RasterizationState)
%shared_ptr(binding::gfx::DepthStencilState)
%shared_ptr(binding::gfx::BlendState)
%shared_ptr(binding::gfx::Shader)
%shared_ptr(binding::gfx::PassState)

%shared_ptr(binding::gfx::PipelineInfo)

%shared_ptr(binding::gfx::CommandBuffer);
%shared_ptr(binding::gfx::Semaphore);
%shared_ptr(binding::gfx::SubmitInfo)

%include "bindings/gfx/info.hpp"

%template(FloatVector) std::vector<float>;
%template(Uint32Vector) std::vector<uint32_t>;
%template(StringVector) std::vector<std::string>;

%template(BufferVector) std::vector<std::shared_ptr<binding::gfx::Buffer>>;
%template(TextureVector) std::vector<std::shared_ptr<binding::gfx::Texture>>;
%template(DescriptorSetLayoutBindingVector) std::vector<std::shared_ptr<binding::gfx::DescriptorSetLayoutBinding>>;
%template(AttachmentDescriptionVector) std::vector<std::shared_ptr<binding::gfx::AttachmentDescription>>;
%template(DescriptorSetLayoutVector) std::vector<std::shared_ptr<binding::gfx::DescriptorSetLayout>>;

%ignore binding::gfx::Capabilities::Capabilities;
%attribute(binding::gfx::Capabilities, uint32_t, uniformBufferOffsetAlignment, uniformBufferOffsetAlignment);
%attribute(binding::gfx::Capabilities, int, clipSpaceMinZ, clipSpaceMinZ);
%include "bindings/gfx/Capabilities.hpp"

%ignore binding::gfx::Buffer::Buffer;
%attribute2(binding::gfx::Buffer, std::shared_ptr<binding::gfx::BufferInfo>, info, info);
%include "bindings/gfx/Buffer.hpp"

%ignore binding::gfx::RenderPass::RenderPass;
%attribute2(binding::gfx::RenderPass, std::shared_ptr<binding::gfx::RenderPassInfo>, info, info);
%include "bindings/gfx/RenderPass.hpp"

%ignore binding::gfx::Sampler::Sampler;
%shared_ptr(binding::gfx::Sampler);
%include "bindings/gfx/Sampler.hpp"

%ignore binding::gfx::Texture::Texture;
%attribute2(binding::gfx::Texture, std::shared_ptr<binding::gfx::TextureInfo>, info, info);
%include "bindings/gfx/Texture.hpp"

%ignore binding::gfx::DescriptorSet::DescriptorSet;
%attribute2(binding::gfx::DescriptorSet, std::shared_ptr<binding::gfx::DescriptorSetLayout>, layout, layout);
%shared_ptr(binding::gfx::DescriptorSet);
%include "bindings/gfx/DescriptorSet.hpp"

%ignore binding::gfx::DescriptorSetLayout::DescriptorSetLayout;
%attribute2(binding::gfx::DescriptorSetLayout, std::shared_ptr<binding::gfx::DescriptorSetLayoutInfo>, info, info);
%include "bindings/gfx/DescriptorSetLayout.hpp"

%ignore binding::gfx::PipelineLayout::PipelineLayout;
%shared_ptr(binding::gfx::PipelineLayout);
%include "bindings/gfx/PipelineLayout.hpp"

%ignore binding::gfx::Fence::Fence;
%shared_ptr(binding::gfx::Fence);
%include "bindings/gfx/Fence.hpp"

%ignore binding::gfx::Semaphore::Semaphore;
%include "bindings/gfx/Semaphore.hpp"

%ignore binding::gfx::Framebuffer::Framebuffer;
%attribute2(binding::gfx::Framebuffer, std::shared_ptr<binding::gfx::FramebufferInfo>, info, info);
%shared_ptr(binding::gfx::Framebuffer);
%include "bindings/gfx/Framebuffer.hpp"

%ignore binding::gfx::InputAssembler::InputAssembler;
%attribute2(binding::gfx::InputAssembler, std::shared_ptr<binding::gfx::InputAssemblerInfo>, info, info);
%shared_ptr(binding::gfx::InputAssembler);
%include "bindings/gfx/InputAssembler.hpp"

%ignore binding::gfx::Shader::Shader;
%attribute2(binding::gfx::Shader, std::shared_ptr<binding::gfx::ShaderInfo>, info, info);
%include "bindings/gfx/Shader.hpp"

%template(VertexInputAttributeDescriptionVector) std::vector<std::shared_ptr<binding::gfx::VertexInputAttributeDescription>>;
%template(VertexInputBindingDescriptionVector) std::vector<std::shared_ptr<binding::gfx::VertexInputBindingDescription>>;

%ignore binding::gfx::Pipeline::Pipeline;
%shared_ptr(binding::gfx::Pipeline);
%include "bindings/gfx/Pipeline.hpp"

%ignore binding::gfx::CommandBuffer::CommandBuffer;
%include "bindings/gfx/CommandBuffer.hpp"

%ignore binding::gfx::Swapchain::Swapchain;
%attribute2(binding::gfx::Swapchain, std::shared_ptr<binding::gfx::Texture>, colorTexture, colorTexture);
%include "bindings/gfx/Swapchain.hpp"

%ignore binding::gfx::Queue::Queue;
%include "bindings/gfx/Queue.hpp"

%ignore binding::gfx::Device::Device;
%attribute2(binding::gfx::Device, Capabilities, capabilities, capabilities);
%attribute2(binding::gfx::Device, Swapchain, swapchain, swapchain);
%attribute2(binding::gfx::Device, Queue, queue, queue);
%newobject binding::gfx::Device::createBuffer;
%newobject binding::gfx::Device::createCommandBuffer;
%newobject binding::gfx::Device::createFence;
%newobject binding::gfx::Device::createFramebuffer;
%newobject binding::gfx::Device::createInputAssembler;
%newobject binding::gfx::Device::RenderPass;
%newobject binding::gfx::Device::createSampler;
%newobject binding::gfx::Device::createSemaphore;
%newobject binding::gfx::Device::createTexture;
%newobject binding::gfx::Device::createDescriptorSetLayout;
%newobject binding::gfx::Device::createDescriptorSet;
%newobject binding::gfx::Device::createShader;
%newobject binding::gfx::Device::createPipelineLayout;
%newobject binding::gfx::Device::createPipeline;

%include "bindings/gfx/Device.hpp"

%{

const std::shared_ptr<binding::gfx::Semaphore> &swig_Semaphore_js2c(SWIGV8_VALUE js_obj) {
  std::shared_ptr<binding::gfx::Semaphore> *ptr = nullptr;
  SWIG_ConvertPtr(js_obj, &ptr, SWIGTYPE_p_binding__gfx__Semaphore, 0 | 0);
  return *ptr;
}

%}
