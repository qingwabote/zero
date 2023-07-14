#include "triangle.hpp"
#include "../VkDevice_impl.hpp"
#include "../VkShader_impl.hpp"
#include "../VkRenderPass_impl.hpp"
#include "SDL_events.h"
#include <thread>

namespace
{
    const char *vs = R"(
        layout(location = 0) in vec3 a_position;
        void main() {
            gl_Position = vec4(a_position, 1);
        }
        // void main()
        // {
        //     //const array of positions for the triangle
        //     const vec3 positions[3] = vec3[3](
        //         vec3(1.f,1.f, 0.0f),
        //         vec3(-1.f,1.f, 0.0f),
        //         vec3(0.f,-1.f, 0.0f)
        //     );

        //     //output the position of each vertex
        //     gl_Position = vec4(positions[gl_VertexIndex], 1.0f);
        // }
    )";

    const char *fs = R"(
        precision highp float;
        layout(location = 0) out vec4 v_color;
        void main() {
            vec4 baseColor = vec4(1.0, 1.0, 1.0, 1.0);
            v_color = baseColor;
        }
    )";
}

namespace tests::triangle
{
    bool draw(std::unique_ptr<SDL_Window, void (*)(SDL_Window *)> sdl_window)
    {
        auto device = new gfx::Device_impl(sdl_window.get());
        if (device->initialize())
        {
            return true;
        }

        gfx::ShaderInfo shaderInfo;
        shaderInfo.sources->emplace_back(vs);
        shaderInfo.types->emplace_back(static_cast<uint32_t>(gfx::ShaderStageFlagBits::VERTEX));
        shaderInfo.sources->emplace_back(fs);
        shaderInfo.types->emplace_back(static_cast<uint32_t>(gfx::ShaderStageFlagBits::FRAGMENT));
        auto shader = new gfx::Shader_impl(device);
        if (shader->initialize(shaderInfo))
        {
            return true;
        }

        VkPipelineLayout pipelineLayout;
        VkPipelineLayoutCreateInfo pipelineLayoutCreateInfo{VK_STRUCTURE_TYPE_PIPELINE_LAYOUT_CREATE_INFO};
        if (vkCreatePipelineLayout(*device, &pipelineLayoutCreateInfo, nullptr, &pipelineLayout))
        {
            return true;
        }

        VkAttachmentDescription attachmentDescription{};
        attachmentDescription.format = device->swapchainImageFormat();
        attachmentDescription.samples = VK_SAMPLE_COUNT_1_BIT;
        attachmentDescription.loadOp = VK_ATTACHMENT_LOAD_OP_CLEAR;
        attachmentDescription.storeOp = VK_ATTACHMENT_STORE_OP_STORE;
        attachmentDescription.stencilLoadOp = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
        attachmentDescription.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
        attachmentDescription.initialLayout = VK_IMAGE_LAYOUT_UNDEFINED;
        attachmentDescription.finalLayout = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;
        VkAttachmentReference color_ref = {0, VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL};
        VkSubpassDescription subpass = {0};
        subpass.pipelineBindPoint = VK_PIPELINE_BIND_POINT_GRAPHICS;
        subpass.colorAttachmentCount = 1;
        subpass.pColorAttachments = &color_ref;
        VkSubpassDependency dependency = {0};
        dependency.srcSubpass = VK_SUBPASS_EXTERNAL;
        dependency.dstSubpass = 0;
        dependency.srcStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
        dependency.dstStageMask = VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT;
        dependency.srcAccessMask = 0;
        dependency.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_READ_BIT | VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT;
        VkRenderPassCreateInfo rp_info = {VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO};
        rp_info.attachmentCount = 1;
        rp_info.pAttachments = &attachmentDescription;
        rp_info.subpassCount = 1;
        rp_info.pSubpasses = &subpass;
        rp_info.dependencyCount = 1;
        rp_info.pDependencies = &dependency;
        VkRenderPass renderPass;
        vkCreateRenderPass(*device, &rp_info, nullptr, &renderPass);

        VkGraphicsPipelineCreateInfo pipelineInfo{};
        pipelineInfo.sType = VK_STRUCTURE_TYPE_GRAPHICS_PIPELINE_CREATE_INFO;
        pipelineInfo.layout = pipelineLayout;
        pipelineInfo.renderPass = renderPass;

        std::vector<VkVertexInputAttributeDescription> attributeDescriptions{1};
        auto &attributePosition = attributeDescriptions[0];
        attributePosition.location = 0;
        attributePosition.binding = 0;
        attributePosition.format = VK_FORMAT_R32G32B32_SFLOAT;
        attributePosition.offset = 0;
        std::vector<VkVertexInputBindingDescription> bindingDescriptions{1};
        auto &bindingDescription = bindingDescriptions[0];
        bindingDescription.binding = 0;
        bindingDescription.inputRate = VK_VERTEX_INPUT_RATE_VERTEX;
        bindingDescription.stride = 12;
        VkPipelineVertexInputStateCreateInfo vertexInputState{};
        vertexInputState.sType = VK_STRUCTURE_TYPE_PIPELINE_VERTEX_INPUT_STATE_CREATE_INFO;
        vertexInputState.pVertexAttributeDescriptions = attributeDescriptions.data();
        vertexInputState.vertexAttributeDescriptionCount = attributeDescriptions.size();
        vertexInputState.pVertexBindingDescriptions = bindingDescriptions.data();
        vertexInputState.vertexBindingDescriptionCount = bindingDescriptions.size();
        pipelineInfo.pVertexInputState = &vertexInputState;

        pipelineInfo.pStages = shader->stages().data();
        pipelineInfo.stageCount = shader->stages().size();

        VkPipelineInputAssemblyStateCreateInfo inputAssemblyState{};
        inputAssemblyState.sType = VK_STRUCTURE_TYPE_PIPELINE_INPUT_ASSEMBLY_STATE_CREATE_INFO;
        inputAssemblyState.topology = VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST;
        pipelineInfo.pInputAssemblyState = &inputAssemblyState;

        std::vector<VkDynamicState> dynamicStates({VK_DYNAMIC_STATE_VIEWPORT, VK_DYNAMIC_STATE_SCISSOR, VK_DYNAMIC_STATE_FRONT_FACE});
        VkPipelineDynamicStateCreateInfo dynamicState{VK_STRUCTURE_TYPE_PIPELINE_DYNAMIC_STATE_CREATE_INFO};
        dynamicState.pDynamicStates = dynamicStates.data();
        dynamicState.dynamicStateCount = dynamicStates.size();
        pipelineInfo.pDynamicState = &dynamicState;

        VkPipelineViewportStateCreateInfo viewportState{VK_STRUCTURE_TYPE_PIPELINE_VIEWPORT_STATE_CREATE_INFO};
        viewportState.viewportCount = 1;
        viewportState.scissorCount = 1;
        pipelineInfo.pViewportState = &viewportState;

        VkPipelineRasterizationStateCreateInfo rasterizationState{VK_STRUCTURE_TYPE_PIPELINE_RASTERIZATION_STATE_CREATE_INFO};
        rasterizationState.polygonMode = VK_POLYGON_MODE_FILL;
        rasterizationState.cullMode = VK_CULL_MODE_NONE;
        rasterizationState.lineWidth = 1;
        pipelineInfo.pRasterizationState = &rasterizationState;

        VkPipelineColorBlendAttachmentState colorBlendAttachment{};
        colorBlendAttachment.colorWriteMask = VK_COLOR_COMPONENT_R_BIT | VK_COLOR_COMPONENT_G_BIT |
                                              VK_COLOR_COMPONENT_B_BIT | VK_COLOR_COMPONENT_A_BIT;
        colorBlendAttachment.blendEnable = VK_FALSE;
        VkPipelineColorBlendStateCreateInfo colorBlending{VK_STRUCTURE_TYPE_PIPELINE_COLOR_BLEND_STATE_CREATE_INFO};
        colorBlending.attachmentCount = 1;
        colorBlending.pAttachments = &colorBlendAttachment;
        pipelineInfo.pColorBlendState = &colorBlending;

        VkPipeline pipeline;
        if (vkCreateGraphicsPipelines(*device, VK_NULL_HANDLE, 1, &pipelineInfo, nullptr, &pipeline))
        {
            return true;
        }

        float positions[] = {
            1.f, 1.f, 0.0f,
            -1.f, 1.f, 0.0f,
            0.f, -1.f, 0.0f};
        VkBufferCreateInfo bufferInfo{};
        bufferInfo.sType = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
        bufferInfo.usage = VK_BUFFER_USAGE_VERTEX_BUFFER_BIT;
        bufferInfo.size = sizeof(positions);
        VmaAllocationCreateInfo allocationCreateInfo{};
        allocationCreateInfo.usage = VMA_MEMORY_USAGE_CPU_TO_GPU;
        allocationCreateInfo.flags = VMA_ALLOCATION_CREATE_MAPPED_BIT;
        VkBuffer vertexBuffer;
        VmaAllocation allocation;
        VmaAllocationInfo allocationInfo{};
        if (vmaCreateBuffer(device->allocator(), &bufferInfo, &allocationCreateInfo, &vertexBuffer, &allocation, &allocationInfo))
        {
            return true;
        }
        memcpy(allocationInfo.pMappedData, positions, sizeof(positions));

        auto &swapchainExtent = device->swapchainImageExtent();
        std::vector<VkFramebuffer> framebuffers{device->swapchainImageViews().size()};
        for (size_t i = 0; i < device->swapchainImageViews().size(); i++)
        {
            std::vector<VkImageView> attachments;
            attachments.emplace_back(device->swapchainImageViews()[i]);

            VkFramebufferCreateInfo framebufferInfo{VK_STRUCTURE_TYPE_FRAMEBUFFER_CREATE_INFO};
            framebufferInfo.width = swapchainExtent.width;
            framebufferInfo.height = swapchainExtent.height;
            framebufferInfo.layers = 1;
            framebufferInfo.attachmentCount = attachments.size();
            framebufferInfo.pAttachments = attachments.data();
            framebufferInfo.renderPass = renderPass;
            vkCreateFramebuffer(*device, &framebufferInfo, nullptr, &framebuffers[i]);
        }

        VkCommandBufferAllocateInfo cmdAllocInfo{VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO};
        cmdAllocInfo.commandPool = device->commandPool();
        cmdAllocInfo.commandBufferCount = 1;
        cmdAllocInfo.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
        VkCommandBuffer commandBuffer;
        vkAllocateCommandBuffers(*device, &cmdAllocInfo, &commandBuffer);

        VkSemaphoreCreateInfo semaphoreCreateInfo{VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO};
        VkSemaphore acquiredSemaphore;
        vkCreateSemaphore(*device, &semaphoreCreateInfo, nullptr, &acquiredSemaphore);

        device->acquireNextImage(acquiredSemaphore);

        VkCommandBufferBeginInfo beginInfo = {VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO};
        beginInfo.flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT;
        vkBeginCommandBuffer(commandBuffer, &beginInfo);

        VkViewport viewport{};
        viewport.y = swapchainExtent.height;
        viewport.width = swapchainExtent.width;
        viewport.height = swapchainExtent.height * -1.0;
        vkCmdSetViewport(commandBuffer, 0, 1, &viewport);

        VkRect2D scissor = {};
        scissor.extent.width = swapchainExtent.width;
        scissor.extent.height = swapchainExtent.height;
        vkCmdSetScissor(commandBuffer, 0, 1, &scissor);

        VkRenderPassBeginInfo renderPassBeginInfo{VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO};
        renderPassBeginInfo.framebuffer = framebuffers[device->swapchainImageIndex()];
        renderPassBeginInfo.renderPass = renderPass;
        renderPassBeginInfo.renderArea.extent = {swapchainExtent.width, swapchainExtent.height};
        std::vector<VkClearValue> clearValues{1};
        clearValues[0].color = {{0.0f, 0.0f, 0.0f, 1.0f}};
        renderPassBeginInfo.clearValueCount = clearValues.size();
        renderPassBeginInfo.pClearValues = clearValues.data();
        vkCmdBeginRenderPass(commandBuffer, &renderPassBeginInfo, VK_SUBPASS_CONTENTS_INLINE);

        vkCmdBindPipeline(commandBuffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline);

        VkDeviceSize offsets[] = {0};
        VkBuffer vertexBuffers[] = {vertexBuffer};
        vkCmdBindVertexBuffers(commandBuffer, 0, 1, vertexBuffers, offsets);

        vkCmdDraw(commandBuffer, 3, 1, 0, 0);

        vkCmdEndRenderPass(commandBuffer);

        vkEndCommandBuffer(commandBuffer);

        VkSemaphore submitedSemaphore;
        vkCreateSemaphore(*device, &semaphoreCreateInfo, nullptr, &submitedSemaphore);
        VkSubmitInfo submitInfo = {VK_STRUCTURE_TYPE_SUBMIT_INFO};
        submitInfo.waitSemaphoreCount = 1;
        submitInfo.pWaitSemaphores = &acquiredSemaphore;
        VkPipelineStageFlags waitDstStageMasks[] = {VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT};
        submitInfo.pWaitDstStageMask = waitDstStageMasks;
        submitInfo.signalSemaphoreCount = 1;
        submitInfo.pSignalSemaphores = &submitedSemaphore;
        submitInfo.commandBufferCount = 1;
        submitInfo.pCommandBuffers = &commandBuffer;
        vkQueueSubmit(device->graphicsQueue(), 1, &submitInfo, nullptr);

        VkPresentInfoKHR presentInfo = {VK_STRUCTURE_TYPE_PRESENT_INFO_KHR};
        auto swapchain = device->swapchain();
        presentInfo.swapchainCount = 1;
        presentInfo.pSwapchains = &swapchain;
        presentInfo.waitSemaphoreCount = 1;
        presentInfo.pWaitSemaphores = &submitedSemaphore;
        auto swapchainImageIndex = device->swapchainImageIndex();
        presentInfo.pImageIndices = &swapchainImageIndex;
        vkQueuePresentKHR(device->graphicsQueue(), &presentInfo);

        bool running = true;
        while (running)
        {
            SDL_Event event;
            while (SDL_PollEvent(&event))
            {
                switch (event.type)
                {
                case SDL_QUIT:
                    running = false;
                    break;
                }
            }
            std::this_thread::sleep_for(std::chrono::seconds(1 / 60));
        }

        return false;
    }
}