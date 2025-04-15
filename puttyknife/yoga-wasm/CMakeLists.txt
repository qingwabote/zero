add_library(yoga-wasm STATIC ./callbacks.cpp ./context.cpp)

add_subdirectory(../yoga yoga-pk)
target_link_libraries(yoga-wasm PUBLIC yoga-pk)