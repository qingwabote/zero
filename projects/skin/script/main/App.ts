import GLTF from "../../../../script/main/assets/GLTF.js";
import Camera from "../../../../script/main/components/Camera.js";
import CameraControlPanel from "../../../../script/main/components/CameraControlPanel.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import UIDocument from "../../../../script/main/components/ui/UIDocument.js";
import Asset from "../../../../script/main/core/Asset.js";
import { ClearFlagBit } from "../../../../script/main/core/gfx/Pipeline.js";
import quat from "../../../../script/main/core/math/quat.js";
import vec2 from "../../../../script/main/core/math/vec2.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import Node from "../../../../script/main/core/Node.js";
import Flow from "../../../../script/main/core/render/Flow.js";
import Zero from "../../../../script/main/core/Zero.js";
import ModelPhase from "../../../../script/main/render/phases/ModelPhase.js";
import ForwardStage from "../../../../script/main/render/stages/ForwardStage.js";
import VisibilityBit from "../../../../script/main/VisibilityBit.js";

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

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

        const skin = await Asset.cache.load('./assets/killer-whale/scene', GLTF);
        node = skin.createScene('Scene')!;
        node.visibilityFlag = VisibilityBit.DEFAULT;
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
        ui_camera.visibilityFlags = VisibilityBit.UI;
        ui_camera.clearFlags = ClearFlagBit.DEPTH;
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2, 0];

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.size = vec2.create(width, height);
        cameraControlPanel.camera = main_camera;
        doc.addElement(cameraControlPanel);

        return new Flow([new ForwardStage([new ModelPhase])])
    }
}

