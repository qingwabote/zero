import { bundle } from 'bundling';
import { Animation, AnimationClip, BlendAnimation, Camera, DirectionalLight, GLTF, Node, Pipeline, TextRenderer, Zero, bundle as builtin, device, vec3 } from "engine";
import { Align, CameraControlPanel, Document, Edge, ElementContainer, Justify, PositionType, Profiler, Renderer, Slider } from 'flex';

const gltf = await (await bundle.once('walkrun_and_idle/scene', GLTF)).instantiate({}, function (params: GLTF.MaterialParams) {
    const res = GLTF.materialFuncPhong(params);
    if (params.index == 3 /* hair */) {
        res.passes[1].rasterizationState = { cullMode: 'FRONT' };
    }
    return res
});

const clips: AnimationClip[] = [];
clips.push(gltf.proto.animationClips.find(clip => clip.name == 'Armature|Idle')!)
clips.push(gltf.proto.animationClips.find(clip => clip.name == 'Armature|Walk')!)
clips.push(gltf.proto.animationClips.find(clip => clip.name == 'Armature|Run')!)

const pipeline = await (await builtin.cache('pipelines/forward', Pipeline)).instantiate();

enum VisibilityFlagBits {
    NONE = 0,
    UI = 1 << 29,
    WORLD = 1 << 30,
    ALL = 0xffffffff
}

export class App extends Zero {
    start() {
        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = [0, 4, 4];
        node.lookAt(vec3.ZERO);

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.visibilities = VisibilityFlagBits.WORLD;
        node.position = [0, 0, 12];

        node = gltf.createScene("Sketchfab_Scene")!;
        node.visibility = VisibilityFlagBits.WORLD;
        node.euler = vec3.create(0, 60, 0)
        const animation = node.addComponent(BlendAnimation);
        animation.clips = clips;
        animation.thresholds = [0, 0.5, 1]

        {
            let node = gltf.createScene("Sketchfab_Scene")!;
            node.visibility = VisibilityFlagBits.WORLD;
            node.euler = vec3.create(0, 60, 0)
            node.position = [-1, 1, -1];
            let animation = node.addComponent(Animation);
            animation.clips = clips;
            animation.play(animation.clips[0].name);

            node = gltf.createScene("Sketchfab_Scene")!;
            node.visibility = VisibilityFlagBits.WORLD;
            node.euler = vec3.create(0, 60, 0)
            node.position = [1, 1, -1];
            animation = node.addComponent(Animation);
            animation.clips = clips;
            animation.play(animation.clips[2].name);
        }

        // UI
        const width = 640;
        const height = 960;

        const { width: w, height: h } = device.swapchain.color.info;
        const scale = Math.min(w / width, h / height);

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;
        ui_camera.orthoSize = h / scale / 2;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.justifyContent = Justify.Center;
        doc.alignItems = Align.Center;
        doc.setWidth(width);
        doc.setHeight(height);

        const cameraControl = Node.build(CameraControlPanel);
        cameraControl.camera = main_camera;
        cameraControl.setWidthPercent(100);
        cameraControl.setHeightPercent(100);
        cameraControl.positionType = PositionType.Absolute;
        doc.addElement(cameraControl);

        const panel = Node.build(ElementContainer);
        panel.alignItems = Align.Center;
        panel.setPosition(Edge.Top, 80);

        function updateInput(value: number) {
            animation.input = value;
        }

        const slider = Node.build(Slider);
        slider.setWidth(256);
        slider.setHeight(64);
        slider.value = 0.3;
        slider.emitter.on(Slider.EventType.CHANGED, () => {
            updateInput(slider.value);
        })
        panel.addElement(slider);

        const text = Renderer.create(TextRenderer);
        panel.addElement(text);

        this.setInterval(() => {
            const weights = animation.state.weights;
            text.impl.text = `Idle ${weights[0].toFixed(2)}
Walk ${weights[1].toFixed(2)}
Run  ${weights[2].toFixed(2)}`
        })

        updateInput(slider.value);

        doc.addElement(panel);

        const profiler = Node.build(Profiler);
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8);
        profiler.setPosition(Edge.Bottom, 8);
        doc.addElement(profiler);
    }
}



(new App(pipeline)).initialize().attach();
