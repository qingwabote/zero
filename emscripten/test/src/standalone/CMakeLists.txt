cmake_minimum_required(VERSION 3.22)

project(standalone)

add_executable(standalone ./standalone.c)

set(CMAKE_EXECUTABLE_SUFFIX ".wasm")

target_link_options(standalone PRIVATE --no-entry -sEXPORTED_FUNCTIONS=['_malloc','_free','_getString','_setString'])

