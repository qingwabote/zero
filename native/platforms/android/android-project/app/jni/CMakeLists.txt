# "3.10.2" Nothing special, just a supported version of android sdk
cmake_minimum_required(VERSION 3.10.2)

project(zero)

set(CMAKE_CXX_STANDARD 17)

# armeabi-v7a requires cpufeatures library
# include(AndroidNdkModules)
# android_ndk_import_module_cpufeatures()

# sdl
add_library(sdl SHARED IMPORTED GLOBAL)
set_target_properties(sdl PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/sdl/libSDL2.so
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

# glslang
set(glslang_libs glslang glslang-default-resource-limits MachineIndependent OGLCompiler OSDependent SPIRV GenericCodeGen)

foreach(name IN LISTS glslang_libs)
    add_library(${name} STATIC IMPORTED GLOBAL)
    set_target_properties(${name} PROPERTIES
        IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/glslang/lib${name}.a
    )
endforeach()

# vkLayer
add_library(vkLayer SHARED IMPORTED)
set_target_properties(vkLayer PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/vklayer/libVkLayer_khronos_validation.so
)

add_library(main SHARED main.cpp)
target_link_libraries(main vkLayer)

add_subdirectory(../../../../../main main)
target_link_libraries(main zero::main)

add_subdirectory(../../../../gfx/vulkan gfx)
target_link_libraries(main zero::gfx)
