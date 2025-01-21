cmake_minimum_required(VERSION 3.22)

project(spine)

set(CMAKE_C_FLAGS_DEBUG "-g")
set(CMAKE_C_FLAGS_RELEASE "-O3 -flto")

add_executable(spine ./extension.c ./AnimationState.c ./Atlas.c ./Model.c ./Skeleton.c ./SkeletonBinary.c)

add_subdirectory(./${SPINE_C})
target_link_libraries(spine PRIVATE spine-c)

target_link_options(spine PRIVATE --no-entry "-sEXPORTED_FUNCTIONS=[\
    '_malloc','_free'\
]")
set_target_properties(spine PROPERTIES RUNTIME_OUTPUT_DIRECTORY /zero/assets 
                                       RUNTIME_OUTPUT_NAME spine-c)
set(CMAKE_EXECUTABLE_SUFFIX ".wasm")