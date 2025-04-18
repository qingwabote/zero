add_library(samp STATIC ./vec3.cpp ./quat.cpp ./samp.cpp)
target_include_directories(samp PUBLIC ./include)
