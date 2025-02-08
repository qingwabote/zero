add_library(spine STATIC ./extension.c ./AnimationState.c ./Atlas.c ./Model.c ./Skeleton.c ./SkeletonBinary.c)

add_subdirectory(./${SPINE_C})
target_link_libraries(spine PRIVATE spine-c)