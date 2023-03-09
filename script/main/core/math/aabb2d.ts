import vec2, { Vec2 } from "./vec2.js";

const vec2_a = vec2.create();
const vec2_b = vec2.create();

export interface AABB2D {
    centerX: number;
    centerY: number;

    halfExtentX: number;
    halfExtentY: number;
}

export default {
    create(): AABB2D {
        return { centerX: 0, centerY: 0, halfExtentX: 0, halfExtentY: 0 };
    },

    fromPoints(out: AABB2D, minPos: Vec2, maxPos: Vec2): AABB2D {
        vec2.add(vec2_a, maxPos, minPos);
        vec2.scale(vec2_a, vec2_a, 0.5);

        vec2.subtract(vec2_b, maxPos, minPos);
        vec2.scale(vec2_b, vec2_b, 0.5);

        this.set(out, ...vec2_a, ...vec2_b);
        return out;
    },

    set(out: AABB2D, centerX: number, centerY: number, halfExtentX: number, halfExtentY: number): AABB2D {
        out.centerX = centerX;
        out.centerY = centerY;
        out.halfExtentX = halfExtentX;
        out.halfExtentY = halfExtentY;
        return out;
    }
}