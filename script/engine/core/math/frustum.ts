import { AABB3D } from "./aabb3d.js";
import { Mat4 } from "./mat4.js";
import { Plane, plane } from "./plane.js";
import { Vec3, vec3 } from "./vec3.js";

type FrustumVertices = [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3];
type FrustumFaces = [Plane, Plane, Plane, Plane, Plane, Plane];

export interface Frustum {
    vertices: FrustumVertices;
    faces: FrustumFaces;
}

function create(): Frustum {
    return {
        vertices: [vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create()],
        faces: [plane.create(), plane.create(), plane.create(), plane.create(), plane.create(), plane.create()]
    }
}

/**
 * 
 * The normal of plane points inwards
 */
function toFaces(faces: FrustumFaces, vertices: Readonly<FrustumVertices>) {
    // left 
    plane.fromPoints(faces[0], vertices[1], vertices[6], vertices[5]);
    // right 
    plane.fromPoints(faces[1], vertices[3], vertices[4], vertices[7]);
    // bottom 
    plane.fromPoints(faces[2], vertices[6], vertices[3], vertices[7]);
    // top 
    plane.fromPoints(faces[3], vertices[0], vertices[5], vertices[4]);
    // near 
    plane.fromPoints(faces[4], vertices[2], vertices[0], vertices[3]);
    // far 
    plane.fromPoints(faces[5], vertices[7], vertices[5], vertices[6]);
}

function fromOrthographic(out: Frustum, orthoSize: number, aspect: number, near: number, far: number): Frustum {
    const halfH = orthoSize;
    const halfW = halfH * aspect;

    vec3.set(out.vertices[0], halfW, halfH, - near);
    vec3.set(out.vertices[1], -halfW, halfH, - near);
    vec3.set(out.vertices[2], -halfW, -halfH, - near);
    vec3.set(out.vertices[3], halfW, -halfH, - near);

    vec3.set(out.vertices[4], halfW, halfH, -far);
    vec3.set(out.vertices[5], -halfW, halfH, -far);
    vec3.set(out.vertices[6], -halfW, -halfH, -far);
    vec3.set(out.vertices[7], halfW, -halfH, -far);

    toFaces(out.faces, out.vertices);

    return out;
}

function fromPerspective(out: Frustum, fov: number, aspect: number, near: number, far: number): Frustum {
    const tanH = Math.tan(fov / 2);
    const tanW = tanH * aspect;

    const halfNearW = near * tanW;
    const halfNearH = near * tanH;

    const halfFarW = far * tanW;
    const halfFarH = far * tanH;

    vec3.set(out.vertices[0], halfNearW, halfNearH, - near);
    vec3.set(out.vertices[1], -halfNearW, halfNearH, - near);
    vec3.set(out.vertices[2], -halfNearW, -halfNearH, - near);
    vec3.set(out.vertices[3], halfNearW, -halfNearH, - near);

    vec3.set(out.vertices[4], halfFarW, halfFarH, -far);
    vec3.set(out.vertices[5], -halfFarW, halfFarH, -far);
    vec3.set(out.vertices[6], -halfFarW, -halfFarH, -far);
    vec3.set(out.vertices[7], halfFarW, -halfFarH, -far);

    toFaces(out.faces, out.vertices);

    return out;
}
function transform(out: Frustum, a: Readonly<Frustum>, m: Readonly<Mat4>) {
    for (let i = 0; i < out.vertices.length; i++) {
        vec3.transformMat4(out.vertices[i], a.vertices[i], m);
    }
    toFaces(out.faces, out.vertices);
    return out;
}

function aabb(frustum: Readonly<Frustum>, aabb: Readonly<AABB3D>): number {
    for (const face of frustum.faces) {
        if (plane.aabb(face, aabb) == -1) {
            return 0;
        }
    }
    return 1
}

export const frustum = {
    create,
    fromOrthographic,
    fromPerspective,
    transform,
    aabb
} as const