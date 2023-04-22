import Texture from "../../../../script/main/assets/Texture.js";
import Camera from "../../../../script/main/components/Camera.js";
import Profiler from "../../../../script/main/components/Profiler.js";
import UIDocument from "../../../../script/main/components/ui/UIDocument.js";
import Asset from "../../../../script/main/core/Asset.js";
import vec2 from "../../../../script/main/core/math/vec2.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import Node from "../../../../script/main/core/Node.js";
import Flow from "../../../../script/main/core/render/Flow.js";
import Zero from "../../../../script/main/core/Zero.js";
import ModelPhase from "../../../../script/main/render/phases/ModelPhase.js";
import stageFactory from "../../../../script/main/render/stageFactory.js";
import VisibilityFlagBits from "../../../../script/main/VisibilityFlagBits.js";
import CuttingBoard from "./CuttingBoard.js";

export default class App extends Zero {
    async start(): Promise<Flow> {
        const { width, height } = this.window;

        let node: Node;

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = UIDocument.create();

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        const cuttingBoard = node.addComponent(CuttingBoard);
        cuttingBoard.texture = (await Asset.cache.load('../../assets/favicon.ico', Texture)).impl;
        cuttingBoard.size = vec2.create(width, height);
        doc.addElement(cuttingBoard);

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        const profiler = node.addComponent(Profiler);
        profiler.anchor = vec2.create(0, 0)
        node.position = [-width / 2, - height / 2, 0];

        return new Flow([stageFactory.forward([new ModelPhase], false)]);
    }
}

