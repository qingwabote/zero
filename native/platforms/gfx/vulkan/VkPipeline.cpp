#include "gfx/Pipeline.hpp"
#include "VkPipeline_impl.hpp"

#include "gfx/Shader.hpp"
#include "VkShader_impl.hpp"

#include "gfx/DescriptorSetLayout.hpp"
#include "VkDescriptorSetLayout_impl.hpp"

#include "gfx/PipelineLayout.hpp"
#include "VkPipelineLayout_impl.hpp"

#include "gfx/RenderPass.hpp"
#include "VkRenderPass_impl.hpp"

#include "gfx/Buffer.hpp"

namespace gfx
{
    Pipeline_impl::Pipeline_impl(Device_impl *device) : _device(device) {}
    Pipeline_impl::~Pipeline_impl() {}

    Pipeline::Pipeline(Device_impl *device, const std::shared_ptr<PipelineInfo> &info) : _impl(std::make_unique<Pipeline_impl>(device)), info(info) {}

    bool Pipeline::initialize()
    {
        VkGraphicsPipelineCreateInfo pipelineInfo = {VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO};

        // passState
        auto &gfx_passState = info->passState;

        auto &gfx_shader = gfx_passState->shader;
        auto &stageInfos = gfx_shader->impl()->stages;
        pipelineInfo.stageCount = stageInfos.size();
        pipelineInfo.pStages = stageInfos.data();

        VkPipelineInputAssemblyStateCreateInfo inputAssemblyState = {VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO};
        inputAssemblyState.topology = static_cast<VkPrimitiveTopology>(gfx_passState->primitive);
        pipelineInfo.pInputAssemblyState = &inputAssemblyState;

        std::vector<VkDynamicState> dynamicStates{VK_DYNAMIC_STATE_VIEWPORT, VK_DYNAMIC_STATE_SCISSOR};
        VkPipelineDynamicStateCreateInfo dynamicState{VK_STRUCTURE_TYPE_PIPELINE_DYNAMIC_STATE_CREATE_INFO};
        dynamicState.dynamicStateCount = dynamicStates.size();
        dynamicState.pDynamicStates = dynamicStates.data();
        pipelineInfo.pDynamicState = &dynamicState;

        VkPipelineViewportStateCreateInfo viewportState{VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO};
        viewportState.viewportCount = 1;
        viewportState.scissorCount = 1;
        pipelineInfo.pViewportState = &viewportState;

        bool swapchain = false;
        for (auto &attachment : *info->renderPass->info->colors)
        {
            if (attachment->finalLayout == ImageLayout::PRESENT_SRC)
            {
                swapchain = true;
                break;
            }
        }
        if (!swapchain)
        {
            for (auto &attachment : *info->renderPass->info->resolves)
            {
                if (attachment->finalLayout == ImageLayout::PRESENT_SRC)
                {
                    swapchain = true;
                    break;
                }
            }
        }

        auto &gfx_rasterizationState = gfx_passState->rasterizationState;
        VkPipelineRasterizationStateCreateInfo rasterizationState{VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO};
        rasterizationState.rasterizerDiscardEnable = VK_FALSE;
        rasterizationState.polygonMode = VK_POLYGON_MODE_FILL;
        rasterizationState.cullMode = static_cast<VkCullModeFlags>(gfx_rasterizationState->cullMode);
        rasterizationState.frontFace = swapchain ? VK_FRONT_FACE_COUNTER_CLOCKWISE : VK_FRONT_FACE_CLOCKWISE;
        rasterizationState.depthBiasEnable = VK_FALSE;
        rasterizationState.depthBiasConstantFactor = 0;
        rasterizationState.depthBiasClamp = 0;
        rasterizationState.depthBiasSlopeFactor = 0;
        rasterizationState.lineWidth = 1;
        pipelineInfo.pRasterizationState = &rasterizationState;

        auto &gfx_depthStencilState = gfx_passState->depthStencilState;
        VkPipelineDepthStencilStateCreateInfo depthStencilState = {VK_STRUCTURE_TYPE_PIPELINE_DEPTH_STENCIL_STATE_CREATE_INFO};
        if (gfx_depthStencilState)
        {
            depthStencilState.depthTestEnable = gfx_depthStencilState->depthTestEnable;
            depthStencilState.depthWriteEnable = VK_TRUE;
            depthStencilState.depthCompareOp = VK_COMPARE_OP_LESS;
        }
        pipelineInfo.pDepthStencilState = &depthStencilState;

        auto &gfx_blendState = gfx_passState->blendState;
        VkPipelineColorBlendAttachmentState colorBlendAttachment = {};
        colorBlendAttachment.colorWriteMask = VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT |
                                              VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT;
        if (gfx_blendState)
        {
            colorBlendAttachment.srcColorBlendFactor = static_cast<VkBlendFactor>(gfx_blendState->srcRGB);
            colorBlendAttachment.dstColorBlendFactor = static_cast<VkBlendFactor>(gfx_blendState->dstRGB);
            colorBlendAttachment.srcAlphaBlendFactor = static_cast<VkBlendFactor>(gfx_blendState->srcAlpha);
            colorBlendAttachment.dstAlphaBlendFactor = static_cast<VkBlendFactor>(gfx_blendState->dstAlpha);
            colorBlendAttachment.blendEnable = VK_TRUE;
        }
        else
        {
            colorBlendAttachment.blendEnable = VK_FALSE;
        }
        VkPipelineColorBlendStateCreateInfo colorBlending = {VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO};
        colorBlending.attachmentCount = 1;
        colorBlending.pAttachments = &colorBlendAttachment;
        pipelineInfo.pColorBlendState = &colorBlending;

        // vertexInputState
        VkPipelineVertexInputStateCreateInfo vertexInputState = {VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO};
        auto &gfx_vertexAttributes = info->inputAssembler->vertexAttributes;
        std::vector<VkVertexInputAttributeDescription> attributes;
        for (size_t i = 0; i < gfx_vertexAttributes->size(); i++)
        {
            auto &gfx_attribute = gfx_vertexAttributes->at(i);
            auto &attributesConsumed = gfx_shader->impl()->attributeLocations;
            if (attributesConsumed.find(gfx_attribute->name) == attributesConsumed.end())
            {
                // avoid warning "Vertex attribute not consumed by vertex shader"
                continue;
            }
            VkVertexInputAttributeDescription attribute{};
            attribute.location = gfx_attribute->location;
            attribute.binding = gfx_attribute->buffer;
            // the format in buffer can be different from the format in shader,
            // use the format in buffer to make sure type conversion can be done correctly by graphics api.
            // https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#integer_attributes
            attribute.format = static_cast<VkFormat>(gfx_attribute->format);
            attribute.offset = gfx_attribute->offset;
            attributes.push_back(attribute);
        }
        vertexInputState.vertexAttributeDescriptionCount = attributes.size();
        vertexInputState.pVertexAttributeDescriptions = attributes.data();
        auto &gfx_vertexBuffers = info->inputAssembler->vertexInput->buffers;
        std::vector<VkVertexInputBindingDescription> bindingDescriptions{gfx_vertexBuffers->size()};
        for (size_t i = 0; i < gfx_vertexBuffers->size(); i++)
        {
            auto &gfx_buffer = gfx_vertexBuffers->at(i);
            uint32_t stride = 0;
            if (info->inputAssembler->vertexInput->strides->size() > i)
            {
                stride = info->inputAssembler->vertexInput->strides->at(i);
            }
            if (stride == 0)
            {
                for (auto &&gfx_attribute : *gfx_vertexAttributes)
                {
                    if (gfx_attribute->buffer == i)
                    {
                        stride += FormatInfos.at(static_cast<Format>(gfx_attribute->format)).bytes;
                    }
                }
            }
            bindingDescriptions[i].stride = stride;
            auto inputRate = VK_VERTEX_INPUT_RATE_VERTEX;
            for (auto &&attribute : *gfx_vertexAttributes)
            {
                if (attribute->buffer == i)
                {
                    if (attribute->instanced)
                    {
                        inputRate = VK_VERTEX_INPUT_RATE_INSTANCE;
                    }
                    break;
                }
            }
            bindingDescriptions[i].inputRate = inputRate;
            bindingDescriptions[i].binding = i;
        }
        vertexInputState.vertexBindingDescriptionCount = bindingDescriptions.size();
        vertexInputState.pVertexBindingDescriptions = bindingDescriptions.data();
        pipelineInfo.pVertexInputState = &vertexInputState;

        // renderPass
        auto &gfx_renderPass = info->renderPass;
        VkPipelineMultisampleStateCreateInfo multisampleState = {VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO};
        multisampleState.sampleShadingEnable = VK_FALSE;
        multisampleState.rasterizationSamples = static_cast<VkSampleCountFlagBits>(gfx_renderPass->info->samples);
        multisampleState.minSampleShading = 1.0f;
        multisampleState.alphaToCoverageEnable = VK_FALSE;
        multisampleState.alphaToOneEnable = VK_FALSE;
        pipelineInfo.pMultisampleState = &multisampleState;
        pipelineInfo.renderPass = gfx_renderPass->impl();
        pipelineInfo.subpass = 0;

        // layout
        pipelineInfo.layout = info->layout->impl();

        if (vkCreateGraphicsPipelines(*_impl->_device, VK_NULL_HANDLE, 1, &pipelineInfo, nullptr, &_impl->_pipeline))
        {
            return true;
        }
        return false;
    }

    Pipeline::~Pipeline()
    {
        VkDevice device = *_impl->_device;
        VkPipeline pipeline = _impl->_pipeline;
        vkDestroyPipeline(device, pipeline, nullptr);
    }
}
