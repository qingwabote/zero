add_library(sampler-jsb STATIC ./build/sampler_swig.cpp ./sampler.cpp)

add_subdirectory(../sampler sampler-build)
target_link_libraries(sampler-jsb PRIVATE sampler)
target_include_directories(sampler-jsb PUBLIC ./include)