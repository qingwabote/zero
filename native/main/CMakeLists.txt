set(SRC_FILES
    base/threading/ThreadPool.cpp
    base/threading/Semaphore.cpp
    Window.cpp
    sugars/sdlsugar.cpp
    sugars/v8sugar.cpp
    Binding.cpp
    bindings/Console.cpp
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
    bindings/gfx/InputAssembler.cpp
    bindings/gfx/PipelineLayout.cpp
    bindings/gfx/Pipeline.cpp
    bindings/gfx/DescriptorSetLayout.cpp
    bindings/gfx/DescriptorSet.cpp
    bindings/gfx/Fence.cpp
    bindings/gfx/Semaphore.cpp
    bindings/gfx/Queue.cpp
)

add_library(main STATIC ${SRC_FILES})
target_include_directories(main PUBLIC ./)

add_subdirectory(thirdparty/sdl2)
target_link_libraries(main PUBLIC SDL2)

add_subdirectory(thirdparty/v8)
target_link_libraries(main PUBLIC v8)

set(WIN32_DLLS ${WIN32_DLLS} PARENT_SCOPE)