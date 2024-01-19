import { bundle } from 'bundling';
import {
    AnimationClip,
    BlendAnimation,
    Camera,
    DirectionalLight,
    GLTF,
    Node,
    Pipeline,
    TextRenderer,
    VisibilityFlagBits,
    Zero,
    bundle as builtin,
    device,
    render,
    vec3
} from "engine";
import { Align, Document, Edge, ElementContainer, Justify, PositionType, Profiler, Renderer, Slider, SliderEventType } from 'flex';

const walkrun_and_idle = await (await bundle.cache('walkrun_and_idle/scene', GLTF)).instantiate();

const pipeline = await (await builtin.cache('pipelines/forward', Pipeline)).createRenderPipeline();

export class App extends Zero {
    start(): render.Pipeline {
        const { width, height } = device.swapchain;

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = [0, 4, 4];

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.viewport = { x: 0, y: 0, width, height };
        node.position = [0, 0, 12];

        node = walkrun_and_idle.createScene("Sketchfab_Scene")!;
        node.visibility = VisibilityFlagBits.DEFAULT
        node.euler = vec3.create(0, 60, 0)
        const animation = node.addComponent(BlendAnimation);
        const clips: AnimationClip[] = [];
        clips.push(walkrun_and_idle.gltf.animationClips.find(clip => clip.name == 'Armature|Idle')!)
        clips.push(walkrun_and_idle.gltf.animationClips.find(clip => clip.name == 'Armature|Walk')!)
        clips.push(walkrun_and_idle.gltf.animationClips.find(clip => clip.name == 'Armature|Run')!)
        animation.clips = clips;
        animation.thresholds = [0, 0.5, 1]

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = 0x2 // ClearFlagBits.DEPTH;
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.justifyContent = Justify.Center;
        doc.alignItems = Align.Center;
        doc.setWidth(width);
        doc.setHeight(height);

        const control = (new Node).addComponent(ElementContainer);
        control.alignItems = Align.Center;
        control.setPosition(Edge.Top, 60)

        function updateInput(value: number) {
            animation.input = value;
        }

        const slider = (new Node).addComponent(Slider);
        slider.setWidth(180)
        slider.setHeight(20)
        slider.value = 0.1;
        slider.emitter.on(SliderEventType.CHANGED, () => {
            updateInput(slider.value)
        })
        control.addElement(slider);

        const text = Renderer.create(TextRenderer);
        control.addElement(text);

        this.setInterval(() => {
            const weights = animation.state.weights;
            text.impl.text = `空闲: ${weights[0].toFixed(2)}
行走: ${weights[1].toFixed(2)}
跑: ${weights[2].toFixed(2)}`
        })

        updateInput(slider.value)

        doc.addElement(control)

        const profiler = (new Node).addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);

        return pipeline
    }
}

