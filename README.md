# showcase

[Shadow Map](http://202.182.103.53:8003/projects/shadow/script/web/app.html)

[Skinned Mesh](http://202.182.103.53:8003/projects/skin/script/web/app.html)

[Animation Blend](http://202.182.103.53:8003/projects/animation/script/web/app.html)

[Physics](http://202.182.103.53:8003/projects/vehicle/script/web/app.html)

[Spine](http://202.182.103.53:8003/projects/spine/script/web/app.html)

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
