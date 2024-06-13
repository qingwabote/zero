import { AABB3D } from "./aabb3d.js";
import { Mat4 } from "./mat4.js";
import { Plane, plane } from "./plane.js";
import { Vec3, vec3 } from "./vec3.js";

export namespace frustum {
    export type Vertices = [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3];
    export type Faces = [Plane, Plane, Plane, Plane, Plane, Plane];

    export function vertices(): Vertices {
        return [vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create()];
    }

    export function faces(): Faces {
        return [plane.create(), plane.create(), plane.create(), plane.create(), plane.create(), plane.create()];
    }

    /**
     * 
     * The normal of plane points inwards
     */
    export function toFaces(out: Faces, vertices: Readonly<Vertices>) {
        // left 
        plane.fromPoints(out[0], vertices[1], vertices[6], vertices[5]);
        // right 
        plane.fromPoints(out[1], vertices[3], vertices[4], vertices[7]);
        // bottom 
        plane.fromPoints(out[2], vertices[6], vertices[3], vertices[7]);
        // top 
        plane.fromPoints(out[3], vertices[0], vertices[5], vertices[4]);
        // near 
        plane.fromPoints(out[4], vertices[2], vertices[0], vertices[3]);
        // far 
        plane.fromPoints(out[5], vertices[7], vertices[5], vertices[6]);

        return out;
    }

    export function orthographic(out: Vertices, left: number, right: number, bottom: number, top: number, near: number, far: number) {
        vec3.set(out[0], right, top, - near);
        vec3.set(out[1], left, top, - near);
        vec3.set(out[2], left, bottom, - near);
        vec3.set(out[3], right, bottom, - near);

        vec3.set(out[4], right, top, -far);
        vec3.set(out[5], left, top, -far);
        vec3.set(out[6], left, bottom, -far);
        vec3.set(out[7], right, bottom, -far);

        return out;
    }

    export function perspective(out: Vertices, fov: number, aspect: number, near: number, far: number) {
        const tanH = Math.tan(fov / 2);
        const tanW = tanH * aspect;

        const halfNearW = near * tanW;
        const halfNearH = near * tanH;

        const halfFarW = far * tanW;
        const halfFarH = far * tanH;

        vec3.set(out[0], halfNearW, halfNearH, - near);
        vec3.set(out[1], -halfNearW, halfNearH, - near);
        vec3.set(out[2], -halfNearW, -halfNearH, - near);
        vec3.set(out[3], halfNearW, -halfNearH, - near);

        vec3.set(out[4], halfFarW, halfFarH, -far);
        vec3.set(out[5], -halfFarW, halfFarH, -far);
        vec3.set(out[6], -halfFarW, -halfFarH, -far);
        vec3.set(out[7], halfFarW, -halfFarH, -far);

        return out;
    }

    export function transform(out: Vertices, a: Readonly<Vertices>, m: Readonly<Mat4>) {
        for (let i = 0; i < out.length; i++) {
            vec3.transformMat4(out[i], a[i], m);
        }
        return out;
    }

    export function aabb_out(frustum: Readonly<Faces>, aabb: Readonly<AABB3D>): boolean {
        for (const face of frustum) {
            if (plane.aabb(face, aabb) == -1) {
                return true;
            }
        }
        return false;
    }

    export function aabb_in(frustum: Readonly<Faces>, aabb: Readonly<AABB3D>): boolean {
        for (const face of frustum) {
            if (plane.aabb(face, aabb) != 0) {
                return false;
            }
        }
        return true;
    }
}