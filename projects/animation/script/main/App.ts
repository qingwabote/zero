import GLTF from "../../../../script/main/assets/GLTF.js";
import AnimationController from "../../../../script/main/components/AnimationController.js";
import Camera from "../../../../script/main/components/Camera.js";
import CameraControlPanel from "../../../../script/main/components/CameraControlPanel.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import UIDocument from "../../../../script/main/components/ui/UIDocument.js";
import { ClearFlagBit } from "../../../../script/main/core/gfx/Pipeline.js";
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

        // const animatedCube = new GLTF();
        // await animatedCube.load('./assets/AnimatedCube/AnimatedCube')
        // node = animatedCube.createScene()!;
        // const ac = node.addComponent(AnimationController);
        // ac.animations = animatedCube.animations
        // node.visibilityFlag = VisibilityBit.DEFAULT;

        const boxAnimated = new GLTF();
        await boxAnimated.load('./assets/BoxAnimated/BoxAnimated')
        node = boxAnimated.createScene()!;
        const ac = node.addComponent(AnimationController);
        ac.animations = boxAnimated.animations
        node.visibilityFlag = VisibilityBit.DEFAULT;

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

