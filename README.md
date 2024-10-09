**Zero** 是一款跨平台 3D 游戏引擎

# 示例(H5)

- [Animation Blend](https://qingwabote.github.io/zero/projects/animation/web/index.html)
- [Cascaded Shadow Mapping](https://qingwabote.github.io/zero/projects/shadow/web/index.html)
- [Skinned Mesh](https://qingwabote.github.io/zero/projects/skin/web/index.html)
- [Octree Scene Culling](https://qingwabote.github.io/zero/projects/culling/web/index.html)
- [Spine](https://qingwabote.github.io/zero/projects/skeleton/web/index.html)
- [Physics](https://qingwabote.github.io/zero/projects/vehicle/web/index.html)
- [Pipeline Switch](https://qingwabote.github.io/zero/projects/pipeline/web/index.html)
- [MSAA & FXAA](https://qingwabote.github.io/zero/projects/cutting2d/web/index.html)
- [GPU Instancing](https://qingwabote.github.io/zero/projects/instancing/web/index.html)

# 跨平台

## WebGL2

- H5
- [微信小游戏](minigame/README.md)

## [Vulkan](native/README.md)

- [Android](native/platforms/android/README.md)
- [Windows](native/platforms/win/README.md)

# 基础功能

- 模型渲染 (gltf)
- 冯氏光照
- 级联阴影
- 动画混合 (一维)
- 蒙皮动画
- 场景剔除 (八叉树)
- 骨骼动画 (spine)
- 物理引擎 (ammo)
- MSAA & FXAA
- GPU Instancing

# 可配置渲染管线

- [无光照](assets/pipelines/unlit.yml)
- [光照](assets/pipelines/forward.yml)
- [级联阴影](assets/pipelines/shadow.yml)
- [MSAA](assets/pipelines/unlit-ms.yml)
- [FXAA](assets/pipelines/unlit-fxaa.yml)

# 集成布局引擎

使用 [Yoga](https://github.com/facebook/yoga) 引擎布局 UI，提供 **Flexbox** 支持

# 基础架构

![](https://www.plantuml.com/plantuml/svg/RP5DJWCn34RtEKKkC1iEq0MLO5D-90Gi40ipSHEhYHF56RKZrBkZcRPgvM7fftn-TYmxuW8LaWt0Rb-fDMJRwe36LEmRi8zeO_RKsrzZhRLN-fmTAhJEgMH6RkPucvTH6gP50s1Aq2YpubA8TUSIHg5U58qmva792XMCnBZGlT-_AF8GyrwXjmPUkry32AgDUlp7i8Q45HJSa0zDiQViC6eBY9YZEVNelW8vX_ozEiLlr7vxM8W_yUTnSwVWnn1tmDFSy_qwrwtciStbXxfw8USNKpsVofYPJn6_FLm3v_eF)

# Bundleless

无需使用 module bundler 打包引擎 javascript 源码, 引擎使用 [import-maps](https://github.com/WICG/import-maps) 实现 bare import specifiers, 依赖的 npm packages 则使用 rollup 打包

# 支持微信分包加载

# 兼容性

Wasm 没有 GC, 引擎依赖 **FinalizationRegistry** 自动释放 Wasm 对象

# 开发

确保 git 启用符号链接
```
[core]
	symlinks = true
```
