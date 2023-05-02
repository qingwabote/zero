set(SRC_FILES
    internal/volk/volk.c
    VkDevice.cpp
    VkCommandBuffer.cpp
    VkBuffer.cpp
    VkTexture.cpp
    VkSampler.cpp
    VkShader.cpp
    VkRenderPass.cpp
    VkFramebuffer.cpp
    VkInputAssembler.cpp
    VkPipelineLayout.cpp
    VkPipeline.cpp
    VkDescriptorSetLayout.cpp
    VkDescriptorSet.cpp
    VkFence.cpp
    VkSemaphore.cpp
    VkQueue.cpp
)

add_library(gfx STATIC ${SRC_FILES})
target_include_directories(gfx PRIVATE ./internal ../internal)

# add_subdirectory(../../main ${CMAKE_CURRENT_BINARY_DIR}/main)
target_link_libraries(gfx PRIVATE main)

target_link_libraries(gfx PRIVATE ${glslang_libs})

set(VK_BOOTSTRAP_VULKAN_HEADER_DIR ${CMAKE_CURRENT_LIST_DIR}/internal)
add_subdirectory(thirdparty/vk-bootstrap)
target_link_libraries(gfx PRIVATE vk-bootstrap)