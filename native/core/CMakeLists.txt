set(SRC_FILES
    Window.cpp
)

add_library(core STATIC ${SRC_FILES})
target_include_directories(core INTERFACE ./)

add_subdirectory(thirdparty/sdl2)
target_link_libraries(core PRIVATE SDL2)

set(WIN32_DLLS ${WIN32_DLLS} PARENT_SCOPE)