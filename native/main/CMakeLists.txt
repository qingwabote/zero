set(SRC_FILES
    base/threading/ThreadPool.cpp
    base/threading/Semaphore.cpp
    gfx/constants.cpp
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

add_library(zero::main ALIAS zero_main)