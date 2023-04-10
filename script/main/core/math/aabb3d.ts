import { AABB2D } from "./aabb2d.js";
import vec3, { Vec3Like } from "./vec3.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

export interface AABB3D extends AABB2D {
    centerZ: number;
    halfExtentZ: number;
}

export default {
    create(): AABB3D {
        return { centerX: 0, centerY: 0, centerZ: 0, halfExtentX: 0, halfExtentY: 0, halfExtentZ: 0 };
    },

    fromPoints(out: AABB3D, minPos: Vec3Like, maxPos: Vec3Like): AABB3D {
        vec3.add(vec3_a, maxPos, minPos);
        vec3.scale(vec3_a, vec3_a, 0.5);

        vec3.subtract(vec3_b, maxPos, minPos);
        vec3.scale(vec3_b, vec3_b, 0.5);

        this.set(out, ...vec3_a, ...vec3_b);
        return out;
    },

    set(out: AABB3D, centerX: number, centerY: number, centerZ: number, halfExtentX: number, halfExtentY: number, halfExtentZ: number): AABB2D {
        out.centerX = centerX;
        out.centerY = centerY;
        out.centerZ = centerZ;

        out.halfExtentX = halfExtentX;
        out.halfExtentY = halfExtentY;
        out.halfExtentZ = halfExtentZ;
        return out;
    }
}