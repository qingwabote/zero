cmake_minimum_required(VERSION 3.22)

project(yoga-wasm)

# https://emscripten.org/docs/porting/exceptions.html#webassembly-exception-handling-based-support
# set(CMAKE_CXX_FLAGS "-fwasm-exceptions")

set(CMAKE_CXX_FLAGS "-fno-exceptions -sDISABLE_EXCEPTION_CATCHING=1")

set(CMAKE_CXX_FLAGS_DEBUG "-g")
set(CMAKE_CXX_FLAGS_RELEASE "-O3 -flto")

add_executable(yoga-wasm ./callbacks.cpp)

add_subdirectory(../yoga-3.2.0 yoga-build)
target_link_libraries(yoga-wasm PRIVATE yogacore)

target_link_options(yoga-wasm PRIVATE --no-entry -sFILESYSTEM=0 "-sEXPORTED_FUNCTIONS=[\
    '_malloc','_free',\
    '_YGNodeNew','_YGNodeSetDirtiedFunc_PK'\
]")
set_target_properties(yoga-wasm PROPERTIES RUNTIME_OUTPUT_DIRECTORY /zero/assets 
                                       RUNTIME_OUTPUT_NAME yoga)
set(CMAKE_EXECUTABLE_SUFFIX ".wasm")