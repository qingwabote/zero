cmake_minimum_required(VERSION 3.22)

add_library(spi-jsb STATIC ./build/spi_swig.cpp ./spi.cpp)

add_subdirectory(../spi spi-build)
target_link_libraries(spi-jsb PRIVATE spi)
target_include_directories(spi-jsb PUBLIC ./include)