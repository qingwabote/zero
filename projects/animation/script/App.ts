import { bundle } from 'bundling';
import {
    AnimationClip,
    BlendAnimation,
    Camera,
    CameraControlPanel,
    DirectionalLight,
    Flow,
    GLTF,
    Node,
    Profiler,
    Slider,
    SliderEventType,
    TextRenderer,
    UIDocument,
    UIRenderer,
    UITouchEventType,
    VisibilityFlagBits,
    Zero,
    bundle as builtin,
    device,
    platform,
    reboot,
    render,
    safeArea,
    vec2,
    vec3
} from "engine";

const walkrun_and_idle = await bundle.cache('walkrun_and_idle/scene', GLTF);

const flow = await builtin.cache('flows/forward', Flow);

export class App extends Zero {
    start(): render.Flow {
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
        clips.push(walkrun_and_idle.animationClips.find(clip => clip.name == 'Armature|Idle')!)
        clips.push(walkrun_and_idle.animationClips.find(clip => clip.name == 'Armature|Walk')!)
        clips.push(walkrun_and_idle.animationClips.find(clip => clip.name == 'Armature|Run')!)
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

        const doc = (new Node).addComponent(UIDocument);
        doc.node.visibility = VisibilityFlagBits.UI;

        const profiler = (new Node).addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        profiler.node.position = [-width / 2, safeArea.y, 0];
        doc.addElement(profiler);

        const cameraControlPanel = (new Node).addComponent(CameraControlPanel);
        cameraControlPanel.size = vec2.create(safeArea.width, safeArea.height);
        cameraControlPanel.anchor = [0, 0];
        cameraControlPanel.camera = main_camera;
        cameraControlPanel.node.position = [safeArea.x, safeArea.y, 0];
        doc.addElement(cameraControlPanel);

        const text = UIRenderer.create(TextRenderer);
        text.anchor = vec2.create(0, 0.5)
        text.node.position = vec3.create(-width / 2, 50, 0)
        doc.addElement(text);

        this.setInterval(() => {
            const weights = animation.state.weights;
            text.impl.text = `空闲: ${weights[0].toFixed(2)}
行走: ${weights[1].toFixed(2)}
跑: ${weights[2].toFixed(2)}`
        })

        function updateInput(value: number) {
            animation.input = value;
        }

        const slider = (new Node).addComponent(Slider);
        slider.anchor = vec2.create(0.5, 1)
        slider.size = vec2.create(180, 20)
        slider.value = 0;
        slider.on(SliderEventType.CHANGED, () => {
            updateInput(slider.value)
        })
        doc.addElement(slider);

        updateInput(slider.value)

        if (platform == 'wx') {
            const textRenderer = UIRenderer.create(TextRenderer);
            textRenderer.anchor = vec2.create(0, 1);
            textRenderer.impl.text = '重启';
            textRenderer.impl.color = [0, 1, 0, 1];
            textRenderer.on(UITouchEventType.TOUCH_START, async event => {
                reboot();
            })
            textRenderer.node.position = [-width / 2, safeArea.y + safeArea.height, 0];
            doc.addElement(textRenderer);
        }

        return flow.createFlow()
    }
}

