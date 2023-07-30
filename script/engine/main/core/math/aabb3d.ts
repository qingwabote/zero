import { AABB2D } from "./aabb2d.js";
import { vec3, Vec3Like } from "./vec3.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();

export interface AABB3D extends AABB2D {
    center: Vec3Like;
    halfExtent: Vec3Like;
}

export const aabb3d = {
    create(): AABB3D {
        return { center: vec3.create(), halfExtent: vec3.create() };
    },

    fromPoints(out: AABB3D, minPos: Vec3Like, maxPos: Vec3Like): AABB3D {
        vec3.add(vec3_a, maxPos, minPos);
        vec3.scale(vec3_a, vec3_a, 0.5);

        vec3.subtract(vec3_b, maxPos, minPos);
        vec3.scale(vec3_b, vec3_b, 0.5);

        this.set(out, vec3_a, vec3_b);
        return out;
    },

    set(out: AABB3D, center: Readonly<Vec3Like>, halfExtent: Readonly<Vec3Like>): AABB2D {
        vec3.copy(out.center, center)
        vec3.copy(out.halfExtent, halfExtent)
        return out;
    }
}