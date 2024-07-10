%module gfx

%include "std_shared_ptr.i"
%include "std_vector.i"
%include "std_string.i"
%include "stdint.i"
%include "attribute.i"

%ignore *::impl;
%ignore *::initialize;

%shared_ptr(ImageBitmap)

%{
#include "gfx/Device.hpp"
%}

%ignore gfx::operator !;
%ignore gfx::operator ~;
%ignore gfx::operator ||;
%ignore gfx::operator &&;
%ignore gfx::operator |;
%ignore gfx::operator &;
%ignore gfx::operator ^;
%ignore gfx::operator +;
%ignore gfx::operator |=;
%ignore gfx::operator &=;
%ignore gfx::operator ^=;

%ignore gfx::Format;
%ignore gfx::FormatInfo;
%ignore gfx::FormatInfos;
%ignore gfx::BufferUsageFlagBits;
%ignore gfx::MemoryUsage;
%ignore gfx::ShaderStageFlagBits;
%ignore gfx::DescriptorType;
%ignore gfx::SampleCountFlagBits;
%ignore gfx::TextureUsageFlagBits;
%ignore gfx::LOAD_OP;
%ignore gfx::ImageLayout;
%ignore gfx::Filter;
%ignore gfx::CullMode;
%ignore gfx::BlendFactor;
%ignore gfx::PrimitiveTopology;
%ignore gfx::IndexType;

%shared_ptr(gfx::FloatVector)
%shared_ptr(gfx::Uint32Vector)
%shared_ptr(gfx::StringVector)

%shared_ptr(gfx::BufferInfo)
%shared_ptr(gfx::SamplerInfo)
%shared_ptr(gfx::TextureInfo)

%shared_ptr(gfx::Texture);
%shared_ptr(gfx::TextureVector)

%shared_ptr(gfx::RenderPassInfo);
%shared_ptr(gfx::RenderPass);
%shared_ptr(gfx::FramebufferInfo)

%shared_ptr(gfx::DescriptorSetLayoutBinding)
%shared_ptr(gfx::DescriptorSetLayoutBindingVector)
%shared_ptr(gfx::DescriptorSetLayoutInfo)

%shared_ptr(gfx::AttachmentDescription)
%shared_ptr(gfx::AttachmentDescriptionVector)

%shared_ptr(gfx::DescriptorSetLayout);
%shared_ptr(gfx::DescriptorSetLayoutVector)
%shared_ptr(gfx::PipelineLayoutInfo)
%shared_ptr(gfx::PipelineLayout)

%shared_ptr(gfx::ShaderInfo)

%shared_ptr(gfx::VertexAttribute);
%shared_ptr(gfx::VertexAttributeVector);
%shared_ptr(gfx::VertexInputState)
%shared_ptr(gfx::Buffer);
%shared_ptr(gfx::BufferVector)
%shared_ptr(gfx::VertexInput)
%shared_ptr(gfx::IndexInput)
%shared_ptr(gfx::InputAssembler)

%shared_ptr(gfx::RasterizationState)
%shared_ptr(gfx::DepthStencilState)
%shared_ptr(gfx::BlendState)
%shared_ptr(gfx::Shader)
%shared_ptr(gfx::PassState)

%shared_ptr(gfx::PipelineInfo)

%shared_ptr(gfx::CommandBuffer);
%shared_ptr(gfx::Semaphore);
%shared_ptr(gfx::SubmitInfo)

%include "gfx/info.hpp"

%template(FloatVector) std::vector<float>;
%template(Uint32Vector) std::vector<uint32_t>;
%template(StringVector) std::vector<std::string>;

%template(BufferVector) std::vector<std::shared_ptr<gfx::Buffer>>;
%template(TextureVector) std::vector<std::shared_ptr<gfx::Texture>>;
%template(DescriptorSetLayoutBindingVector) std::vector<std::shared_ptr<gfx::DescriptorSetLayoutBinding>>;
%template(AttachmentDescriptionVector) std::vector<std::shared_ptr<gfx::AttachmentDescription>>;
%template(DescriptorSetLayoutVector) std::vector<std::shared_ptr<gfx::DescriptorSetLayout>>;
%template(VertexAttributeVector) std::vector<std::shared_ptr<gfx::VertexAttribute>>;


%ignore gfx::Capabilities::Capabilities;
%attribute(gfx::Capabilities, uint32_t, uniformBufferOffsetAlignment, uniformBufferOffsetAlignment);
%attribute(gfx::Capabilities, int, clipSpaceMinZ, clipSpaceMinZ);
%include "gfx/Capabilities.hpp"

%ignore gfx::Buffer::Buffer;
%include "gfx/Buffer.hpp"

%ignore gfx::RenderPass::RenderPass;
%include "gfx/RenderPass.hpp"

%ignore gfx::Sampler::Sampler;
%shared_ptr(gfx::Sampler);
%include "gfx/Sampler.hpp"

%ignore gfx::Texture::Texture;
%include "gfx/Texture.hpp"

%ignore gfx::DescriptorSet::DescriptorSet;
%shared_ptr(gfx::DescriptorSet);
%include "gfx/DescriptorSet.hpp"

%ignore gfx::DescriptorSetLayout::DescriptorSetLayout;
%include "gfx/DescriptorSetLayout.hpp"

%ignore gfx::PipelineLayout::PipelineLayout;
%shared_ptr(gfx::PipelineLayout);
%include "gfx/PipelineLayout.hpp"

%ignore gfx::Fence::Fence;
%shared_ptr(gfx::Fence);
%include "gfx/Fence.hpp"

%ignore gfx::Semaphore::Semaphore;
%include "gfx/Semaphore.hpp"

%ignore gfx::Framebuffer::Framebuffer;
%shared_ptr(gfx::Framebuffer);
%include "gfx/Framebuffer.hpp"

%ignore gfx::Shader::Shader;
%include "gfx/Shader.hpp"

%ignore gfx::Pipeline::Pipeline;
%shared_ptr(gfx::Pipeline);
%include "gfx/Pipeline.hpp"

%ignore gfx::CommandBuffer::CommandBuffer;
%include "gfx/CommandBuffer.hpp"

%ignore gfx::Swapchain::Swapchain;
%include "gfx/Swapchain.hpp"

%ignore gfx::Queue::Queue;
%include "gfx/Queue.hpp"

%ignore gfx::Device::Device;
%attribute2(gfx::Device, Capabilities, capabilities, capabilities);
%attribute2(gfx::Device, Swapchain, swapchain, swapchain);
%attribute2(gfx::Device, Queue, queue, queue);
%newobject gfx::Device::createBuffer;
%newobject gfx::Device::createCommandBuffer;
%newobject gfx::Device::createFence;
%newobject gfx::Device::createFramebuffer;
%newobject gfx::Device::createInputAssembler;
%newobject gfx::Device::createRenderPass;
%newobject gfx::Device::createSampler;
%newobject gfx::Device::createSemaphore;
%newobject gfx::Device::createTexture;
%newobject gfx::Device::createDescriptorSetLayout;
%newobject gfx::Device::createDescriptorSet;
%newobject gfx::Device::createShader;
%newobject gfx::Device::createPipelineLayout;
%newobject gfx::Device::createPipeline;

%include "gfx/Device.hpp"
