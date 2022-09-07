set(SRC_FILES
    VkDevice.cpp
    VKCommandBuffer.cpp
    VKBuffer.cpp
    VkShader.cpp
    VkPipeline.cpp
)

add_library(gfx STATIC ${SRC_FILES})

# add_subdirectory(../../core ${CMAKE_CURRENT_BINARY_DIR}/core)
target_link_libraries(gfx PRIVATE core)

# use vulkan sdk
find_package(Vulkan REQUIRED COMPONENTS glslang SPIRV-Tools)
target_link_libraries(gfx PRIVATE Vulkan::Vulkan Vulkan::glslang Vulkan::SPIRV-Tools)

# add lib SPIRV-Tools-opt that doesn't in FindVulkan
add_library(SPIRV-Tools-opt STATIC IMPORTED)
set_target_properties(SPIRV-Tools-opt PROPERTIES
    IMPORTED_CONFIGURATIONS "Release;Debug"
    IMPORTED_LOCATION_RELEASE $ENV{VULKAN_SDK}/Lib/SPIRV-Tools-opt.lib
    IMPORTED_LOCATION_DEBUG $ENV{VULKAN_SDK}/Lib/SPIRV-Tools-optd.lib
)
target_link_libraries(gfx PRIVATE SPIRV-Tools-opt)

add_subdirectory(thirdparty/vk-bootstrap)
target_link_libraries(gfx PRIVATE vk-bootstrap)