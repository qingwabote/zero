add_library(samp STATIC ./samp.cpp)
target_include_directories(samp PUBLIC ./include)

add_subdirectory(../forma forma)
target_link_libraries(samp PUBLIC forma)
