import GLTF from "../../../../script/main/assets/GLTF.js";
import Camera from "../../../../script/main/components/Camera.js";
import CameraControlPanel from "../../../../script/main/components/CameraControlPanel.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import MeshRenderer from "../../../../script/main/components/MeshRenderer.js";
import BoxShape from "../../../../script/main/components/physics/BoxShape.js";
import DebugDrawer from "../../../../script/main/components/physics/DebugDrawer.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import UIDocument from "../../../../script/main/components/ui/UIDocument.js";
import { ClearFlagBit } from "../../../../script/main/core/gfx/Pipeline.js";
import vec3, { Vec3 } from "../../../../script/main/core/math/vec3.js";
import Node from "../../../../script/main/core/Node.js";
import Flow from "../../../../script/main/core/pipeline/Flow.js";
import Zero from "../../../../script/main/core/Zero.js";
import ModelPhase from "../../../../script/main/pipeline/phases/ModelPhase.js";
import ForwardStage from "../../../../script/main/pipeline/stages/ForwardStage.js";
import VisibilityBit from "../../../../script/main/VisibilityBit.js";
import Joystick from "./Joystick.js";

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

        const lit_position: Vec3 = [4, 4, 4];

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = lit_position;
        // node.visibility = Visibility_Up;

        node = new Node;
        const main_camera = node.addComponent(Camera);
        main_camera.fov = 45;
        main_camera.viewport = { x: 0, y: 0, width, height };
        node.position = [0, 0, 10];

        const primitive = new GLTF;
        await primitive.load('../../assets/models/primitive/scene');
        node = primitive.createScene("Cube")!;
        let meshRenderer = node.getComponent(MeshRenderer)!;
        let shape = node.addComponent(BoxShape);
        shape.body.mass = 1;
        let aabb = meshRenderer.bounds;
        shape.size = vec3.create(aabb.halfExtentX * 2, aabb.halfExtentY * 2, aabb.halfExtentZ * 2)
        node.position = [0, 3, 0];

        node = primitive.createScene("Cube")!;
        node.scale = [4, 0.1, 4];
        meshRenderer = node.getComponent(MeshRenderer)!;
        shape = node.addComponent(BoxShape);
        aabb = meshRenderer.bounds;
        shape.size = vec3.create(aabb.halfExtentX * 2, aabb.halfExtentY * 2, aabb.halfExtentZ * 2)
        node.position = [0, -1, 0];

        node = new Node;
        node.visibilityFlag = VisibilityBit.DEFAULT;
        node.addComponent(DebugDrawer);

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
        const joystick = node.addComponent(Joystick);
        const bounds = joystick.getBounds();
        node.position = vec3.create(width / 2 - (bounds.x + bounds.width), -height / 2 - bounds.y, 0)
        doc.addElement(joystick);

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2, 0];

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        node.addComponent(CameraControlPanel).camera = main_camera;
        node.position = [-width / 2, height / 2, 0];

        return new Flow([new ForwardStage([new ModelPhase])]);
    }
}

