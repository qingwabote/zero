#include "bindings/gfx/Pipeline.hpp"
#include "VkPipeline_impl.hpp"

#include "bindings/gfx/Shader.hpp"
#include "VkShader_impl.hpp"

#include "bindings/gfx/DescriptorSetLayout.hpp"
#include "VkDescriptorSetLayout_impl.hpp"

#include "bindings/gfx/PipelineLayout.hpp"
#include "VkPipelineLayout_impl.hpp"

#include "bindings/gfx/RenderPass.hpp"
#include "VkRenderPass_impl.hpp"

namespace binding
{
    namespace gfx
    {
        Pipeline_impl::Pipeline_impl(Device_impl *device) : _device(device) {}
        Pipeline_impl::~Pipeline_impl() {}

        Pipeline::Pipeline(std::unique_ptr<Pipeline_impl> impl)
            : Binding(), _impl(std::move(impl)) {}

        bool Pipeline::initialize(v8::Local<v8::Object> info)
        {
            v8::Isolate *isolate = v8::Isolate::GetCurrent();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            VkGraphicsPipelineCreateInfo pipelineInfo = {};
            pipelineInfo.sType = VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO;

            v8::Local<v8::Object> js_shader = sugar::v8::object_get(info, "shader").As<v8::Object>();
            Shader *c_shader = retain<Shader>(js_shader);
            auto &stageInfos = c_shader->impl()->stageInfos();
            pipelineInfo.stageCount = stageInfos.size();
            pipelineInfo.pStages = stageInfos.data();

            VkPipelineVertexInputStateCreateInfo vertexInputState = {};
            vertexInputState.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;

            v8::Local<v8::Object> js_vertexInputState = sugar::v8::object_get(info, "vertexInputState").As<v8::Object>();
            v8::Local<v8::Array> js_attributes = sugar::v8::object_get(js_vertexInputState, "attributes").As<v8::Array>();
            std::vector<VkVertexInputAttributeDescription> attributes{js_attributes->Length()};
            for (uint32_t i = 0; i < js_attributes->Length(); i++)
            {
                v8::Local<v8::Object> js_attribute = js_attributes->Get(context, i).ToLocalChecked().As<v8::Object>();
                attributes[i].location = sugar::v8::object_get(js_attribute, "location").As<v8::Number>()->Value();
                attributes[i].binding = sugar::v8::object_get(js_attribute, "binding").As<v8::Number>()->Value();
                attributes[i].format = static_cast<VkFormat>(sugar::v8::object_get(js_attribute, "format").As<v8::Number>()->Value());
                attributes[i].offset = sugar::v8::object_get(js_attribute, "offset").As<v8::Number>()->Value();
            }
            vertexInputState.vertexAttributeDescriptionCount = attributes.size();
            vertexInputState.pVertexAttributeDescriptions = attributes.data();

            v8::Local<v8::Array> js_bindings = sugar::v8::object_get(js_vertexInputState, "bindings").As<v8::Array>();
            std::vector<VkVertexInputBindingDescription> bindingDescriptions{js_bindings->Length()};
            for (uint32_t i = 0; i < js_bindings->Length(); i++)
            {
                v8::Local<v8::Object> js_binding = js_bindings->Get(context, i).ToLocalChecked().As<v8::Object>();
                bindingDescriptions[i].binding = sugar::v8::object_get(js_binding, "binding").As<v8::Number>()->Value();
                bindingDescriptions[i].stride = sugar::v8::object_get(js_binding, "stride").As<v8::Number>()->Value();
                bindingDescriptions[i].inputRate = static_cast<VkVertexInputRate>(sugar::v8::object_get(js_binding, "inputRate").As<v8::Number>()->Value());
            }
            vertexInputState.vertexBindingDescriptionCount = bindingDescriptions.size();
            vertexInputState.pVertexBindingDescriptions = bindingDescriptions.data();
            pipelineInfo.pVertexInputState = &vertexInputState;

            VkPipelineInputAssemblyStateCreateInfo inputAssemblyState = {};
            inputAssemblyState.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
            inputAssemblyState.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
            pipelineInfo.pInputAssemblyState = &inputAssemblyState;

            std::vector<VkDynamicState> dynamicStates({VK_DYNAMIC_STATE_VIEWPORT, VK_DYNAMIC_STATE_SCISSOR, VK_DYNAMIC_STATE_FRONT_FACE});
            VkPipelineDynamicStateCreateInfo dynamicState{VK_STRUCTURE_TYPE_PIPELINE_DYNAMIC_STATE_CREATE_INFO};
            dynamicState.dynamicStateCount = dynamicStates.size();
            dynamicState.pDynamicStates = dynamicStates.data();
            pipelineInfo.pDynamicState = &dynamicState;

            VkPipelineViewportStateCreateInfo viewportState{VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO};
            viewportState.viewportCount = 1;
            viewportState.scissorCount = 1;
            pipelineInfo.pViewportState = &viewportState;

            v8::Local<v8::Object> js_rasterizationState = sugar::v8::object_get(info, "rasterizationState").As<v8::Object>();

            VkPipelineRasterizationStateCreateInfo rasterizationState{VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO};
            rasterizationState.rasterizerDiscardEnable = VK_FALSE;
            rasterizationState.polygonMode = VK_POLYGON_MODE_FILL;
            rasterizationState.cullMode = sugar::v8::object_get(js_rasterizationState, "cullMode").As<v8::Number>()->Value();
            rasterizationState.depthBiasEnable = VK_FALSE;
            rasterizationState.depthBiasConstantFactor = 0;
            rasterizationState.depthBiasClamp = 0;
            rasterizationState.depthBiasSlopeFactor = 0;
            rasterizationState.lineWidth = 1;
            pipelineInfo.pRasterizationState = &rasterizationState;

            VkSampleCountFlagBits rasterizationSamples = VK_SAMPLE_COUNT_1_BIT;

            v8::Local<v8::Object> js_renderPass = sugar::v8::object_get(info, "renderPass").As<v8::Object>();
            auto c_renderPass = retain<RenderPass>(js_renderPass);

            VkPipelineMultisampleStateCreateInfo multisampleState = {VK_STRUCTURE_TYPE_PIPELINE_MULTISAMPLE_STATE_CREATE_INFO};
            multisampleState.sampleShadingEnable = VK_FALSE;
            multisampleState.rasterizationSamples = static_cast<VkSampleCountFlagBits>(sugar::v8::object_get(c_renderPass->info(), "samples").As<v8::Number>()->Value());
            multisampleState.minSampleShading = 1.0f;
            multisampleState.alphaToCoverageEnable = VK_FALSE;
            multisampleState.alphaToOneEnable = VK_FALSE;
            pipelineInfo.pMultisampleState = &multisampleState;

            VkPipelineColorBlendAttachmentState colorBlendAttachment = {};
            colorBlendAttachment.colorWriteMask = VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT |
                                                  VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT;
            colorBlendAttachment.blendEnable = VK_FALSE;

            VkPipelineColorBlendStateCreateInfo colorBlending = {VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO};
            colorBlending.logicOpEnable = VK_FALSE;
            colorBlending.logicOp = VK_LOGIC_OP_COPY;
            colorBlending.attachmentCount = 1;
            colorBlending.pAttachments = &colorBlendAttachment;
            pipelineInfo.pColorBlendState = &colorBlending;

            VkPipelineDepthStencilStateCreateInfo depthStencilState = {VK_STRUCTURE_TYPE_PIPELINE_DEPTH_STENCIL_STATE_CREATE_INFO};
            depthStencilState.depthTestEnable = VK_TRUE;
            depthStencilState.depthWriteEnable = VK_TRUE;
            depthStencilState.depthCompareOp = VK_COMPARE_OP_LESS;
            depthStencilState.stencilTestEnable = VK_FALSE;
            pipelineInfo.pDepthStencilState = &depthStencilState;

            v8::Local<v8::Object> js_layout = sugar::v8::object_get(info, "layout").As<v8::Object>();
            pipelineInfo.layout = retain<PipelineLayout>(js_layout)->impl();

            pipelineInfo.renderPass = c_renderPass->impl();
            pipelineInfo.subpass = 0;

            if (vkCreateGraphicsPipelines(_impl->_device->device(), VK_NULL_HANDLE, 1, &pipelineInfo, nullptr, &_impl->_pipeline))
            {
                return true;
            }

            return false;
        }

        Pipeline::~Pipeline()
        {
            VkDevice device = _impl->_device->device();
            VkPipeline pipeline = _impl->_pipeline;
            vkDestroyPipeline(device, pipeline, nullptr);
        }
    }
}