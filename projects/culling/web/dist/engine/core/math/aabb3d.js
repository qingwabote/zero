import { mat3 } from "./mat3.js";
import { vec3 } from "./vec3.js";
const vec3_a = vec3.create();
const vec3_b = vec3.create();
const mat3_a = mat3.create();
function create(center = vec3.ZERO, halfExtent = vec3.ZERO) {
    return { center: vec3.create(...center), halfExtent: vec3.create(...halfExtent) };
}
function set(out, center, halfExtent) {
    vec3.copy(out.center, center);
    vec3.copy(out.halfExtent, halfExtent);
    return out;
}
function fromPoints(out, minPos, maxPos) {
    vec3.add(vec3_a, maxPos, minPos);
    vec3.scale(vec3_a, vec3_a, 0.5);
    vec3.subtract(vec3_b, maxPos, minPos);
    vec3.scale(vec3_b, vec3_b, 0.5);
    set(out, vec3_a, vec3_b);
    return out;
}
function fromRect(out, offset, size) {
    vec3.add(vec3_a, offset, size);
    return fromPoints(out, offset, vec3_a);
}
// https://zeux.io/2010/10/17/aabb-from-obb-with-component-wise-abs/
function transform(out, a, m) {
    vec3.transformMat4(out.center, a.center, m);
    mat3_a[0] = Math.abs(m[0]);
    mat3_a[1] = Math.abs(m[1]);
    mat3_a[2] = Math.abs(m[2]);
    mat3_a[3] = Math.abs(m[4]);
    mat3_a[4] = Math.abs(m[5]);
    mat3_a[5] = Math.abs(m[6]);
    mat3_a[6] = Math.abs(m[8]);
    mat3_a[7] = Math.abs(m[9]);
    mat3_a[8] = Math.abs(m[10]);
    vec3.transformMat3(out.halfExtent, a.halfExtent, mat3_a);
    return out;
}
const ZERO = Object.freeze({ center: vec3.ZERO, halfExtent: vec3.ZERO });
export const aabb3d = { create, set, fromPoints, fromRect, transform, ZERO };
