import { BufferUsageFlagBits } from "../core/gfx/Buffer.js";
import Format, { FormatInfos } from "../core/gfx/Format.js";
import { PassState } from "../core/gfx/Pipeline.js";
import aabb3d, { AABB3D } from "../core/math/aabb3d.js";
import vec3, { Vec3 } from "../core/math/vec3.js";
import vec4, { Vec4 } from "../core/math/vec4.js";
import BufferViewResizable from "../core/scene/buffers/BufferViewResizable.js";
import Model from "../core/scene/Model.js";
import Pass from "../core/scene/Pass.js";
import SubMesh, { VertexAttribute, VertexInputView } from "../core/scene/SubMesh.js";
import SubModel from "../core/scene/SubModel.js";
import ShaderLib, { ShaderCreateInfo } from "../core/ShaderLib.js";
import BoundedRenderer, { BoundsEvent } from "./internal/BoundedRenderer.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

const shader_primitive_info: ShaderCreateInfo = { name: 'primitive' };
ShaderLib.preloaded.push(shader_primitive_info)

const VERTEX_COMPONENTS = 3/*xyz*/ + 4/*rgba*/;

export default class Primitive extends BoundedRenderer {
    private _model: Model | undefined;
    get model(): Model | undefined {
        return this._model;
    }

    private _vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    private _vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        return this._bounds;
    }

    private _buffer: BufferViewResizable = new BufferViewResizable("Float32", BufferUsageFlagBits.VERTEX);

    private _vertexCount: number = 0;

    private _subMesh!: SubMesh;


    drawLine(from: Readonly<Vec3>, to: Readonly<Vec3>, color: Readonly<Vec4> = vec4.ONE) {
        const length = (this._vertexCount + 2) * VERTEX_COMPONENTS;
        this._buffer.resize(length)

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
        const vertexAttributes: VertexAttribute[] = [];
        let offset = 0;
        let format = Format.RGB32_SFLOAT;
        vertexAttributes.push({ name: 'a_position', format, buffer: 0, offset });
        offset += FormatInfos[format].size;
        format = Format.RGBA32_SFLOAT;
        vertexAttributes.push({ name: 'a_color', format, buffer: 0, offset });
        offset += FormatInfos[format].size;

        const vertexInput: VertexInputView = {
            buffers: [this._buffer],
            offsets: [0]
        }
        const subMesh: SubMesh = {
            vertexAttributes,
            vertexInput,
            vertexPositionMin: vec3.create(),
            vertexPositionMax: vec3.create(),
            vertexOrIndexCount: 0
        }

        const state = new PassState(
            ShaderLib.instance.getShader(shader_primitive_info),
            "LINE_LIST",
            { cullMode: 'NONE' },
            undefined,
            { srcRGB: 'SRC_ALPHA', dstRGB: 'ONE_MINUS_SRC_ALPHA', srcAlpha: 'ONE', dstAlpha: 'ONE_MINUS_SRC_ALPHA' })

        const subModel: SubModel = new SubModel(subMesh, [new Pass(state)]);
        const model = new Model(this.node, [subModel])
        zero.scene.addModel(model)
        this._subMesh = subMesh;
        this._model = model;
    }

    lateUpdate(): void {
        if (this._vertexCount == 0) {
            this._subMesh.vertexOrIndexCount = 0;
            return;
        }

        this._buffer.update();

        this._subMesh.vertexOrIndexCount = this._vertexCount;
    }

    clear() {
        // this._vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        // this._vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        // aabb3d.set(this._bounds, 0, 0, 0, 0, 0, 0);

        this._vertexCount = 0;
    }
}