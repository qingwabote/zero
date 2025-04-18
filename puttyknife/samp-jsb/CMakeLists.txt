add_library(samp-jsb STATIC ./build/samp_swig.cpp ./samp.cpp)

add_subdirectory(../samp samp-build)
target_link_libraries(samp-jsb PRIVATE samp)
target_include_directories(samp-jsb PUBLIC ./include)