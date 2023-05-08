# "3.10.2" Nothing special, just a supported version of android sdk
cmake_minimum_required(VERSION 3.10.2)

project(zero CXX)

set(CMAKE_CXX_STANDARD 17)

# armeabi-v7a requires cpufeatures library
# include(AndroidNdkModules)
# android_ndk_import_module_cpufeatures()

# sdl
add_library(sdl SHARED IMPORTED GLOBAL)
set_target_properties(sdl PROPERTIES
    IMPORTED_LOCATION ${CMAKE_CURRENT_LIST_DIR}/libs/sdl/libSDL2.so
)

# Compilation of companion libraries
# add_subdirectory(SDL_image)
# add_subdirectory(SDL_mixer)
# add_subdirectory(SDL_ttf)
add_library(main SHARED main.cpp)
target_link_libraries(main sdl)
target_include_directories(main PRIVATE ../../../../../main/sdl)
