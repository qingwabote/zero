add_subdirectory(../../sdl/android sdl)

# glslang
set(glslang_libs glslang glslang-default-resource-limits MachineIndependent OGLCompiler OSDependent SPIRV GenericCodeGen)
foreach(name IN LISTS glslang_libs)
    add_library(${name} STATIC IMPORTED GLOBAL)
    set_target_properties(${name} PROPERTIES
        IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/glslang/lib${name}.a
    )
endforeach()

add_subdirectory(../vulkan vulkan)

# vkLayer
add_library(vkLayer SHARED IMPORTED)
set_target_properties(vkLayer PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/vklayer/libVkLayer_khronos_validation.so
)
target_link_libraries(gfx PRIVATE vkLayer)