import { vec2 } from "./vec2.js";
const vec2_a = vec2.create();
const vec2_b = vec2.create();
const vec2_c = vec2.create();
const vec2_d = vec2.create();
export const aabb2d = {
    toPoints(minPos, maxPos, a) {
        vec2.subtract(minPos, a.center, a.halfExtent);
        vec2.add(maxPos, a.center, a.halfExtent);
    },
    create() {
        return { center: vec2.create(), halfExtent: vec2.create() };
    },
    fromPoints(out, minPos, maxPos) {
        vec2.add(vec2_a, maxPos, minPos);
        vec2.scale(vec2_a, vec2_a, 0.5);
        vec2.subtract(vec2_b, maxPos, minPos);
        vec2.scale(vec2_b, vec2_b, 0.5);
        this.set(out, vec2_a, vec2_b);
        return out;
    },
    fromRect(out, offset, size) {
        vec2.add(vec2_a, offset, size);
        return aabb2d.fromPoints(out, offset, vec2_a);
    },
    set(out, center, halfExtent) {
        vec2.copy(out.center, center);
        vec2.copy(out.halfExtent, halfExtent);
        return out;
    },
    merge(out, a, b) {
        vec2.subtract(vec2_a, a.center, a.halfExtent);
        vec2.subtract(vec2_b, b.center, b.halfExtent);
        vec2.add(vec2_c, a.center, a.halfExtent);
        vec2.add(vec2_d, b.center, b.halfExtent);
        vec2.max(vec2_d, vec2_c, vec2_d);
        vec2.min(vec2_c, vec2_a, vec2_b);
        return this.fromPoints(out, vec2_c, vec2_d);
    },
    contains(a, point) {
        this.toPoints(vec2_a, vec2_b, a);
        return (vec2_a[0] <= point[0]
            && vec2_b[0] >= point[0]
            && vec2_a[1] <= point[1]
            && vec2_b[1] >= point[1]);
    },
    copy(out, a) {
        vec2.copy(out.center, a.center);
        vec2.copy(out.halfExtent, a.halfExtent);
    }
};
