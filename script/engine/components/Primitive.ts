import { device } from "boot";
import { bundle } from "bundling";
import { BlendFactor, BlendState, BufferUsageFlagBits, CullMode, Format, FormatInfos, InputAssemblerInfo, PassState, PrimitiveTopology, RasterizationState, VertexAttribute, VertexAttributeVector, VertexInput } from "gfx";
import { Shader } from "../assets/Shader.js";
import { Node } from "../core/Node.js";
import { Zero } from "../core/Zero.js";
import { Vec3, vec3 } from "../core/math/vec3.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
import { BufferView } from "../core/render/BufferView.js";
import { Material, Mesh } from "../core/render/index.js";
import { Pass } from "../core/render/scene/Pass.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer } from "./BoundedRenderer.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

const ss_primitive = await bundle.cache('./shaders/primitive', Shader);

const VERTEX_COMPONENTS = 3/*xyz*/ + 4/*rgba*/;

const VERTEX_ATTRIBUTES = (function () {
    const attributes = new VertexAttributeVector;
    let offset = 0;
    let format = Format.RGB32_SFLOAT;
    const positionAttribute = new VertexAttribute;
    positionAttribute.name = 'a_position';
    positionAttribute.format = format;
    positionAttribute.buffer = 0;
    positionAttribute.offset = offset;
    attributes.add(positionAttribute);
    offset += FormatInfos[format].bytes;
    format = Format.RGBA32_SFLOAT;
    const colorAttribute = new VertexAttribute;
    colorAttribute.name = 'a_color';
    colorAttribute.format = format;
    colorAttribute.buffer = 0;
    colorAttribute.offset = offset;
    attributes.add(colorAttribute);
    offset += FormatInfos[format].bytes;
    return attributes;
})()


export class Primitive extends BoundedRenderer {
    color: Readonly<Vec4> = vec4.ONE;

    private _buffer: BufferView = new BufferView("Float32", BufferUsageFlagBits.VERTEX);

    private _vertexCount: number = 0;

    private _mesh: Mesh;

    private _vertexMin = vec3.create();
    private _vertexMax = vec3.create();

    constructor(node: Node) {
        super(node);

        const iaInfo = new InputAssemblerInfo;
        iaInfo.vertexAttributes = VERTEX_ATTRIBUTES;
        const vertexInput = new VertexInput;
        vertexInput.buffers.add(this._buffer.buffer);
        vertexInput.offsets.add(0);
        iaInfo.vertexInput = vertexInput;

        const subMesh = new SubMesh(device.createInputAssembler(iaInfo))

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

        const pass = new Pass(state);
        pass.initialize();

        const mesh = new Mesh([subMesh]);

        this._model.mesh = mesh;
        this._model.materials = [new Material([pass])];

        this._mesh = mesh;
    }

    drawLine(from: Readonly<Vec3>, to: Readonly<Vec3>, color: Readonly<Vec4> = this.color) {
        if (this._vertexCount == 0) {
            vec3.set(this._vertexMin, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            vec3.set(this._vertexMax, Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
        }

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
            this._mesh.setBoundsByPoints(vec3_a, vec3_b);
            vec3.set(this._vertexMin, ...vec3_a);
            vec3.set(this._vertexMax, ...vec3_b);
            // this.emit(BoundsEvent.BOUNDS_CHANGED);
        }

        this._vertexCount += 2;
    }

    start() {
        Zero.instance.scene.addModel(this._model)
    }

    lateUpdate(): void {
        if (this._vertexCount == 0) {
            this._mesh.subMeshes[0].drawInfo.count = 0;
            return;
        }

        this._buffer.update();

        this._mesh.subMeshes[0].drawInfo.count = this._vertexCount;
    }

    clear() {
        // this._vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        // this._vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        // aabb3d.set(this._bounds, 0, 0, 0, 0, 0, 0);

        this._vertexCount = 0;
    }
}