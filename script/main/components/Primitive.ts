import Component from "../base/Component.js";
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

const VERTEX_COMPONENTS = 3/*xyz*/ + 4/*rgba*/;

export default class Primitive extends Component {
    private _buffer: BufferViewResizable = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);
    private _buffer_reallocated: boolean = false;

    private _vertexCount: number = 0;

    private _vertexInputState!: VertexInputState;

    private _model!: Model;

    drawLine(from: Vec3, to: Vec3, color: Vec4 = [1, 1, 1, 1]) {
        const length = (this._vertexCount + 2) * VERTEX_COMPONENTS;
        if (this._buffer.resize(length)) {
            this._buffer_reallocated = true;
        }

        let offset = this._vertexCount * VERTEX_COMPONENTS;
        this._buffer.set(from, offset);
        offset += 3
        this._buffer.set(color, offset)
        offset += 4
        this._buffer.set(to, offset);
        offset += 3
        this._buffer.set(color, offset);

        this._vertexCount += 2;
    }

    start() {
        const shader = ShaderLib.instance.getShader('primitive');
        const attributes: VertexInputAttributeDescription[] = [];

        let offset = 0;
        const definition_position = shader.info.meta.attributes["a_position"];
        const attribute_position: VertexInputAttributeDescription = {
            location: definition_position.location,
            format: definition_position.format,
            binding: 0,
            offset
        };
        attributes.push(attribute_position);
        offset += FormatInfos[attribute_position.format].size;

        const definition_color = shader.info.meta.attributes["a_color"];
        const attribute_color: VertexInputAttributeDescription = {
            location: definition_color.location,
            format: definition_color.format,
            binding: 0,
            offset
        };
        attributes.push(attribute_color);
        offset += FormatInfos[attribute_color.format].size;

        const bindings: VertexInputBindingDescription[] = [];
        bindings.push({
            binding: attribute_position.binding,
            stride: offset,
            inputRate: VertexInputRate.VERTEX
        })
        this._vertexInputState = new VertexInputState(attributes, bindings);

        const pass = new Pass(new PassState(shader, PrimitiveTopology.LINE_LIST, { cullMode: CullMode.NONE }, { depthTestEnable: false }));
        const subModel: SubModel = { inputAssemblers: [], passes: [pass], vertexOrIndexCount: 0 };
        const model = new Model([subModel])
        zero.render_scene.models.push(model);
        this._model = model;
    }

    commit(): void {
        this._model.visibility = this.node.visibility;
        if (this.node.hasChanged) {
            this._model.updateBuffer(this.node.matrix);
        }

        const subModel = this._model.subModels[0];

        if (this._vertexCount == 0) {
            subModel.vertexOrIndexCount = 0;
            return;
        }

        this._buffer.update();

        if (!subModel.inputAssemblers[0] || this._buffer_reallocated) {
            const inputAssembler = gfx.createInputAssembler();
            inputAssembler.initialize({
                vertexInputState: this._vertexInputState,
                vertexInput: {
                    vertexBuffers: [this._buffer.buffer],
                    vertexOffsets: [0],
                }
            })
            subModel.inputAssemblers[0] = inputAssembler;
            this._buffer_reallocated = false;
        }

        subModel.vertexOrIndexCount = this._vertexCount;
    }

    clear() {
        this._vertexCount = 0;
    }
}