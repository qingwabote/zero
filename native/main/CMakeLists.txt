set(SRC_FILES
    base/threading/ThreadPool.cpp
    base/threading/Semaphore.cpp
    Window.cpp
    Loader.cpp
    sugars/sdlsugar.cpp
    sugars/v8sugar.cpp
    tests/v8.cpp
    Binding.cpp
    internal/console.cpp
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
    swig/auto/ImageBitmap_wrap.cpp
    swig/auto/Loader_wrap.cpp
    swig/auto/gfx_wrap.cpp
    swig/auto/global_wrap.cpp
)

add_library(zero_main STATIC ${SRC_FILES})

target_link_libraries(zero_main PUBLIC sdl)
target_link_libraries(zero_main PUBLIC v8)
target_include_directories(zero_main PUBLIC ./ ./sdl ./v8)

include(FetchContent)
FetchContent_Declare(json URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz)
FetchContent_MakeAvailable(json)
target_link_libraries(zero_main PRIVATE nlohmann_json::nlohmann_json)

add_library(zero::main ALIAS zero_main)