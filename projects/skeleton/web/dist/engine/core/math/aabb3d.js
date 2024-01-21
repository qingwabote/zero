import { vec3 } from "./vec3.js";
const vec3_a = vec3.create();
const vec3_b = vec3.create();
export const aabb3d = {
    create() {
        return { center: vec3.create(), halfExtent: vec3.create() };
    },
    fromPoints(out, minPos, maxPos) {
        vec3.add(vec3_a, maxPos, minPos);
        vec3.scale(vec3_a, vec3_a, 0.5);
        vec3.subtract(vec3_b, maxPos, minPos);
        vec3.scale(vec3_b, vec3_b, 0.5);
        this.set(out, vec3_a, vec3_b);
        return out;
    },
    set(out, center, halfExtent) {
        vec3.copy(out.center, center);
        vec3.copy(out.halfExtent, halfExtent);
        return out;
    }
};
