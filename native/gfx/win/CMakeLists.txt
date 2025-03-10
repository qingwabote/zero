add_subdirectory(../../sdl/win sdl)

# glslang
set(glslang_libs glslang glslang-default-resource-limits MachineIndependent OGLCompiler OSDependent SPIRV GenericCodeGen)
foreach(name IN LISTS glslang_libs)
    add_library(${name} STATIC IMPORTED GLOBAL)
    set_target_properties(${name} PROPERTIES
        IMPORTED_LOCATION_DEBUG ${CMAKE_CURRENT_LIST_DIR}/glslang/${name}d.lib
        IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/glslang/${name}.lib
    )
endforeach()

add_subdirectory(../vulkan vulkan)