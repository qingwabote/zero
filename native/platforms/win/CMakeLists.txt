cmake_minimum_required(VERSION 3.24)

project(zero CXX)

set(CMAKE_CXX_STANDARD 17)

set_property(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR} PROPERTY VS_STARTUP_PROJECT zero)

add_executable(zero WIN32 main.cpp)

# sdl
add_library(sdl SHARED IMPORTED GLOBAL)
set_target_properties(sdl PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/sdl/SDL2.dll
    IMPORTED_IMPLIB ${CMAKE_CURRENT_LIST_DIR}/libs/sdl/SDL2.lib
)
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_LIST_DIR}/libs/sdl/SDL2.dll $<TARGET_FILE_DIR:${PROJECT_NAME}>/${SDL2.dll}
)

# v8
add_library(v8 SHARED IMPORTED GLOBAL)
set_target_properties(v8 PROPERTIES
    INTERFACE_COMPILE_DEFINITIONS V8_COMPRESS_POINTERS
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/v8/release/v8.dll
    IMPORTED_IMPLIB ${CMAKE_CURRENT_LIST_DIR}/libs/v8/release/v8.dll.lib
    IMPORTED_LOCATION_DEBUG ${CMAKE_CURRENT_LIST_DIR}/libs/v8/debug/v8.dll
    IMPORTED_IMPLIB_DEBUG ${CMAKE_CURRENT_LIST_DIR}/libs/v8/debug/v8.dll.lib
)
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_LIST_DIR}/libs/v8/$<IF:$<CONFIG:Debug>,debug,release>/v8.dll $<TARGET_FILE_DIR:${PROJECT_NAME}>/${v8.dll}
)
add_library(v8_libbase SHARED IMPORTED GLOBAL)
set_target_properties(v8_libbase PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/v8/release/v8_libbase.dll
    IMPORTED_IMPLIB ${CMAKE_CURRENT_LIST_DIR}/libs/v8/release/v8_libbase.dll.lib
    IMPORTED_LOCATION_DEBUG ${CMAKE_CURRENT_LIST_DIR}/libs/v8/debug/v8_libbase.dll
    IMPORTED_IMPLIB_DEBUG ${CMAKE_CURRENT_LIST_DIR}/libs/v8/debug/v8_libbase.dll.lib
)
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_LIST_DIR}/libs/v8/$<IF:$<CONFIG:Debug>,debug,release>/v8_libbase.dll $<TARGET_FILE_DIR:${PROJECT_NAME}>/${v8_libbase.dll}
)
add_library(v8_libplatform SHARED IMPORTED GLOBAL)
set_target_properties(v8_libplatform PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/v8/release/v8_libplatform.dll
    IMPORTED_IMPLIB ${CMAKE_CURRENT_LIST_DIR}/libs/v8/release/v8_libplatform.dll.lib
    IMPORTED_LOCATION_DEBUG ${CMAKE_CURRENT_LIST_DIR}/libs/v8/debug/v8_libplatform.dll
    IMPORTED_IMPLIB_DEBUG ${CMAKE_CURRENT_LIST_DIR}/libs/v8/debug/v8_libplatform.dll.lib
)
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_LIST_DIR}/libs/v8/$<IF:$<CONFIG:Debug>,debug,release>/v8_libplatform.dll $<TARGET_FILE_DIR:${PROJECT_NAME}>/${v8_libplatform.dll}
)
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_LIST_DIR}/libs/v8/$<IF:$<CONFIG:Debug>,debug,release>/zlib.dll $<TARGET_FILE_DIR:${PROJECT_NAME}>/${zlib.dll}
)
target_link_libraries(v8 INTERFACE v8_libbase v8_libplatform)

# glslang
set(glslang_libs glslang glslang-default-resource-limits MachineIndependent OGLCompiler OSDependent SPIRV GenericCodeGen)

foreach(name IN LISTS glslang_libs)
    add_library(${name} STATIC IMPORTED GLOBAL)
    set_target_properties(${name} PROPERTIES
        IMPORTED_LOCATION_DEBUG ${CMAKE_CURRENT_LIST_DIR}/libs/glslang/${name}d.lib
        IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/glslang/${name}.lib
    )
endforeach()

add_subdirectory(../../main ${CMAKE_CURRENT_BINARY_DIR}/main)
target_link_libraries(zero PRIVATE zero::main)

add_subdirectory(../gfx/vulkan gfx)
target_link_libraries(zero PRIVATE zero::gfx)