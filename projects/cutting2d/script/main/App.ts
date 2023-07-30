import { Camera, Flow, ModelPhase, Node, Profiler, Texture, UIDocument, VisibilityFlagBits, Zero, assetLib, stageFactory, vec2, vec3 } from "engine-main";
import CuttingBoard from "./CuttingBoard.js";

const favicon = await assetLib.load('../../assets/favicon.ico', Texture);

export default class App extends Zero {
    start(): Flow {
        const { width, height } = this.window;

        let node: Node;

        node = new Node;
        const ui_camera = node.addComponent(Camera);
        ui_camera.orthoHeight = height / 2;
        ui_camera.viewport = { x: 0, y: 0, width, height };
        node.position = vec3.create(0, 0, width / 2);

        const doc = (new Node).addComponent(UIDocument);

        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT
        const cuttingBoard = node.addComponent(CuttingBoard);
        cuttingBoard.texture = favicon.impl;
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

