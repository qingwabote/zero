set(PHYS bullet-end CACHE STRING "The dir name of the backend of phys")

add_library(phys-jsb STATIC build/phys_swig.cpp callbacks.cpp phys.cpp)

add_subdirectory(../phys/${PHYS} phys)
target_link_libraries(phys-jsb PRIVATE phys)

target_include_directories(phys-jsb PUBLIC include)
