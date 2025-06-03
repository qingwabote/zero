# Showcase (h5)

- [Animation Blend](https://qingwabote.github.io/zero/projects/animation/web/index.html)
- [Cascaded Shadow Mapping](https://qingwabote.github.io/zero/projects/shadow/web/index.html)
- [Skinning & Instancing & baking](https://qingwabote.github.io/zero/projects/skin/web/index.html)
- [Octree Scene Culling](https://qingwabote.github.io/zero/projects/culling/web/index.html)
- [Spine](https://qingwabote.github.io/zero/projects/skeleton/web/index.html)
- [Deterministic Physics](http://82.156.151.167:8003/projects/vehicle/web/index.html)
- [Pipeline Switch](https://qingwabote.github.io/zero/projects/pipeline/web/index.html)
- [MSAA & FXAA](https://qingwabote.github.io/zero/projects/cutting2d/web/index.html)

# Cross platforms

## WebGL2

- H5
- [微信小游戏](minigame/README.md)

## [Vulkan](native/README.md)

- [Android](native/platforms/android/README.md)
- [Windows](native/platforms/win/README.md)

# Foundations

- 模型渲染（gltf）
- 冯氏光照
- 级联阴影
- 动画混合（一维）
- [蒙皮动画（GPU, 支持烘焙）](skinning.md)
- 场景剔除（支持八叉树）
- 骨骼动画（spine）
- 物理引擎（deterministic physics by bullet+webassembly）
- MSAA & FXAA
- GPU Instancing

# Features
## 可配置渲染管线

- [无光照](assets/pipelines/unlit.yml)
- [光照](assets/pipelines/forward.yml)
- [级联阴影](assets/pipelines/forward-csm.yml)
- [MSAA](assets/pipelines/unlit-ms.yml)
- [FXAA](assets/pipelines/unlit-fxaa.yml)

## 集成布局引擎

使用 [Yoga](https://github.com/facebook/yoga) 引擎布局 UI，提供 **Flexbox** 支持

## Bundleless

无需使用 module bundler 打包引擎 javascript 源码, 引擎使用 [import-maps](https://github.com/WICG/import-maps) 实现 bare import specifiers, 依赖的 npm packages 则使用 rollup 打包

## 支持微信分包加载

## GPU Instancing Only
引擎中，GPU Instancing 和非 Instancing 使用统一的 code path，区别仅在于 instance count, 非 Instancing 被视作 Instancing 的特例，其 instance count 固定为 1

Matrix 目前储存于 vertex buffer, 好处是不受 WebGL UBO 大小限制，缺陷是 vertex attribute 数量有限

# 架构

![](https://www.plantuml.com/plantuml/svg/RP71JiCm38RlUOhm0Btm03im2IxRG4B00N4mZPTOf7QKfDggQUy-jTkqoUNeJ_dzsV63f4h2DW2xNQPQaMtDFHgJiQt0FgADugcr1sEjjJUw4OSABQLBmiZL7E_pPIWLkra3OEfWb2jU4h7kdC9Gg2sAHXYaLx942ICnpdGVJw-AF4VPAVHUmMltMu22QgCM_p4ieSCC2gx8XwhOMXn6RO5IpD6SUpJVWPn3_bcSutTglztFn5_u-x9wLF2pZt_0uzpJ_HhNBAQnpVM7cdmbbnTZFPtAc8cF4R_TtmAN-WG0)

# 兼容性

## 颜色空间
WebGL default framebuffer 不支持 sRGB, 引擎在 [shader](assets/shaders/chunks/gamma.chunk) 中做的空间转换

## Wasm 对象的释放
Wasm 没有 GC, 引擎依赖 [FinalizationRegistry](https://developers.weixin.qq.com/minigame/dev/reference/api/FinalizationRegistry.html) 自动释放 Wasm 对象

[Note: The finalization callback does not run immediately after garbage-collecting the event listener, so don't use it for important logic or metrics. The timing of garbage collection and finalization callbacks is unspecified. In fact, an engine that never garbage-collects would be fully compliant. However, it's safe to assume that engines will garbage collect, and finalization callbacks will be called at some later time, unless the environment is discarded (such as the tab closing, or the worker terminating). Keep this uncertainty in mind when writing code.](https://v8.dev/features/weak-references)

# 开发

确保 git 启用符号链接。npm package 本地安装，个别项目公共资源依赖符号链接
```
[core]
	symlinks = true
```
