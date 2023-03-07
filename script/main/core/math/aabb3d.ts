import { AABB2D } from "./aabb2d.js";
import vec3, { Vec3 } from "./vec3.js";

const vec3_a = vec3.create();

export interface AABB3D extends AABB2D {
    originZ: number;
    extentZ: number;
}

export default {
    create(): AABB3D {
        return { originX: 0, originY: 0, originZ: 0, extentX: 0, extentY: 0, extentZ: 0 };
    },

    fromPoints(out: AABB3D, minPos: Vec3, maxPos: Vec3): AABB3D {
        vec3.subtract(vec3_a, maxPos, minPos);
        this.set(out, ...minPos, ...vec3_a);
        return out;
    },

    set(out: AABB3D, originX: number, originY: number, originZ: number, extentX: number, extentY: number, extentZ: number): AABB2D {
        out.originX = originX;
        out.originY = originY;
        out.originZ = originZ;

        out.extentX = extentX;
        out.extentY = extentY;
        out.extentZ = extentZ;
        return out;
    }
}