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
}

rectangle pipeline {
    rectangle Flow
    rectangle Stage
}

rectangle render_scene {
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

logic-d->render_scene
pipeline-r->render_scene

logic-r->system

render_scene-d->gfx
pipeline-d->gfx
```
