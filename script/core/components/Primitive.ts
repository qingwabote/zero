import Component from "../Component.js";
import { BufferUsageFlagBits } from "../gfx/Buffer.js";
import { VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../gfx/InputAssembler.js";
import { CullMode, FormatInfos, PassState, PrimitiveTopology } from "../gfx/Pipeline.js";
import { Vec3 } from "../math/vec3.js";
import { Vec4 } from "../math/vec4.js";
import BufferViewResizable from "../render/buffers/BufferViewResizable.js";
import Model from "../render/Model.js";
import Pass from "../render/Pass.js";
import SubModel from "../render/SubModel.js";
import ShaderLib from "../ShaderLib.js";

ShaderLib.preloadedShaders.push({ name: 'primitive' })

// const VERTEX_COMPONENTS = 3 + 4;

const VERTEX_COMPONENTS = 3;

export default class Primitive extends Component {
    private _buffer: BufferViewResizable = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);
    private _buffer_reallocated: boolean = false;

    private _vertexCount: number = 0;

    private _vertexInputState!: VertexInputState;

    private _subModel!: SubModel;

    drawLine(from: Vec3, to: Vec3, color: Vec4 = [1, 1, 1, 1]) {
        const length = (this._vertexCount + 2) * VERTEX_COMPONENTS;
        if (this._buffer.resize(length)) {
            this._buffer_reallocated = true;
        }

        let offset = this._vertexCount * VERTEX_COMPONENTS;
        this._buffer.set(from, offset);
        offset += 3
        // this._buffer.set(color, offset)
        // offset += 4
        this._buffer.set(to, offset);
        // offset += 3
        // this._buffer.set(color, offset);

        this._vertexCount += 2;
    }

    start() {
        const shader = ShaderLib.instance.getShader('primitive');
        const attributes: VertexInputAttributeDescription[] = [];
        const bindings: VertexInputBindingDescription[] = [];
        let definition = shader.info.meta.attributes["a_position"];
        let attribute: VertexInputAttributeDescription = {
            location: definition.location,
            format: definition.format,
            binding: 0,
            offset: 0
        };
        attributes.push(attribute);
        bindings.push({
            binding: attribute.binding,
            stride: FormatInfos[attribute.format].size,
            inputRate: VertexInputRate.VERTEX
        })
        this._vertexInputState = new VertexInputState(attributes, bindings);

        const pass = new Pass(new PassState(shader, PrimitiveTopology.LINE_LIST, { cullMode: CullMode.NONE }, { depthTestEnable: false }));
        const subModel: SubModel = { inputAssemblers: [], passes: [pass], vertexOrIndexCount: 0 };
        zero.renderScene.models.push(new Model([subModel], this.node));
        this._subModel = subModel;
    }

    update(): void {
        if (this._vertexCount == 0) {
            this._subModel.vertexOrIndexCount = 0;
            return;
        }

        this._buffer.update();

        if (!this._subModel.inputAssemblers[0] || this._buffer_reallocated) {
            const inputAssembler = gfx.createInputAssembler();
            inputAssembler.initialize({
                vertexInputState: this._vertexInputState,
                vertexInput: {
                    vertexBuffers: [this._buffer.buffer],
                    vertexOffsets: [0],
                }
            })
            this._subModel.inputAssemblers[0] = inputAssembler;
            this._buffer_reallocated = false;
        }

        this._subModel.vertexOrIndexCount = this._vertexCount;
    }

    clear() {
        this._vertexCount = 0;
    }
}