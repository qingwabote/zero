# Showcase

[Shadow Map](https://qingwabote.github.io/zero/projects/test/script/platforms/web/app.html)

[Skinned Mesh](https://qingwabote.github.io/zero/projects/skin/script/platforms/web/app.html)

[Animation Blend](https://qingwabote.github.io/zero/projects/animation/script/platforms/web/app.html)

[SpriteRenderer](https://qingwabote.github.io/zero/projects/ui/script/platforms/web/app.html)

[Physics](https://qingwabote.github.io/zero/projects/vehicle/script/platforms/web/app.html)

# Architecture

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

rectangle Render {
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
Render-r->RenderScene

Logic-r->System

RenderScene-d->GFX
Render-d->GFX
```
