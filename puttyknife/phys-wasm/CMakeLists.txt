set(PHYS bullet-end CACHE STRING "The dir name of the backend of phys")

add_library(phys-wasm STATIC ./callbacks.cpp)

add_subdirectory(../phys/${PHYS} phys)
target_link_libraries(phys-wasm PUBLIC phys)