import { bundle } from 'bundling';
import { Camera, DirectionalLight, GLTF, Node, Pipeline, Zero, bundle as builtin, device, quat, vec3 } from "engine";
import { Align, CameraControlPanel, Document, Edge, Justify, PositionType, Profiler } from 'flex';

const skin = await (await bundle.once('killer-whale/scene', GLTF)).instantiate();

const flow = await (await builtin.cache('pipelines/forward', Pipeline)).instantiate();

enum VisibilityFlagBits {
    NONE = 0,
    UI = 1 << 29,
    WORLD = 1 << 30,
    ALL = 0xffffffff
}

export class App extends Zero {
    start() {
        const width = 640;
        const height = 960;

        const { width: w, height: h } = device.swapchain.color.info;

        const scaleX = w / width;
        const scaleY = h / height;
        const scale = scaleX < scaleY ? scaleX : scaleY;

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = [0, 4, 4];

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.visibilities = VisibilityFlagBits.WORLD;
        node.position = [0, 0, 24];

        node = skin.createScene('Scene')!;
        node.visibility = VisibilityFlagBits.WORLD;
        node.position = vec3.create(0, -5, 0)
        node.euler = vec3.create(-30, -80, 0)

        const joint1 = node.getChildByPath(['Armature.001', 'Bone', 'Bone.001'])!;
        const joint1_rotation = quat.create(...joint1.rotation)

        const joint2 = node.getChildByPath(['Armature.001', 'Bone', 'Bone.001', 'Bone.002'])!;
        const joint2_rotation = quat.create(...joint2.rotation)

        const joint5 = node.getChildByPath(['Armature.001', 'Bone', 'Bone.001', 'Bone.002', 'Bone.005'])!;
        const joint5_rotation = quat.create(...joint5.rotation)

        const joint3 = node.getChildByPath(['Armature.001', 'Bone', 'Bone.003'])!;
        const joint3_rotation = quat.create(...joint3.rotation)

        const joint4 = node.getChildByPath(['Armature.001', 'Bone', 'Bone.003'])!;
        const joint4_rotation = quat.create(...joint4.rotation)

        let frames = 0
        this.setInterval(() => {
            const d = quat.fromAxisAngle(quat.create(), vec3.create(1, 0, 0), Math.sin(frames) * 0.5);

            joint1.rotation = quat.multiply(quat.create(), joint1_rotation, d);
            joint2.rotation = quat.multiply(quat.create(), joint2_rotation, d);
            joint5.rotation = quat.multiply(quat.create(), joint5_rotation, d);
            joint3.rotation = quat.multiply(quat.create(), joint3_rotation, d);
            joint4.rotation = quat.multiply(quat.create(), joint4_rotation, d);

            frames += 0.01;
        })

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilities = VisibilityFlagBits.UI;
        ui_camera.clears = 0x2 // ClearFlagBits.DEPTH;
        ui_camera.orthoSize = h / scale / 2;
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.position = vec3.create(-width / 2, height / 2);
        node.visibility = VisibilityFlagBits.UI;
        const doc = node.addComponent(Document);
        doc.justifyContent = Justify.Center
        doc.alignItems = Align.Center
        doc.setWidth(width);
        doc.setHeight(height);

        node = new Node;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.camera = main_camera;
        cameraControlPanel.setWidth(width);
        cameraControlPanel.setHeight(height);
        doc.addElement(cameraControlPanel);

        const profiler = (new Node).addComponent(Profiler)
        profiler.positionType = PositionType.Absolute;
        profiler.setPosition(Edge.Left, 8)
        profiler.setPosition(Edge.Bottom, 8)
        doc.addElement(profiler);
    }
}

(new App(flow)).initialize().attach();
