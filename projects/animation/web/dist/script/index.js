import { bundle } from 'bundling';
import { Animation, BlendAnimation, Camera, DirectionalLight, GLTF, Node, Pipeline, TextRenderer, Zero, bundle as builtin, device, vec3 } from "engine";
import { Align, CameraControlPanel, Document, Edge, ElementContainer, Justify, PositionType, Profiler, Renderer, Slider } from 'flex';
const Polyart = await (await bundle.cache('walkrun_and_idle/scene', GLTF)).instantiate();
const clips = [];
clips.push(Polyart.proto.animationClips.find(clip => clip.name == 'Armature|Idle'));
clips.push(Polyart.proto.animationClips.find(clip => clip.name == 'Armature|Walk'));
clips.push(Polyart.proto.animationClips.find(clip => clip.name == 'Armature|Run'));
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
        node.lookAt(vec3.ZERO);
        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.visibilities = VisibilityFlagBits.WORLD;
        node.position = [0, 0, 12];
        node = Polyart.createScene("Sketchfab_Scene");
        node.visibility = VisibilityFlagBits.WORLD;
        node.euler = vec3.create(0, 60, 0);
        const animation = node.addComponent(BlendAnimation);
        animation.clips = clips;
        animation.thresholds = [0, 0.5, 1];
        {
            let node = Polyart.createScene("Sketchfab_Scene");
            node.visibility = VisibilityFlagBits.WORLD;
            node.euler = vec3.create(0, 60, 0);
            node.position = [-1, 1, -1];
            let animation = node.addComponent(Animation);
            animation.clips = clips;
            animation.play(animation.clips[0].name);
            node = Polyart.createScene("Sketchfab_Scene");
            node.visibility = VisibilityFlagBits.WORLD;
            node.euler = vec3.create(0, 60, 0);
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
        cameraControl.setWidth('100%');
        cameraControl.setHeight('100%');
        cameraControl.positionType = PositionType.Absolute;
        doc.addElement(cameraControl);
        const panel = Node.build(ElementContainer);
        panel.alignItems = Align.Center;
        panel.setPosition(Edge.Top, 80);
        function updateInput(value) {
            animation.input = value;
        }
        const slider = Node.build(Slider);
        slider.setWidth(180);
        slider.setHeight(20);
        slider.value = 0.3;
        slider.emitter.on(Slider.EventType.CHANGED, () => {
            updateInput(slider.value);
        });
        panel.addElement(slider);
        const text = Renderer.create(TextRenderer);
        panel.addElement(text);
        this.setInterval(() => {
            const weights = animation.state.weights;
            text.impl.text = `Idle ${weights[0].toFixed(2)}
Walk ${weights[1].toFixed(2)}
Run  ${weights[2].toFixed(2)}`;
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