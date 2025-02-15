add_library(yoga-jsb STATIC ./build/yoga.cpp ./callbacks.cpp ./js.cpp)

add_subdirectory(../yoga-3.2.0 yoga-build)
target_link_libraries(yoga-jsb PRIVATE yogacore)
target_include_directories(yoga-jsb PUBLIC ./include)
