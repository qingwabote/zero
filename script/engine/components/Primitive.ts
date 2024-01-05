import { device } from "boot";
import { bundle } from "bundling";
import { BlendFactor, BlendState, BufferUsageFlagBits, CullMode, Format, FormatInfos, InputAssemblerInfo, PassState, PrimitiveTopology, RasterizationState, VertexAttribute, VertexInput } from "gfx";
import { Shader } from "../assets/Shader.js";
import { Zero } from "../core/Zero.js";
import { AABB3D, aabb3d } from "../core/math/aabb3d.js";
import { Vec3, vec3 } from "../core/math/vec3.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
import { Pass } from "../core/render/scene/Pass.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { SubModel } from "../core/render/scene/SubModel.js";
import { BufferView } from "../core/render/scene/buffers/BufferView.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer, BoundsEvent } from "./BoundedRenderer.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

const ss_primitive = await bundle.cache('./shaders/primitive', Shader);

const VERTEX_COMPONENTS = 3/*xyz*/ + 4/*rgba*/;

export class Primitive extends BoundedRenderer {
    private _vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    private _vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

    private _bounds = aabb3d.create();
    public get bounds(): Readonly<AABB3D> {
        return this._bounds;
    }

    private _buffer: BufferView = new BufferView("Float32", BufferUsageFlagBits.VERTEX);

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
        const iaInfo = new InputAssemblerInfo;
        let offset = 0;
        let format = Format.RGB32_SFLOAT;
        const positionAttribute = new VertexAttribute;
        positionAttribute.name = 'a_position';
        positionAttribute.format = format;
        positionAttribute.buffer = 0;
        positionAttribute.offset = offset;
        iaInfo.vertexAttributes.add(positionAttribute);
        offset += FormatInfos[format].bytes;
        format = Format.RGBA32_SFLOAT;
        const colorAttribute = new VertexAttribute;
        colorAttribute.name = 'a_color';
        colorAttribute.format = format;
        colorAttribute.buffer = 0;
        colorAttribute.offset = offset;
        iaInfo.vertexAttributes.add(colorAttribute);
        offset += FormatInfos[format].bytes;

        const vertexInput = new VertexInput;
        vertexInput.buffers.add(this._buffer.buffer);
        vertexInput.offsets.add(0);
        iaInfo.vertexInput = vertexInput;

        const subMesh = new SubMesh(
            device.createInputAssembler(iaInfo),
            vec3.create(),
            vec3.create()
        )

        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const blendState = new BlendState;
        blendState.srcRGB = BlendFactor.SRC_ALPHA;
        blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
        blendState.srcAlpha = BlendFactor.ONE;
        blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA
        const state = new PassState;
        state.shader = shaderLib.getShader(ss_primitive);
        state.primitive = PrimitiveTopology.LINE_LIST;
        state.rasterizationState = rasterizationState;
        state.blendState = blendState;

        const subModel: SubModel = new SubModel(subMesh, [new Pass(state)]);
        this._model.subModels.push(subModel);
        Zero.instance.scene.addModel(this._model)
        this._subMesh = subMesh;
    }

    lateUpdate(): void {
        if (this._vertexCount == 0) {
            this._subMesh.drawInfo.count = 0;
            return;
        }

        this._buffer.update();

        this._subMesh.drawInfo.count = this._vertexCount;
    }

    clear() {
        // this._vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        // this._vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        // aabb3d.set(this._bounds, 0, 0, 0, 0, 0, 0);

        this._vertexCount = 0;
    }
}