set(SRC_FILES
    Window.cpp
    sugars/sdlsugar.cpp
    sugars/v8sugar.cpp
    Binding.cpp
    bindings/Console.cpp
    bindings/gfx/Device.cpp
    bindings/gfx/CommandBuffer.cpp
    bindings/gfx/Buffer.cpp
    bindings/gfx/Shader.cpp
    bindings/gfx/Pipeline.cpp
    bindings/gfx/DescriptorSetLayout.cpp
    bindings/gfx/DescriptorSet.cpp
)

add_library(core STATIC ${SRC_FILES})
target_include_directories(core PUBLIC ./)

add_subdirectory(thirdparty/sdl2)
target_link_libraries(core PUBLIC SDL2)

add_subdirectory(thirdparty/v8)
target_link_libraries(core PUBLIC v8)

set(WIN32_DLLS ${WIN32_DLLS} PARENT_SCOPE)