import GLTF from "../../../../script/main/assets/GLTF.js";
import Camera from "../../../../script/main/components/Camera.js";
import DirectionalLight from "../../../../script/main/components/DirectionalLight.js";
import DebugDrawer from "../../../../script/main/components/physics/DebugDrawer.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import { ClearFlagBit, SampleCountFlagBits } from "../../../../script/main/gfx/Pipeline.js";
import vec3, { Vec3 } from "../../../../script/main/math/vec3.js";
import Node from "../../../../script/main/Node.js";
import ModelPhase from "../../../../script/main/pipeline/phases/ModelPhase.js";
import RenderFlow from "../../../../script/main/pipeline/RenderFlow.js";
import RenderStage from "../../../../script/main/pipeline/RenderStage.js";
import ForwardStage from "../../../../script/main/pipeline/stages/ForwardStage.js";
import VisibilityBit from "../../../../script/main/render/VisibilityBit.js";
import Zero from "../../../../script/main/Zero.js";

export default class App extends Zero {
    async start(): Promise<RenderFlow> {
        const { width, height } = this.window;

        const lit_position: Vec3 = [4, 4, 4];

        let node: Node;

        // light
        node = new Node;
        node.addComponent(DirectionalLight);
        node.position = lit_position;
        // node.visibility = Visibility_Up;

        node = new Node;
        const up_camera = node.addComponent(Camera);
        up_camera.fov = 45;
        up_camera.viewport = { x: 0, y: 0, width, height };
        node.position = [0, 0, 10];

        const plane = new GLTF();
        await plane.load('../../assets/models/primitive');
        node = plane.createScene("Cube")!;
        // node.scale = [4, 4, 4];

        // UI
        node = new Node;
        const cameraUI = node.addComponent(Camera);
        cameraUI.visibilities = VisibilityBit.UI;
        cameraUI.clearFlags = ClearFlagBit.DEPTH;
        cameraUI.orthoHeight = height / 2;
        cameraUI.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.visibility = VisibilityBit.UI;
        node.addComponent(DebugDrawer);

        node = new Node;
        node.visibility = VisibilityBit.UI;
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2 + 200, 0];

        const stages: RenderStage[] = [];
        stages.push(new ForwardStage([new ModelPhase]));
        return new RenderFlow(stages, SampleCountFlagBits.SAMPLE_COUNT_1);
    }
}

