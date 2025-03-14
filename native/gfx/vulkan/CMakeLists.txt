set(SRC_FILES
    ../info.cpp
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

add_library(gfx STATIC ${SRC_FILES})

add_subdirectory(../../bastard bastard)
target_link_libraries(gfx PRIVATE bastard)
target_link_libraries(gfx PUBLIC sdl)

target_include_directories(gfx PUBLIC ../include PRIVATE ./internal ../internal)

target_link_libraries(gfx PRIVATE ${glslang_libs})

target_compile_definitions(gfx PRIVATE VK_NO_PROTOTYPES)

if(ANDROID)
    target_compile_definitions(gfx PRIVATE VK_USE_PLATFORM_ANDROID_KHR)
elseif(WIN32)
    target_compile_definitions(gfx PRIVATE NOMINMAX) # https://stackoverflow.com/questions/2789481/problem-calling-stdmax
    target_compile_definitions(gfx PRIVATE VK_USE_PLATFORM_WIN32_KHR)
endif()