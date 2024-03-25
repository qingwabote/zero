import { Plane, plane } from "./plane.js";
import { Vec3, vec3 } from "./vec3.js";

type FrustumVertices = [Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3, Vec3];
type FrustumPlanes = [Plane, Plane, Plane, Plane, Plane, Plane];

export interface Frustum {
    vertices: FrustumVertices;
    planes: FrustumPlanes;
}

function create(): Frustum {
    return {
        vertices: [vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create(), vec3.create()],
        planes: [plane.create(), plane.create(), plane.create(), plane.create(), plane.create(), plane.create()]
    }
}

function toPlanes(planes: FrustumPlanes, vertices: Readonly<FrustumVertices>) {
    // left plane
    plane.fromPoints(planes[0], vertices[1], vertices[6], vertices[5]);
    // right plane
    plane.fromPoints(planes[1], vertices[3], vertices[4], vertices[7]);
    // bottom plane
    plane.fromPoints(planes[2], vertices[6], vertices[3], vertices[7]);
    // top plane
    plane.fromPoints(planes[3], vertices[0], vertices[5], vertices[4]);
    // near plane
    plane.fromPoints(planes[4], vertices[2], vertices[0], vertices[3]);
    // far plane
    plane.fromPoints(planes[5], vertices[7], vertices[5], vertices[6]);
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

    toPlanes(out.planes, out.vertices);

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

    toPlanes(out.planes, out.vertices);

    return out;
}

export const frustum = {
    create,
    fromOrthographic,
    fromPerspective
} as const