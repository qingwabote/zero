```plantuml
skinparam handwritten true

rectangle logic {
    rectangle Node
    rectangle Component
}

rectangle system {
    rectangle animation
    rectangle spine
    rectangle physics
    rectangle layout
}

rectangle pipeline {
    rectangle UBO
    rectangle Flow
    rectangle Stage
    rectangle Phase
}

rectangle scene {
    rectangle Camera
    rectangle Light
    rectangle Model
    rectangle Pass
}
Camera-[hidden]>Light

rectangle gfx {
    rectangle WebGL2
    rectangle Vulkan
}

logic-d->scene
pipeline-r->scene

logic-r->system

scene-d->gfx
pipeline-d->gfx
```
