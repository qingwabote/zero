add_library(spi-wasm STATIC ./null.c)

add_subdirectory(../spi spi)
target_link_libraries(spi-wasm PUBLIC spi)