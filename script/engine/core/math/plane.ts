import { Vec3, vec3 } from "./vec3.js";

export interface Plane {
    normal: Vec3
    distance: number
}

function create(): Plane {
    return { normal: vec3.create(), distance: 0 }
}

const vec3_a = vec3.create();
const vec3_b = vec3.create();

function fromPoints(out: Plane, a: Readonly<Vec3>, b: Readonly<Vec3>, c: Readonly<Vec3>) {
    vec3.subtract(vec3_a, b, a);
    vec3.subtract(vec3_b, c, a);

    vec3.normalize(out.normal, vec3.cross(out.normal, vec3_a, vec3_b));
    out.distance = vec3.dot(out.normal, a);

    return out;
}

export const plane = {
    create,
    fromPoints
} as const