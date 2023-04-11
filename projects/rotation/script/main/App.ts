import GLTF from "../../../../script/main/assets/GLTF.js";
import Camera from "../../../../script/main/components/Camera.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import DebugDrawer from "../../../../script/main/components/physics/DebugDrawer.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import { ClearFlagBit } from "../../../../script/main/core/gfx/Pipeline.js";
import quat from "../../../../script/main/core/math/quat.js";
import vec3, { Vec3 } from "../../../../script/main/core/math/vec3.js";
import Node from "../../../../script/main/core/Node.js";
import Flow from "../../../../script/main/core/render/Flow.js";
import Stage from "../../../../script/main/core/render/Stage.js";
import Zero from "../../../../script/main/core/Zero.js";
import ModelPhase from "../../../../script/main/render/phases/ModelPhase.js";
import ForwardStage from "../../../../script/main/render/stages/ForwardStage.js";
import VisibilityBit from "../../../../script/main/VisibilityBit.js";

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

        const lit_position: Vec3 = [0, 4, 4];

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
        node.position = [10, 10, 10];
        const view = vec3.normalize(vec3.create(), node.position);
        node.rotation = quat.fromViewUp(quat.create(), view);

        const primitive = new GLTF();
        await primitive.load('../../assets/models/primitive/scene');
        node = primitive.createScene("Cube")!;
        node.visibilityFlag = VisibilityBit.DEFAULT;
        node.scale = [0.5, 0.5, 0.5];

        node = primitive.createScene("Cone")!;
        node.visibilityFlag = VisibilityBit.DEFAULT;
        node.scale = [0.5, 0.5, 0.5];
        const moon = new Node;
        moon.addChild(node);
        moon.rotation = quat.fromAxisAngle(quat.create(), vec3.UNIT_X, -Math.PI / 2);
        moon.position = [0, 0, 2];

        node.world_rotation = quat.fromAxisAngle(quat.create(), vec3.UNIT_X, -Math.PI / 2);

        // const axis = vec3.UNIT_Y;
        // const speed = 0.01;
        // const step = quat.fromAxisAngle(quat.create(), axis, speed);
        // const step = quat.fromEuler(quat.create(), 0.5, 0.5, 0);
        // zero.timeScheduler.setInterval(() => {
        //     moon.position = vec3.transformQuat(vec3.create(), moon.position, step);

        //     const view = vec3.normalize(vec3.create(), moon.position);
        //     moon.rotation = quat.fromViewUp(quat.create(), view);
        // })

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.visibilityFlags = VisibilityBit.UI;
        ui_camera.clearFlags = ClearFlagBit.DEPTH;
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        node.addComponent(DebugDrawer);

        node = new Node;
        node.visibilityFlag = VisibilityBit.UI;
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2 + 200, 0];

        const stages: Stage[] = [];
        stages.push(new ForwardStage([new ModelPhase]));
        return new Flow(stages);
    }
}

