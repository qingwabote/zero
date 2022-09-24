cmake_minimum_required(VERSION 3.24)

project(zero CXX)

set(CMAKE_CXX_STANDARD 17)

set_property(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR} PROPERTY VS_STARTUP_PROJECT zero)

set(SRC_FILES
    main.cpp
    utils/log.cpp
)

add_executable(zero WIN32 ${SRC_FILES})

add_subdirectory(../../core ${CMAKE_CURRENT_BINARY_DIR}/core)

target_link_libraries(zero PRIVATE core)

add_subdirectory(../gfx/vulkan gfx)
target_link_libraries(zero PRIVATE gfx)

foreach(item ${WIN32_DLLS})
    get_filename_component(filename ${item} NAME)
    get_filename_component(abs ${item} ABSOLUTE)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different ${abs} $<TARGET_FILE_DIR:${PROJECT_NAME}>/${filename}
    )
endforeach()