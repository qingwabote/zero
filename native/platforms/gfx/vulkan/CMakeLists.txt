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

add_library(zero_gfx STATIC ${SRC_FILES})
target_include_directories(zero_gfx PRIVATE ./internal ../internal)

target_link_libraries(zero_gfx PRIVATE zero::main)

target_link_libraries(zero_gfx PRIVATE ${glslang_libs})

set(VK_BOOTSTRAP_VULKAN_HEADER_DIR ${CMAKE_CURRENT_LIST_DIR}/internal)
add_subdirectory(internal/vk-bootstrap)
target_link_libraries(zero_gfx PRIVATE vk-bootstrap)

add_library(zero::gfx ALIAS zero_gfx)