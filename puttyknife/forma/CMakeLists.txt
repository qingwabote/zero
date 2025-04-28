if(TARGET forma)
    return()
endif()

add_library(forma STATIC ./vec3.cpp ./quat.cpp ./mat4.cpp ./forma.cpp)
target_include_directories(forma PUBLIC ./include)
