import { device } from "boot";
import { bundle } from "bundling";
import { BlendFactor, BlendState, BufferUsageFlagBits, CullMode, Format, FormatInfos, InputAssemblerInfo, PassState, PrimitiveTopology, RasterizationState, VertexAttribute, VertexAttributeVector, VertexInput } from "gfx";
import { Shader } from "../assets/Shader.js";
import { vec3 } from "../core/math/vec3.js";
import { vec4 } from "../core/math/vec4.js";
import { BufferView } from "../core/render/BufferView.js";
import { Material, Mesh } from "../core/render/index.js";
import { Model } from "../core/render/scene/Model.js";
import { Pass } from "../core/render/scene/Pass.js";
import { SubMesh } from "../core/render/scene/SubMesh.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer } from "./BoundedRenderer.js";
const drawLine = {
    vec3_a: vec3.create(),
    vec3_b: vec3.create(),
};
const drawAABB = {
    vec3_a: vec3.create(),
    vec3_b: vec3.create(),
    vec3_c: vec3.create(),
    vec3_d: vec3.create(),
    vec3_e: vec3.create(),
    vec3_f: vec3.create(),
    vec3_g: vec3.create(),
    vec3_h: vec3.create(),
};
const ss_primitive = await bundle.cache('./shaders/primitive', Shader);
const VERTEX_COMPONENTS = 3 /*xyz*/ + 4 /*rgba*/;
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
})();
export class GeometryRenderer extends BoundedRenderer {
    get bounds() {
        return this._mesh.bounds;
    }
    constructor(node) {
        super(node);
        this.color = vec4.ONE;
        this._buffer = new BufferView("Float32", BufferUsageFlagBits.VERTEX);
        this._vertexCount = 0;
        this._vertexMin = vec3.create();
        this._vertexMax = vec3.create();
        const iaInfo = new InputAssemblerInfo;
        iaInfo.vertexAttributes = VERTEX_ATTRIBUTES;
        const vertexInput = new VertexInput;
        vertexInput.buffers.add(this._buffer.buffer);
        vertexInput.offsets.add(0);
        iaInfo.vertexInput = vertexInput;
        this._mesh = new Mesh([new SubMesh(device.createInputAssembler(iaInfo))]);
        ;
    }
    createModel() {
        const rasterizationState = new RasterizationState;
        rasterizationState.cullMode = CullMode.NONE;
        const blendState = new BlendState;
        blendState.srcRGB = BlendFactor.SRC_ALPHA;
        blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
        blendState.srcAlpha = BlendFactor.ONE;
        blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;
        const state = new PassState;
        state.shader = shaderLib.getShader(ss_primitive);
        state.primitive = PrimitiveTopology.LINE_LIST;
        state.rasterizationState = rasterizationState;
        state.blendState = blendState;
        return new Model(this.node, this._mesh, [new Material([Pass.Pass(state)])]);
    }
    drawLine(from, to, color = this.color) {
        if (this._vertexCount == 0) {
            vec3.set(this._vertexMin, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            vec3.set(this._vertexMax, Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
        }
        const length = (this._vertexCount + 2) * VERTEX_COMPONENTS;
        this._buffer.resize(length);
        let offset = this._vertexCount * VERTEX_COMPONENTS;
        this._buffer.set(from, offset);
        offset += 3;
        this._buffer.set(color, offset);
        offset += 4;
        this._buffer.set(to, offset);
        offset += 3;
        this._buffer.set(color, offset);
        vec3.min(drawLine.vec3_a, this._vertexMin, from);
        vec3.min(drawLine.vec3_a, drawLine.vec3_a, to);
        vec3.max(drawLine.vec3_b, this._vertexMax, from);
        vec3.max(drawLine.vec3_b, drawLine.vec3_b, to);
        if (!vec3.equals(drawLine.vec3_a, this._vertexMin) || !vec3.equals(drawLine.vec3_b, this._vertexMax)) {
            this._mesh.setBoundsByPoints(drawLine.vec3_a, drawLine.vec3_b);
            vec3.set(this._vertexMin, ...drawLine.vec3_a);
            vec3.set(this._vertexMax, ...drawLine.vec3_b);
            // this.emit(BoundsEvent.BOUNDS_CHANGED);
        }
        this._vertexCount += 2;
    }
    drawAABB(aabb, color = this.color) {
        const left_up_far = drawAABB.vec3_a;
        const left_up_near = drawAABB.vec3_b;
        const right_up_near = drawAABB.vec3_c;
        const right_up_far = drawAABB.vec3_d;
        const left_down_far = drawAABB.vec3_e;
        const left_down_near = drawAABB.vec3_f;
        const right_down_near = drawAABB.vec3_g;
        const right_down_far = drawAABB.vec3_h;
        vec3.set(left_down_far, aabb.center[0] - aabb.halfExtent[0], aabb.center[1] - aabb.halfExtent[1], aabb.center[2] - aabb.halfExtent[2]);
        vec3.set(right_up_near, aabb.center[0] + aabb.halfExtent[0], aabb.center[1] + aabb.halfExtent[1], aabb.center[2] + aabb.halfExtent[2]);
        vec3.set(left_up_far, left_down_far[0], right_up_near[1], left_down_far[2]);
        vec3.set(left_up_near, left_down_far[0], right_up_near[1], right_up_near[2]);
        vec3.set(right_up_far, right_up_near[0], right_up_near[1], left_down_far[2]);
        vec3.set(left_down_near, left_down_far[0], left_down_far[1], right_up_near[2]);
        vec3.set(right_down_near, right_up_near[0], left_down_far[1], right_up_near[2]);
        vec3.set(right_down_far, right_up_near[0], left_down_far[1], left_down_far[2]);
        this.drawLine(left_up_far, left_up_near, color);
        this.drawLine(left_up_near, right_up_near, color);
        this.drawLine(right_up_near, right_up_far, color);
        this.drawLine(right_up_far, left_up_far, color);
        this.drawLine(left_down_far, left_down_near, color);
        this.drawLine(left_down_near, right_down_near, color);
        this.drawLine(right_down_near, right_down_far, color);
        this.drawLine(right_down_far, left_down_far, color);
        this.drawLine(left_up_far, left_down_far, color);
        this.drawLine(left_up_near, left_down_near, color);
        this.drawLine(right_up_near, right_down_near, color);
        this.drawLine(right_up_far, right_down_far, color);
    }
    lateUpdate() {
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