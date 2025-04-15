主要参考 [cocos](https://github.com/cocos/cocos-engine), 连名字(gfx)都是抄来的。也撇了一眼 [bgfx](https://github.com/bkaradzic/bgfx), 但 bgfx 的 API 更像 OpenGL 而我更倾向 Vulkan, 毕竟 Vulkan 是在 bgfx 之后才出现的。

使用一套 header 文件对应多套实现（目前只有 Vulkan, 如果 WebGL 也算的话）以实现跨平台，因而在运行时只能存在一种实现，这与 cocos 一套基类对应多套子类不同，功能更单一，但也更简洁。

依赖 SDL 以创建 surface, glslang 以编译 glsl 到 Vulkan.