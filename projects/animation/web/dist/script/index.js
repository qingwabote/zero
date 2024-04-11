import { bundle } from 'bundling';
import { BlendAnimation, Camera, DirectionalLight, GLTF, Node, Pipeline, TextRenderer, Zero, bundle as builtin, device, vec3 } from "engine";
import { Align, CameraControlPanel, Document, Edge, ElementContainer, Justify, PositionType, Profiler, Renderer, Slider, SliderEventType } from 'flex';
const Polyart = await (await bundle.cache('SciFiWarriorPBRHPPolyart/Polyart', GLTF)).instantiate();
const WalkFront_Shoot_ar = await bundle.cache('SciFiWarriorPBRHPPolyart/WalkFront_Shoot_ar', GLTF);
const Run_gunMiddle_AR = await bundle.cache('SciFiWarriorPBRHPPolyart/Run_gunMiddle_AR', GLTF);
const Idle_Shoot_ar = await bundle.cache('SciFiWarriorPBRHPPolyart/Idle_Shoot_ar', GLTF);
const pipeline = await (await builtin.cache('pipelines/forward', Pipeline)).instantiate();
var VisibilityFlagBits;
(function (VisibilityFlagBits) {
    VisibilityFlagBits[VisibilityFlagBits["NONE"] = 0] = "NONE";
    VisibilityFlagBits[VisibilityFlagBits["UI"] = 536870912] = "UI";
    VisibilityFlagBits[VisibilityFlagBits["WORLD"] = 1073741824] = "WORLD";
    VisibilityFlagBits[VisibilityFlagBits["ALL"] = 4294967295] = "ALL";
})(VisibilityFlagBits || (VisibilityFlagBits = {}));
export class App extends Zero {
    start() {
        let node;
        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = [0, 4, 4];
        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.visibilities = VisibilityFlagBits.WORLD;
        node.position = [0, 0, 8];
        node = Polyart.createScene("Scene");
        node.visibility = VisibilityFlagBits.WORLD;
        node.euler = vec3.create(0, 60, 0);
        node.scale = [0.01, 0.01, 0.01];
        const animation = node.addComponent(BlendAnimation);
        animation.clips = [
            Idle_Shoot_ar.animationClips[0],
            WalkFront_Shoot_ar.animationClips[0],
            Run_gunMiddle_AR.animationClips[0],
        ];
        animation.thresholds = [0, 0.5, 1];
        // UI
        const width = 640;
        const height = 960;
        const swapchain = device.swapchain;
        const scale = Math.min(swapchain.width / width, swapchain.height / height);
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = Camera.ClearFlagBits.DEPTH;
        ui_camera.orthoSize = swapchain.height / scale / 2;
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
        cameraControl.setWidth('100%');
        cameraControl.setHeight('100%');
        cameraControl.positionType = PositionType.Absolute;
        doc.addElement(cameraControl);
        const panel = Node.build(ElementContainer);
        panel.alignItems = Align.Center;
        panel.setPosition(Edge.Top, 210);
        function updateInput(value) {
            animation.input = value;
        }
        const slider = Node.build(Slider);
        slider.setWidth(180);
        slider.setHeight(20);
        slider.value = 0;
        slider.emitter.on(SliderEventType.CHANGED, () => {
            updateInput(slider.value);
        });
        panel.addElement(slider);
        const text = Renderer.create(TextRenderer);
        panel.addElement(text);
        this.setInterval(() => {
            const weights = animation.state.weights;
            text.impl.text = `空闲: ${weights[0].toFixed(2)}
行走: ${weights[1].toFixed(2)}
跑: ${weights[2].toFixed(2)}`;
        });
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
