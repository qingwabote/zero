cmake_minimum_required(VERSION 3.23)

project(zero CXX)

add_executable(zero WIN32 main.cpp)
set_property(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR} PROPERTY VS_STARTUP_PROJECT zero)

add_subdirectory(../../core ${CMAKE_CURRENT_BINARY_DIR}/core)
target_link_libraries(zero PRIVATE core)

foreach(item ${WIN32_DLLS})
    get_filename_component(filename ${item} NAME)
    get_filename_component(abs ${item} ABSOLUTE)
    add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different ${abs} $<TARGET_FILE_DIR:${PROJECT_NAME}>/${filename}
    )
endforeach()