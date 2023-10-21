# showcase

[Animation Blend](https://qingwabote.github.io/zero/projects/animation/web/index.html)

[Shadow Map](https://qingwabote.github.io/zero/projects/shadow/web/index.html)

[Skinned Mesh](https://qingwabote.github.io/zero/projects/skin/web/index.html)

[Spine](https://qingwabote.github.io/zero/projects/spine/web/index.html)

[Physics](https://qingwabote.github.io/zero/projects/vehicle/web/index.html)

# architecture

```plantuml
skinparam handwritten true

rectangle Logic {
    rectangle Node
    rectangle Component
}

rectangle System {
    rectangle animation
    rectangle physics
}

rectangle Pipeline {
    rectangle Flow
    rectangle Stage
}

rectangle RenderScene {
    rectangle Camera
    rectangle Light
    rectangle Model
    rectangle Pass
}
Camera-[hidden]>Light

rectangle GFX {
    rectangle WebGL
    rectangle Vulkan
}

Logic-d->RenderScene
Pipeline-r->RenderScene

Logic-r->System

RenderScene-d->GFX
Pipeline-d->GFX
```

# v8 inspector

```
devtools://devtools/bundled/js_app.html?v8only=true&ws=127.0.0.1:6086
```
