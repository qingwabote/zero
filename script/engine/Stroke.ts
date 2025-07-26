import { BufferUsageFlagBits, CommandBuffer, Format, FormatInfos, InputAssembler, PrimitiveTopology, VertexAttribute, VertexAttributeVector } from "gfx";
import { AABB3D, aabb3d } from "./core/math/aabb3d.js";
import { frustum } from "./core/math/frustum.js";
import { vec3, Vec3 } from "./core/math/vec3.js";
import { vec4 } from "./core/math/vec4.js";
import { Draw } from "./core/render/Draw.js";
import { BufferView } from "./core/render/gfx/BufferView.js";
import { Mesh } from "./core/render/scene/Mesh.js";
import { shaderLib } from "./core/shaderLib.js";

const VERTEX_COMPONENTS = 3/*xyz*/ + 4/*rgba*/;

const VERTEX_ATTRIBUTES = (function () {
    const attributes = new VertexAttributeVector;
    let offset = 0;
    let format = Format.RGB32_SFLOAT;
    const position = new VertexAttribute;
    position.format = format;
    position.buffer = 0;
    position.offset = offset;
    position.location = shaderLib.attributes.position.location;
    attributes.add(position);
    offset += FormatInfos[format].bytes;
    format = Format.RGBA32_SFLOAT;
    const color = new VertexAttribute;
    color.format = format;
    color.buffer = 0;
    color.offset = offset;
    color.location = shaderLib.attributes.color.location;
    attributes.add(color);
    offset += FormatInfos[format].bytes;
    return attributes;
})()

const drawLine = {
    vec3_a: vec3.create(),
    vec3_b: vec3.create(),
    vec3_c: vec3.create(),
    vec3_d: vec3.create(),
} as const

const drawAABB = {
    vec3_a: vec3.create(),
    vec3_b: vec3.create(),
    vec3_c: vec3.create(),
    vec3_d: vec3.create(),
    vec3_e: vec3.create(),
    vec3_f: vec3.create(),
    vec3_g: vec3.create(),
    vec3_h: vec3.create(),
} as const

export class Stroke {
    readonly mesh: Mesh;

    private _view = new BufferView('f32', BufferUsageFlagBits.VERTEX);

    constructor() {
        const ia = new InputAssembler;
        ia.vertexInputState.attributes = VERTEX_ATTRIBUTES;
        ia.vertexInputState.primitive = PrimitiveTopology.LINE_LIST;
        ia.vertexInput.buffers.add(this._view.buffer);
        ia.vertexInput.offsets.add(0);

        this.mesh = new Mesh([new Draw(ia)])
    }

    line(from: Readonly<Vec3>, to: Readonly<Vec3>, color = vec4.ONE): void {
        const draw = this.mesh.subMeshes[0].range;

        const length = (draw.count + 2) * VERTEX_COMPONENTS;
        this._view.resize(length)

        let offset = draw.count * VERTEX_COMPONENTS;
        this._view.set(from, offset);
        offset += 3
        this._view.set(color, offset)
        offset += 4
        this._view.set(to, offset);
        offset += 3
        this._view.set(color, offset);

        if (draw.count == 0) {
            vec3.set(drawLine.vec3_a, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
            vec3.set(drawLine.vec3_b, Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
        } else {
            aabb3d.toExtremes(drawLine.vec3_a, drawLine.vec3_b, this.mesh.bounds);
        }

        vec3.min(drawLine.vec3_a, drawLine.vec3_a, from);
        vec3.min(drawLine.vec3_a, drawLine.vec3_a, to);
        vec3.max(drawLine.vec3_b, drawLine.vec3_b, from);
        vec3.max(drawLine.vec3_b, drawLine.vec3_b, to);

        aabb3d.toExtremes(drawLine.vec3_c, drawLine.vec3_d, this.mesh.bounds);

        if (!vec3.equals(drawLine.vec3_a, drawLine.vec3_c) || !vec3.equals(drawLine.vec3_b, drawLine.vec3_d)) {
            this.mesh.setBoundsByExtremes(drawLine.vec3_a, drawLine.vec3_b);
        }

        draw.count += 2;
    }

    aabb(aabb: Readonly<AABB3D>, color = vec4.ONE) {
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

        this.line(left_up_far, left_up_near, color);
        this.line(left_up_near, right_up_near, color);
        this.line(right_up_near, right_up_far, color);
        this.line(right_up_far, left_up_far, color);

        this.line(left_down_far, left_down_near, color);
        this.line(left_down_near, right_down_near, color);
        this.line(right_down_near, right_down_far, color);
        this.line(right_down_far, left_down_far, color);

        this.line(left_up_far, left_down_far, color);
        this.line(left_up_near, left_down_near, color);
        this.line(right_up_near, right_down_near, color);
        this.line(right_up_far, right_down_far, color);
    }

    frustum(frustum: Readonly<frustum.Vertices>, color = vec4.ONE) {
        this.line(frustum[0], frustum[1], color);
        this.line(frustum[1], frustum[2], color);
        this.line(frustum[2], frustum[3], color);
        this.line(frustum[3], frustum[0], color);

        this.line(frustum[4], frustum[5], color);
        this.line(frustum[5], frustum[6], color);
        this.line(frustum[6], frustum[7], color);
        this.line(frustum[7], frustum[4], color);

        this.line(frustum[0], frustum[4], color);
        this.line(frustum[1], frustum[5], color);
        this.line(frustum[2], frustum[6], color);
        this.line(frustum[3], frustum[7], color);
    }

    upload(commandBuffer: CommandBuffer): void {
        if (this.mesh.subMeshes[0].range.count == 0) {
            return;
        }

        this._view.update(commandBuffer);
    }

    clear() {
        this.mesh.subMeshes[0].range.count = 0;
    }
}