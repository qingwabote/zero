import { AABB2D } from "./aabb2d.js";
import { mat3 } from "./mat3.js";
import { Mat4Like } from "./mat4.js";
import { Vec3, Vec3Like, vec3 } from "./vec3.js";

export interface AABB3D extends AABB2D {
    center: Vec3Like;
    halfExtent: Vec3Like;
}

const vec3_a = vec3.create();
const vec3_b = vec3.create();

const mat3_a = mat3.create();

const vec3_half: Readonly<Vec3> = vec3.create(0.5, 0.5, 0.5);

function create(center = vec3.ZERO, halfExtent = vec3.ZERO) {
    return { center: vec3.create(...center), halfExtent: vec3.create(...halfExtent) };
}

function set(out: AABB3D, center: Readonly<Vec3Like>, halfExtent: Readonly<Vec3Like>) {
    vec3.copy(out.center, center)
    vec3.copy(out.halfExtent, halfExtent)
    return out;
}

function fromExtremes(out: AABB3D, min: Readonly<Vec3Like>, max: Readonly<Vec3Like>) {
    vec3.add(vec3_a, max, min);
    vec3.multiply(vec3_a, vec3_a, vec3_half);

    vec3.subtract(vec3_b, max, min);
    vec3.multiply(vec3_b, vec3_b, vec3_half);

    set(out, vec3_a, vec3_b);
    return out;
}

function toExtremes(min: Vec3Like, max: Vec3Like, a: Readonly<AABB3D>) {
    vec3.subtract(min, a.center, a.halfExtent);
    vec3.add(max, a.center, a.halfExtent);
}

// https://zeux.io/2010/10/17/aabb-from-obb-with-component-wise-abs/
function transform(out: AABB3D, a: Readonly<AABB3D>, m: Readonly<Mat4Like>) {
    vec3.transformMat4(out.center, a.center, m);

    mat3_a[0] = Math.abs(m[0]);
    mat3_a[1] = Math.abs(m[1]);
    mat3_a[2] = Math.abs(m[2]);

    mat3_a[3] = Math.abs(m[4]);
    mat3_a[4] = Math.abs(m[5]);
    mat3_a[5] = Math.abs(m[6]);

    mat3_a[6] = Math.abs(m[8]);
    mat3_a[7] = Math.abs(m[9]);
    mat3_a[8] = Math.abs(m[10]);

    vec3.transformMat3(out.halfExtent, a.halfExtent, mat3_a);

    return out;
}

const vec3_c = vec3.create();
const vec3_d = vec3.create();

function fromPoints(out: AABB3D, points: readonly Readonly<Vec3Like>[]) {
    vec3.extremes(vec3_c, vec3_d, points);
    fromExtremes(out, vec3_c, vec3_d);
    return out;
}

function fromRect(out: AABB3D, offset: Vec3Like, size: Vec3Like) {
    vec3.add(vec3_c, offset, size);
    return fromExtremes(out, offset, vec3_c);
}

function contains(a: Readonly<AABB3D>, point: Vec3Like) {
    const min = vec3_a;
    const max = vec3_b;
    toExtremes(min, max, a);
    return !(
        point[0] > max[0] || point[0] < min[0] ||
        point[1] > max[1] || point[1] < min[1] ||
        point[2] > max[2] || point[2] < min[2]
    );
}

const ZERO: Readonly<AABB3D> = { center: vec3.ZERO, halfExtent: vec3.ZERO }

export const aabb3d = { ZERO, create, set, fromExtremes, toExtremes, fromPoints, fromRect, transform, contains } as const