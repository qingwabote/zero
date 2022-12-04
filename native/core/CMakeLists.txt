set(SRC_FILES
    ThreadPool.cpp
    Window.cpp
    sugars/sdlsugar.cpp
    sugars/v8sugar.cpp
    Binding.cpp
    bindings/Console.cpp
    bindings/Performance.cpp
    bindings/Loader.cpp
    bindings/ImageBitmap.cpp
    bindings/Platform.cpp
    bindings/gfx/Device.cpp
    bindings/gfx/CommandBuffer.cpp
    bindings/gfx/Buffer.cpp
    bindings/gfx/Texture.cpp
    bindings/gfx/Sampler.cpp
    bindings/gfx/Shader.cpp
    bindings/gfx/RenderPass.cpp
    bindings/gfx/Framebuffer.cpp
    bindings/gfx/PipelineLayout.cpp
    bindings/gfx/Pipeline.cpp
    bindings/gfx/DescriptorSetLayout.cpp
    bindings/gfx/DescriptorSet.cpp
    bindings/gfx/Fence.cpp
    bindings/gfx/Semaphore.cpp
)

add_library(core STATIC ${SRC_FILES})
target_include_directories(core PUBLIC ./)

add_subdirectory(thirdparty/sdl2)
target_link_libraries(core PUBLIC SDL2)

add_subdirectory(thirdparty/v8)
target_link_libraries(core PUBLIC v8)

set(WIN32_DLLS ${WIN32_DLLS} PARENT_SCOPE)