cmake_minimum_required(VERSION 3.24)

project(zero CXX C)

set(CMAKE_CXX_STANDARD 17)

set_property(DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR} PROPERTY VS_STARTUP_PROJECT zero)

add_executable(zero WIN32 main.cpp)

# add_subdirectory(../../sdl/win sdl)
add_subdirectory(../../gfx/win gfx)

# websockets
add_library(websockets SHARED IMPORTED GLOBAL)
set_target_properties(websockets PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/lws/websockets.dll
    IMPORTED_IMPLIB ${CMAKE_CURRENT_LIST_DIR}/libs/lws/websockets.lib
)
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_LIST_DIR}/libs/lws/websockets.dll $<TARGET_FILE_DIR:${PROJECT_NAME}>/${websockets.dll}
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

add_subdirectory(../../main main)
target_link_libraries(zero PRIVATE zero::main)