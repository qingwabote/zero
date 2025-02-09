add_library(spi STATIC ./extension.c ./AnimationState.c ./Atlas.c ./Model.c ./Skeleton.c ./SkeletonBinary.c)
target_include_directories(spi PUBLIC ./include)

add_subdirectory(./${SPINE_C})
target_link_libraries(spi PUBLIC spine-c)