add_library(core STATIC gfx/Device.cpp)

add_subdirectory(thirdparty/sdl2)
target_link_libraries(core INTERFACE SDL2)

add_subdirectory(thirdparty/vulkan)

add_subdirectory(thirdparty/volk)
target_link_libraries(core INTERFACE volk)

set(WIN32_DLLS ${WIN32_DLLS} PARENT_SCOPE)