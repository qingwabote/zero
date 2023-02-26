import Camera from "../../../../script/main/components/Camera.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import Node from "../../../../script/main/core/Node.js";
import Flow from "../../../../script/main/core/pipeline/Flow.js";
import Zero from "../../../../script/main/core/Zero.js";
import ModelPhase from "../../../../script/main/pipeline/phases/ModelPhase.js";
import ForwardStage from "../../../../script/main/pipeline/stages/ForwardStage.js";

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

        let node: Node;

        // UI
        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        node = new Node;
        node.addComponent(Profiler);
        node.position = [-width / 2, - height / 2 + 200, 0];

        return new Flow([new ForwardStage([new ModelPhase], true)]);
    }
}

