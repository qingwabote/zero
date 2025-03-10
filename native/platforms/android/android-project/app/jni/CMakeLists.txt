# https://cmake.org/cmake/help/latest/policy/CMP0079.html
cmake_minimum_required(VERSION 3.13)

project(zero)

set(CMAKE_CXX_STANDARD 17)

set(NATIVE_DIR "../../../../../../native")

# armeabi-v7a requires cpufeatures library
# include(AndroidNdkModules)
# android_ndk_import_module_cpufeatures()

# add_subdirectory(${NATIVE_DIR}/sdl/android sdl)
add_subdirectory(${NATIVE_DIR}/gfx/android gfx)

# websockets
add_library(websockets SHARED IMPORTED GLOBAL)
set_target_properties(websockets PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/lws/libwebsockets.a
)

# v8
add_library(v8 STATIC IMPORTED GLOBAL)
set_target_properties(v8 PROPERTIES
    INTERFACE_COMPILE_DEFINITIONS V8_COMPRESS_POINTERS
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/v8/libv8_monolith.a
)

# __android_log_vprint used in v8
# https://developer.android.com/studio/projects/configure-cmake#add-ndk-api
find_library(log-lib log)
target_link_libraries(v8 INTERFACE ${log-lib})

add_library(main SHARED main.cpp)

add_subdirectory(${NATIVE_DIR}/main main)
target_link_libraries(main zero::main)

target_include_directories(main PRIVATE ${NATIVE_DIR}/platforms/)
