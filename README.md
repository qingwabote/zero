**Zero** 是一款跨平台 3D 游戏引擎

# 示例 (web)

- [Animation Blend](https://qingwabote.github.io/zero/projects/animation/web/index.html)
- [Shadow Map](https://qingwabote.github.io/zero/projects/shadow/web/index.html)
- [Skinned Mesh](https://qingwabote.github.io/zero/projects/skin/web/index.html)
- [Spine](https://qingwabote.github.io/zero/projects/skeleton/web/index.html)
- [Physics](https://qingwabote.github.io/zero/projects/vehicle/web/index.html)
- [Pipeline Switch](https://qingwabote.github.io/zero/projects/pipeline/web/index.html)
- [MSAA & FXAA](https://qingwabote.github.io/zero/projects/cutting2d/web/index.html)

# 支持的平台

- Web/[微信小游戏](minigame/README.md) (WebGL2)
- [Android](native/platforms/android/README.md), [Windows](native/platforms/win/README.md) (Vulkan)
- ~~IOS, Mac (还没有 Metal 实现)~~

# 基础功能

- 3D 模型渲染 (gltf)
- 冯氏光照与阴影 (shadow map)
- 动画混合 (一维)
- 蒙皮动画
- 骨骼动画 (spine)
- 物理引擎 (ammo)

# 可配置渲染管线

- [无光照](assets/pipelines/unlit.yml)
- [光照](assets/pipelines/forward.yml)
- [阴影](assets/pipelines/shadow.yml)
- [MSAA](assets/pipelines/unlit-ms.yml)
- [FXAA](assets/pipelines/unlit-fxaa.yml)

# 集成布局引擎

UI 使用 **Yoga** 引擎布局，从而支持 **Flexbox**

# 基础架构

![](https://www.plantuml.com/plantuml/svg/RP51JiGm34NtEKKkqCqSO3OZmMP0I4YmG0YPnYJH94uKfvgf47SdfODQNBBBi_t_byqdJnaAHEs0pBduMf5qBGCgLR2lG3QW3idwNdygtTv2xvD1WGufvaH8LNsjvtdaYd4Z0EGZL9z8SCwUf79s8_kU1Gqmfa6OPPynD86DtKr8Pu4UArZfzE20yQzaGJ9OthZ7VsGF4B60W4TlNHNihkqhI3DWRbwpHlVYl358h_jvV9N0Vbmsni_uVdlS2VWqX1FG5F_dQ9tfzklqwdSxNH65Qt_3yxKczwKywRGCo_Zr_mq0)
