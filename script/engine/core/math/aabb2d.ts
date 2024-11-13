import { DeepReadonly } from "bastard";
import { vec2, Vec2Like } from "./vec2.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();
const vec2_c = vec2.create();
const vec2_d = vec2.create();

export interface AABB2D {
    center: Vec2Like
    halfExtent: Vec2Like;
}

export const aabb2d = {
    create(): AABB2D {
        return { center: vec2.create(), halfExtent: vec2.create() };
    },

    fromExtremes(out: AABB2D, min: Vec2Like, max: Vec2Like): AABB2D {
        vec2.add(vec2_a, max, min);
        vec2.scale(vec2_a, vec2_a, 0.5);

        vec2.subtract(vec2_b, max, min);
        vec2.scale(vec2_b, vec2_b, 0.5);

        this.set(out, vec2_a, vec2_b);
        return out;
    },

    toExtremes(min: Vec2Like, max: Vec2Like, a: DeepReadonly<AABB2D>) {
        vec2.subtract(min, a.center, a.halfExtent);
        vec2.add(max, a.center, a.halfExtent);
    },

    fromRect(out: AABB2D, offset: Vec2Like, size: Vec2Like): AABB2D {
        vec2.add(vec2_a, offset, size);
        return aabb2d.fromExtremes(out, offset, vec2_a);
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
        return this.fromExtremes(out, vec2_c, vec2_d);
    },

    contains(a: DeepReadonly<AABB2D>, point: Readonly<Vec2Like>) {
        const min = vec2_a;
        const max = vec2_b;
        this.toExtremes(min, max, a);
        return !(
            point[0] > max[0] || point[0] < min[0] ||
            point[1] > max[1] || point[1] < min[1]
        );
    },

    copy(out: AABB2D, a: Readonly<AABB2D>) {
        vec2.copy(out.center, a.center)
        vec2.copy(out.halfExtent, a.halfExtent)
    }
}