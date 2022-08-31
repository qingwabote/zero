set(SRC_FILES
    VkDevice.cpp
    VKCommandBuffer.cpp
    VkPipeline.cpp
)

add_library(gfx STATIC ${SRC_FILES})

# add_subdirectory(../../core ${CMAKE_CURRENT_BINARY_DIR}/core)
target_link_libraries(gfx PRIVATE core)

find_package(Vulkan REQUIRED)

if(TARGET Vulkan::Vulkan)
    message(" Vulkan as target")
    target_link_libraries(gfx PRIVATE Vulkan::Vulkan)
endif()

# add_subdirectory(thirdparty/vulkan)
# add_subdirectory(thirdparty/volk)
# target_link_libraries(gfx PRIVATE volk)
add_subdirectory(thirdparty/vk-bootstrap)
target_link_libraries(gfx PRIVATE vk-bootstrap)