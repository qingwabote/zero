import { vec2 } from "./vec2.js";
const vec2_a = vec2.create();
const vec2_b = vec2.create();
const vec2_c = vec2.create();
const vec2_d = vec2.create();
export const aabb2d = {
    create() {
        return { center: vec2.create(), halfExtent: vec2.create() };
    },
    fromExtremes(out, min, max) {
        vec2.add(vec2_a, max, min);
        vec2.scale(vec2_a, vec2_a, 0.5);
        vec2.subtract(vec2_b, max, min);
        vec2.scale(vec2_b, vec2_b, 0.5);
        this.set(out, vec2_a, vec2_b);
        return out;
    },
    toExtremes(min, max, a) {
        vec2.subtract(min, a.center, a.halfExtent);
        vec2.add(max, a.center, a.halfExtent);
    },
    fromRect(out, offset, size) {
        vec2.add(vec2_a, offset, size);
        return aabb2d.fromExtremes(out, offset, vec2_a);
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
        return this.fromExtremes(out, vec2_c, vec2_d);
    },
    contains(a, point) {
        const min = vec2_a;
        const max = vec2_b;
        this.toExtremes(min, max, a);
        return !(point[0] > max[0] || point[0] < min[0] ||
            point[1] > max[1] || point[1] < min[1]);
    },
    copy(out, a) {
        vec2.copy(out.center, a.center);
        vec2.copy(out.halfExtent, a.halfExtent);
    }
};
