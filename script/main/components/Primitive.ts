import { BufferUsageFlagBits } from "../core/gfx/Buffer.js";
import { FormatInfos } from "../core/gfx/Format.js";
import { CullMode, PrimitiveTopology, VertexInputAttributeDescription, VertexInputBindingDescription, VertexInputRate, VertexInputState } from "../core/gfx/Pipeline.js";
import aabb3d, { AABB3D } from "../core/math/aabb3d.js";
import vec3, { Vec3Like } from "../core/math/vec3.js";
import { Vec4Like } from "../core/math/vec4.js";
import BufferViewResizable from "../core/scene/buffers/BufferViewResizable.js";
import Model from "../core/scene/Model.js";
import Pass from "../core/scene/Pass.js";
import SubModel from "../core/scene/SubModel.js";
import ShaderLib from "../core/ShaderLib.js";
import BoundedRenderer, { BoundsEvent } from "./internal/BoundedRenderer.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

ShaderLib.preloaded.push({ name: 'primitive' })

const VERTEX_COMPONENTS = 3/*xyz*/ + 4/*rgba*/;

export default class Primitive extends BoundedRenderer {
    private _vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    private _vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        return this._bounds;
    }

    private _buffer: BufferViewResizable = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);
    private _buffer_reallocated: boolean = false;

    private _vertexCount: number = 0;

    private _vertexInputState!: VertexInputState;

    private _model!: Model;

    drawLine(from: Vec3Like, to: Vec3Like, color: Vec4Like = [1, 1, 1, 1]) {
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

        vec3.min(vec3_a, this._vertexMin, from);
        vec3.min(vec3_a, vec3_a, to);
        vec3.max(vec3_b, this._vertexMax, from);
        vec3.max(vec3_b, vec3_b, to);
        if (!vec3.equals(vec3_a, this._vertexMin) || !vec3.equals(vec3_b, this._vertexMax)) {
            aabb3d.fromPoints(this._bounds, vec3_a, vec3_b);
            vec3.set(this._vertexMin, ...vec3_a);
            vec3.set(this._vertexMax, ...vec3_b);
            this.emit(BoundsEvent.BOUNDS_CHANGED);
        }

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

        const pass = new Pass({
            shader,
            primitive: PrimitiveTopology.LINE_LIST,
            rasterizationState: { cullMode: CullMode.NONE },
            depthStencilState: { depthTestEnable: false }
        });
        const subModel: SubModel = new SubModel([], [pass]);
        const model = new Model(this.node, [subModel])
        zero.scene.models.push(model);
        this._model = model;
    }

    commit(): void {
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
        // this._vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        // this._vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        // aabb3d.set(this._bounds, 0, 0, 0, 0, 0, 0);

        this._vertexCount = 0;
    }
}