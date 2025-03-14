cmake_minimum_required(VERSION 3.22)

project(phys-wasm)

set(PHYS bullet-end CACHE STRING "The dir name of the backend of phys")

set(CMAKE_CXX_FLAGS "-fno-exceptions -sSUPPORT_LONGJMP=0 -sDISABLE_EXCEPTION_CATCHING=1")

set(CMAKE_CXX_FLAGS_DEBUG "-g")
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -flto")

add_executable(phys-wasm ./callbacks.cpp)

add_subdirectory(../phys/${PHYS} phys)
target_link_libraries(phys-wasm PRIVATE -Wl,--whole-archive phys -Wl,--no-whole-archive)

target_link_options(phys-wasm PRIVATE --no-entry -sFILESYSTEM=0 "-sEXPORTED_FUNCTIONS=[\
    '_malloc','_free'\
]")
set_target_properties(phys-wasm PROPERTIES RUNTIME_OUTPUT_DIRECTORY /zero/assets 
                                       RUNTIME_OUTPUT_NAME phys)
set(CMAKE_EXECUTABLE_SUFFIX ".wasm")