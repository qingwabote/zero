import vec3, { Vec3 } from "./vec3.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

export type AABB = {
    center: Vec3;
    halfExtents: Vec3;
}

export default {
    create(): AABB {
        return { center: vec3.create(), halfExtents: vec3.create() };
    },

    fromPoints(out: AABB, minPos: Vec3, maxPos: Vec3): AABB {
        vec3.add(vec3_a, maxPos, minPos);
        vec3.subtract(vec3_b, maxPos, minPos);
        vec3.scale(out.center, vec3_a, 0.5);
        vec3.scale(out.halfExtents, vec3_b, 0.5);
        return out;
    }
}