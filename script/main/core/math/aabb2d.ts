import vec3 from "./vec3.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

export interface AABB2D {
    originX: number;
    originY: number;

    extentX: number;
    extentY: number;
}

export default {
    create(): AABB2D {
        return { originX: 0, originY: 0, extentX: 0, extentY: 0 };
    },

    set(out: AABB2D, originX: number, originY: number, extentX: number, extentY: number): AABB2D {
        out.originX = originX;
        out.originY = originY;
        out.extentX = extentX;
        out.extentY = extentY;
        return out;
    }

    // fromPoints(out: AABB, minPos: Vec3, maxPos: Vec3): AABB {
    //     vec3.add(vec3_a, maxPos, minPos);
    //     vec3.subtract(vec3_b, maxPos, minPos);
    //     vec3.scale(out.center, vec3_a, 0.5);
    //     vec3.scale(out.halfExtents, vec3_b, 0.5);
    //     return out;
    // }
}