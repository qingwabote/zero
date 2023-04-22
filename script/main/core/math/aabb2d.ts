import vec2, { Vec2Like } from "./vec2.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();

export interface AABB2D {
    center: Vec2Like
    halfExtent: Vec2Like;
}

export default {
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
    }
}