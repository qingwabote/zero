**Zero** 是一款跨平台 3D 图形引擎

# 支持的平台

- Web (WebGL2)

- Android, Windows (Vulkan)

- ~~IOS, Mac (还没有 Metal 实现)~~

# 基础功能

- 3D 模型渲染 (gltf)

- 冯氏光照与阴影 (shadow map)

- 动画混合 (一维)

- 蒙皮动画

- 骨骼动画 (spine)

- 物理引擎 (ammo)

# 特色功能

## 可配置渲染管线

### 无光照

```yml
flows:
  - uniforms:
      - type: camera
        binding: 1
    stages:
      - phases:
          - pass: default
```

### 光照

```yml
flows:
  - uniforms:
      - type: camera
        binding: 1
      - type: light
        binding: 2
    stages:
      - phases:
          - pass: default
```

### 阴影

```yml
textures:
  - name: shadowmap
    usage:
      - DEPTH_STENCIL
      - SAMPLED
    width: 1024
    height: 1024
flows:
  - uniforms:
      - type: camera
        binding: 1
      - type: light
        binding: 2
      - type: shadow
        binding: 3
      - type: samplerTexture
        texture: shadowmap
        binding: 0
    stages:
      - name: shadow
        phases:
          - pass: shadow
        framebuffer:
          depthStencil: shadowmap
        clears:
          - DEPTH
      - name: forward
        phases:
          - pass: default
```

### MSAA

```yml
flows:
  - uniforms:
      - type: camera
        binding: 1
    stages:
      - phases:
          - pass: default
        framebuffer:
          samples: 4
          colors:
            - usage:
                - COLOR
                - TRANSIENT
          resolves:
            - swapchain: true
          depthStencil:
            usage:
              - DEPTH_STENCIL
```

### FXAA

```yml
textures:
  - name: color
    usage:
      - COLOR
      - SAMPLED
flows:
  - uniforms:
      - type: camera
        binding: 1
    stages:
      - phases:
          - pass: default
        framebuffer:
          colors:
            - color
          depthStencil:
            usage:
              - DEPTH_STENCIL
  - uniforms:
      - type: samplerTexture
        texture: color
        filter: LINEAR
        binding: 0
    stages:
      - phases:
          - type: fxaa
```

## 布局引擎 (yoga)

UI 使用 **yoga** 引擎布局，因而支持 **flexbox** 布局模型

# 示例 (web)

- [Animation Blend](https://qingwabote.github.io/zero/projects/animation/web/index.html)

- [Shadow Map](https://qingwabote.github.io/zero/projects/shadow/web/index.html)

- [Skinned Mesh](https://qingwabote.github.io/zero/projects/skin/web/index.html)

- [Spine](https://qingwabote.github.io/zero/projects/skeleton/web/index.html)

- [Physics](https://qingwabote.github.io/zero/projects/vehicle/web/index.html)

- [Pipeline Switch](https://qingwabote.github.io/zero/projects/pipeline/web/index.html)

- [MSAA & FXAA](https://qingwabote.github.io/zero/projects/cutting2d/web/index.html)

# 基础架构

![](https://www.plantuml.com/plantuml/svg/RP51JiGm34NtEKKkqCqSO3OZmMP0I4YmG0YPnYJH94uKfvgf47SdfODQNBBBi_t_byqdJnaAHEs0pBduMf5qBGCgLR2lG3QW3idwNdygtTv2xvD1WGufvaH8LNsjvtdaYd4Z0EGZL9z8SCwUf79s8_kU1Gqmfa6OPPynD86DtKr8Pu4UArZfzE20yQzaGJ9OthZ7VsGF4B60W4TlNHNihkqhI3DWRbwpHlVYl358h_jvV9N0Vbmsni_uVdlS2VWqX1FG5F_dQ9tfzklqwdSxNH65Qt_3yxKczwKywRGCo_Zr_mq0)

_v8 inspector：  
devtools://devtools/bundled/js_app.html?v8only=true&ws=127.0.0.1:6086_
