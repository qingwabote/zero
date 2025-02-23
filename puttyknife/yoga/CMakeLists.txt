add_library(yoga-pk STATIC ./extension.cpp)

add_subdirectory(./yoga-3.2.0 yoga-build)
target_link_libraries(yoga-pk PUBLIC yogacore)
target_include_directories(yoga-pk PUBLIC ./include)
