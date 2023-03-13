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
import vec2 from "../../../../script/main/core/math/vec2.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import Node from "../../../../script/main/core/Node.js";
import Flow from "../../../../script/main/core/render/Flow.js";
import Zero from "../../../../script/main/core/Zero.js";
import ModelPhase from "../../../../script/main/render/phases/ModelPhase.js";
import ForwardStage from "../../../../script/main/render/stages/ForwardStage.js";
import VisibilityBit from "../../../../script/main/VisibilityBit.js";
import Joystick from "./Joystick.js";
import Vehicle from "./Vehicle.js";

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
        node.position = [20, 20, 20];

        const primitive = new GLTF;
        await primitive.load('../../assets/models/primitive/scene');

        node = new Node();
        const vehicle = node.addComponent(Vehicle);
        node.visibilityFlag = VisibilityBit.DEFAULT;
        node.position = [0, 3, 0];

        node = primitive.createScene("Cube")!;
        node.visibilityFlag = VisibilityBit.DEFAULT;
        node.scale = [20, 0.1, 20];
        let meshRenderer = node.getComponent(MeshRenderer)!;
        let shape = node.addComponent(BoxShape);
        let aabb = meshRenderer.bounds;
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
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2, 0];

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        const cameraControlPanel = node.addComponent(CameraControlPanel);
        cameraControlPanel.size = vec2.create(width, height);
        cameraControlPanel.camera = main_camera;
        doc.addElement(cameraControlPanel);

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        const joystick = node.addComponent(Joystick);
        this.setInterval(() => {
            // const speed = vehicle.speedKmHour;

            // let breakingForce = 0;
            let engineForce = 0;
            if (joystick.point[1] > 0) {
                engineForce = 3
            } else if (joystick.point[1] < 0) {
                engineForce = -3
            }

            vehicle.setEngineForce(engineForce, 2);
            vehicle.setEngineForce(engineForce, 3);
        })
        const bounds = joystick.getBounds();
        node.position = vec3.create(width / 2 - (bounds.x + bounds.width), -height / 2 - bounds.y, 0)
        doc.addElement(joystick);

        return new Flow([new ForwardStage([new ModelPhase])])
    }
}

