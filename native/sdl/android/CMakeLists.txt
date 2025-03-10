add_library(sdl SHARED IMPORTED GLOBAL)

target_include_directories(sdl INTERFACE ../include)

set_target_properties(sdl PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libSDL2.so
)