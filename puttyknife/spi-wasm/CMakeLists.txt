cmake_minimum_required(VERSION 3.22)

project(spi-wasm)

set(CMAKE_C_FLAGS "-fno-exceptions -sSUPPORT_LONGJMP=0")

set(CMAKE_C_FLAGS_DEBUG "-g")
set(CMAKE_C_FLAGS_RELEASE "-O3 -flto")

add_executable(spi-wasm ./null.c)

add_subdirectory(../spi spi-build)
target_link_libraries(spi-wasm PRIVATE -Wl,--whole-archive spi -Wl,--no-whole-archive)

target_link_options(spi-wasm PRIVATE --no-entry "-sEXPORTED_FUNCTIONS=[\
    '_malloc','_free'\
]")
set_target_properties(spi-wasm PROPERTIES RUNTIME_OUTPUT_DIRECTORY /zero/assets 
                                       RUNTIME_OUTPUT_NAME spi)
set(CMAKE_EXECUTABLE_SUFFIX ".wasm")