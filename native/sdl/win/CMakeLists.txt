add_library(sdl SHARED IMPORTED GLOBAL)

target_include_directories(sdl INTERFACE ../include)

set_target_properties(sdl PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/SDL2.dll
    IMPORTED_IMPLIB ${CMAKE_CURRENT_LIST_DIR}/SDL2.lib
)

add_custom_target(sdl_copy_dll 
    COMMAND ${CMAKE_COMMAND} -E make_directory $<TARGET_FILE_DIR:${PROJECT_NAME}>
    COMMAND ${CMAKE_COMMAND} -E copy_if_different ${CMAKE_CURRENT_LIST_DIR}/SDL2.dll $<TARGET_FILE_DIR:${PROJECT_NAME}>/${SDL2.dll}
)
add_dependencies(sdl sdl_copy_dll)