import { bundle } from 'bundling';
import { Camera, CameraControlPanel, DirectionalLight, Flow, GLTF, Node, Profiler, TextRenderer, UIDocument, UIRenderer, UITouchEventType, VisibilityFlagBits, Zero, bundle as builtin, device, platform, quat, reboot, render, safeArea, vec2, vec3 } from "engine";

const skin = await bundle.once('killer-whale/scene', GLTF);

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
        node.position = [0, 0, 24];

        node = skin.createScene('Scene')!;
        node.visibility = VisibilityFlagBits.DEFAULT;
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
        ui_camera.clearFlags = 0x2 // ClearFlagBits.DEPTH;
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);

        node = new Node;
        node.visibility = VisibilityFlagBits.UI;
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, safeArea.y, 0];

        node = new Node;
        node.visibility = VisibilityFlagBits.UI;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.camera = main_camera;
        cameraControlPanel.size = vec2.create(safeArea.width, safeArea.height);
        cameraControlPanel.anchor = [0, 0];
        cameraControlPanel.node.position = [safeArea.x, safeArea.y, 0];
        doc.addElement(cameraControlPanel);

        if (platform == 'wx') {
            const textRenderer = UIRenderer.create(TextRenderer);
            textRenderer.anchor = vec2.create(0, 1);
            textRenderer.impl.text = '重启';
            textRenderer.impl.color = [0, 1, 0, 1];
            textRenderer.on(UITouchEventType.TOUCH_START, async event => {
                reboot();
            })
            textRenderer.node.position = [-width / 2, safeArea.y + safeArea.height, 0];
            textRenderer.node.visibility = VisibilityFlagBits.UI;
            doc.addElement(textRenderer);
        }

        return flow.createFlow();
    }
}

