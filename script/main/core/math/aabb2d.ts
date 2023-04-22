import vec2, { Vec2Like } from "./vec2.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();
const vec2_c = vec2.create();
const vec2_d = vec2.create();

export interface AABB2D {
    center: Vec2Like
    halfExtent: Vec2Like;
}

export default {
    toPoints(minPos: Vec2Like, maxPos: Vec2Like, a: Readonly<AABB2D>) {
        vec2.subtract(minPos, a.center, a.halfExtent);
        vec2.add(maxPos, a.center, a.halfExtent);
    },

    create(): AABB2D {
        return { center: vec2.create(), halfExtent: vec2.create() };
    },

    fromPoints(out: AABB2D, minPos: Vec2Like, maxPos: Vec2Like): AABB2D {
        vec2.add(vec2_a, maxPos, minPos);
        vec2.scale(vec2_a, vec2_a, 0.5);

        vec2.subtract(vec2_b, maxPos, minPos);
        vec2.scale(vec2_b, vec2_b, 0.5);

        this.set(out, vec2_a, vec2_b);
        return out;
    },

    set(out: AABB2D, center: Readonly<Vec2Like>, halfExtent: Readonly<Vec2Like>): AABB2D {
        vec2.copy(out.center, center)
        vec2.copy(out.halfExtent, halfExtent)
        return out;
    },

    merge(out: AABB2D, a: Readonly<AABB2D>, b: Readonly<AABB2D>): AABB2D {
        vec2.subtract(vec2_a, a.center, a.halfExtent);
        vec2.subtract(vec2_b, b.center, b.halfExtent);
        vec2.add(vec2_c, a.center, a.halfExtent);
        vec2.add(vec2_d, b.center, b.halfExtent);
        vec2.max(vec2_d, vec2_c, vec2_d);
        vec2.min(vec2_c, vec2_a, vec2_b);
        return this.fromPoints(out, vec2_c, vec2_d);
    },

    contains(a: Readonly<AABB2D>, point: Vec2Like) {
        this.toPoints(vec2_a, vec2_b, a);
        return (vec2_a[0] <= point[0]
            && vec2_b[0] >= point[0]
            && vec2_a[1] <= point[1]
            && vec2_b[1] >= point[1]);
    },

    copy(out: AABB2D, a: Readonly<AABB2D>) {
        vec2.copy(out.center, a.center)
        vec2.copy(out.halfExtent, a.halfExtent)
    }
}