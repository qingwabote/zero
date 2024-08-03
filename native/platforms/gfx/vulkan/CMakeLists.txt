set(SRC_FILES
    internal/volk/volk.c
    internal/DescriptorSetPool.cpp
    Device.cpp
    CommandBuffer.cpp
    Buffer.cpp
    Texture.cpp
    Sampler.cpp
    Shader.cpp
    RenderPass.cpp
    Framebuffer.cpp
    PipelineLayout.cpp
    Pipeline.cpp
    DescriptorSetLayout.cpp
    DescriptorSet.cpp
    Fence.cpp
    Semaphore.cpp
    Queue.cpp
    Swapchain.cpp

    tests/triangle.cpp
)

add_library(zero_gfx STATIC ${SRC_FILES})
target_include_directories(zero_gfx PRIVATE ./internal ../internal)

target_link_libraries(zero_gfx PRIVATE zero::main)

target_link_libraries(zero_gfx PRIVATE ${glslang_libs})

target_compile_definitions(zero_gfx PRIVATE VK_NO_PROTOTYPES)

if(ANDROID)
    target_compile_definitions(zero_gfx PRIVATE VK_USE_PLATFORM_ANDROID_KHR)
elseif(WIN32)
    target_compile_definitions(zero_gfx PRIVATE NOMINMAX) # https://stackoverflow.com/questions/2789481/problem-calling-stdmax
    target_compile_definitions(zero_gfx PRIVATE VK_USE_PLATFORM_WIN32_KHR)
endif()

add_library(zero::gfx ALIAS zero_gfx)