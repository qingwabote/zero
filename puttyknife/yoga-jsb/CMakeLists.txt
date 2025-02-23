add_library(yoga-jsb STATIC ./build/yoga_swig.cpp ./callbacks.cpp ./context.cpp ./yoga.cpp)

add_subdirectory(../yoga yoga-pk-build)
target_link_libraries(yoga-jsb PRIVATE yoga-pk)
target_include_directories(yoga-jsb PUBLIC ./include)
