add_library(forma-jsb STATIC ./build/forma_swig.cpp ./forma.cpp)

add_subdirectory(../forma forma-binary)
target_link_libraries(forma-jsb PRIVATE forma)
target_include_directories(forma-jsb PUBLIC ./include)