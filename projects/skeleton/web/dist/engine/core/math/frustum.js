import { plane } from "./plane.js";
import { vec3 } from "./vec3.js";
function vertices() {
    return [vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create()];
}
function faces() {
    return [plane.create(), plane.create(), plane.create(), plane.create(), plane.create(), plane.create()];
}
/**
 *
 * The normal of plane points inwards
 */
function toFaces(out, vertices) {
    // left 
    plane.fromPoints(out[0], vertices[1], vertices[6], vertices[5]);
    // right 
    plane.fromPoints(out[1], vertices[3], vertices[4], vertices[7]);
    // bottom 
    plane.fromPoints(out[2], vertices[6], vertices[3], vertices[7]);
    // top 
    plane.fromPoints(out[3], vertices[0], vertices[5], vertices[4]);
    // near 
    plane.fromPoints(out[4], vertices[2], vertices[0], vertices[3]);
    // far 
    plane.fromPoints(out[5], vertices[7], vertices[5], vertices[6]);
    return out;
}
function orthographic(out, left, right, bottom, top, near, far) {
    vec3.set(out[0], right, top, -near);
    vec3.set(out[1], left, top, -near);
    vec3.set(out[2], left, bottom, -near);
    vec3.set(out[3], right, bottom, -near);
    vec3.set(out[4], right, top, -far);
    vec3.set(out[5], left, top, -far);
    vec3.set(out[6], left, bottom, -far);
    vec3.set(out[7], right, bottom, -far);
    return out;
}
function perspective(out, fov, aspect, near, far) {
    const tanH = Math.tan(fov / 2);
    const tanW = tanH * aspect;
    const halfNearW = near * tanW;
    const halfNearH = near * tanH;
    const halfFarW = far * tanW;
    const halfFarH = far * tanH;
    vec3.set(out[0], halfNearW, halfNearH, -near);
    vec3.set(out[1], -halfNearW, halfNearH, -near);
    vec3.set(out[2], -halfNearW, -halfNearH, -near);
    vec3.set(out[3], halfNearW, -halfNearH, -near);
    vec3.set(out[4], halfFarW, halfFarH, -far);
    vec3.set(out[5], -halfFarW, halfFarH, -far);
    vec3.set(out[6], -halfFarW, -halfFarH, -far);
    vec3.set(out[7], halfFarW, -halfFarH, -far);
    return out;
}
function transform(out, a, m) {
    for (let i = 0; i < out.length; i++) {
        vec3.transformMat4(out[i], a[i], m);
    }
    return out;
}
function aabb_out(frustum, aabb) {
    for (const face of frustum) {
        if (plane.aabb(face, aabb) == -1) {
            return true;
        }
    }
    return false;
}
function aabb_in(frustum, aabb) {
    for (const face of frustum) {
        if (plane.aabb(face, aabb) != 0) {
            return false;
        }
    }
    return true;
}
export const frustum = {
    vertices,
    faces,
    toFaces,
    orthographic,
    perspective,
    transform,
    aabb_out,
    aabb_in
};
