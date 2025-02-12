target_include_directories(v8 INTERFACE ./v8)

set(SRC_FILES
    base/threading/ThreadPool.cpp
    gfx/info.cpp
    Window.cpp
    Loader.cpp
    sugars/sdlsugar.cpp
    sugars/internal/v8/ImportMap.cpp
    sugars/v8sugar.cpp
    WebSocket.cpp
    InspectorChannel.cpp
    InspectorClient.cpp
    tests/v8.cpp
    tests/websockets.cpp
    internal/console.cpp
    internal/text.cpp
    swig/auto/ImageBitmap_wrap.cpp
    swig/auto/Loader_wrap.cpp
    swig/auto/gfx_wrap.cpp
    swig/auto/Window_wrap.cpp
    bg/Device.cpp
    bg/CommandBuffer.cpp
    bg/Queue.cpp
)

add_library(zero_main STATIC ${SRC_FILES})

target_link_libraries(zero_main PUBLIC sdl)
target_link_libraries(zero_main PUBLIC websockets)
target_link_libraries(zero_main PUBLIC v8)
target_include_directories(zero_main PUBLIC ./ ./sdl ./lws ./v8)

include(FetchContent)
FetchContent_Declare(json URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz)
FetchContent_MakeAvailable(json)
target_link_libraries(zero_main PRIVATE nlohmann_json::nlohmann_json)

add_subdirectory(../../puttyknife/jsb puttyknife-build)
target_link_libraries(puttyknife PRIVATE v8)
target_link_libraries(zero_main PRIVATE puttyknife)

add_subdirectory(../../puttyknife/spi-jsb spi-jsb-build)
target_link_libraries(spi-jsb PRIVATE v8)
target_link_libraries(zero_main PRIVATE spi-jsb)

add_subdirectory(../../puttyknife/yoga-jsb yoga-jsb-build)
target_link_libraries(yoga-jsb PRIVATE v8)
target_link_libraries(zero_main PRIVATE yoga-jsb)

add_library(zero::main ALIAS zero_main)