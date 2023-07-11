import VisibilityFlagBits from "../../../../script/main/VisibilityFlagBits.js";
import Camera from "../../../../script/main/components/Camera.js";
import Node from "../../../../script/main/core/Node.js";
import Zero from "../../../../script/main/core/Zero.js";
import Format from "../../../../script/main/core/gfx/Format.js";
import { BufferUsageFlagBits, CullMode, PrimitiveTopology } from "../../../../script/main/core/gfx/info.js";
import vec3 from "../../../../script/main/core/math/vec3.js";
import Flow from "../../../../script/main/core/pipeline/Flow.js";
import Model from "../../../../script/main/core/scene/Model.js";
import Pass from "../../../../script/main/core/scene/Pass.js";
import SubMesh, { VertexAttribute, VertexInputView } from "../../../../script/main/core/scene/SubMesh.js";
import SubModel from "../../../../script/main/core/scene/SubModel.js";
import BufferViewWritable from "../../../../script/main/core/scene/buffers/BufferViewWritable.js";
import shaderLib from "../../../../script/main/core/shaderLib.js";
import ModelPhase from "../../../../script/main/pipeline/phases/ModelPhase.js";
import stageFactory from "../../../../script/main/pipeline/stageFactory.js";

const shader = await shaderLib.load('triangle');

export default class App extends Zero {
    start(): Flow {
        const { width, height } = this.window;

        let node: Node;

        // cameras
        node = new Node;
        const camera = node.addComponent(Camera);
        camera.visibilityFlags = VisibilityFlagBits.DEFAULT;
        camera.fov = 45;
        camera.viewport = { x: 0, y: 0, width, height };
        node.position = [0, 0, 10];

        const positionBuffer = new BufferViewWritable("Float32", BufferUsageFlagBits.VERTEX, 9);
        positionBuffer.set([
            1, 1, 0,
            -1, 1, 0,
            0, -1, 0
        ]);
        positionBuffer.update();
        const vertexAttributes: VertexAttribute[] = [
            { name: 'a_position', format: Format.RGB32_SFLOAT, buffer: 0, offset: 0 },
        ];
        const vertexInput: VertexInputView = {
            buffers: [positionBuffer],
            offsets: [0]
        }
        const subMesh: SubMesh = {
            vertexAttributes,
            vertexInput,
            vertexPositionMin: vec3.create(),
            vertexPositionMax: vec3.create(),
            vertexOrIndexCount: 3
        }

        const rasterizationState = new gfx.RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const state = new gfx.PassState;
        state.shader = shader;
        state.primitive = PrimitiveTopology.TRIANGLE_LIST;
        state.rasterizationState = rasterizationState;
        const pass = new Pass(state);
        const subModels = [new SubModel(subMesh, [pass])];
        node = new Node;
        node.visibilityFlag = VisibilityFlagBits.DEFAULT;
        node.position = [Math.random(), Math.random(), 0];
        const model = new Model(node, subModels);
        zero.scene.addModel(model)

        return new Flow([stageFactory.forward([new ModelPhase()], false)]);
    }
}

