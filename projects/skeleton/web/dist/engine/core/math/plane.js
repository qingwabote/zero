import { vec3 } from "./vec3.js";
function create() {
    return { normal: vec3.create(), distance: 0 };
}
const vec3_a = vec3.create();
const vec3_b = vec3.create();
function fromPoints(out, a, b, c) {
    vec3.subtract(vec3_a, b, a);
    vec3.subtract(vec3_b, c, a);
    vec3.normalize(out.normal, vec3.cross(out.normal, vec3_a, vec3_b));
    out.distance = vec3.dot(out.normal, a);
    return out;
}
/**
 *
 * @returns back -1, front 0, intersect 1
 */
function aabb(plane, aabb) {
    const r = aabb.halfExtent[0] * Math.abs(plane.normal[0])
        + aabb.halfExtent[1] * Math.abs(plane.normal[1])
        + aabb.halfExtent[2] * Math.abs(plane.normal[2]);
    const dot = vec3.dot(plane.normal, aabb.center);
    if (dot + r < plane.distance) {
        return -1;
    }
    else if (dot - r > plane.distance) {
        return 0;
    }
    return 1;
}
export const plane = {
    create,
    fromPoints,
    aabb
};
