import { Mat3Like } from "./mat3.js";
import { Mat4Like } from "./mat4.js";
import { QuatLike } from "./quat.js";
import { Vec2Like } from "./vec2.js";

export type Vec3 = [number, number, number];

export interface Vec3Like extends Vec2Like {
    2: number;
}

function create(x: number = 0, y: number = 0, z: number = 0): Vec3 {
    return [x, y, z]
}

export const vec3 = {
    UNIT_X: Object.freeze(create(1, 0, 0)),
    UNIT_Y: Object.freeze(create(0, 1, 0)),
    UNIT_Z: Object.freeze(create(0, 0, 1)),

    ZERO: Object.freeze(create(0, 0, 0)),
    ONE: Object.freeze(create(1, 1, 1)),

    UP: Object.freeze(create(0, 1, 0)),
    FORWARD: Object.freeze(create(0, 0, -1)),

    create,

    set<Out extends Vec3Like>(out: Out, x: number, y: number, z: number) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out
    },

    copy<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    },

    normalize<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>) {
        const x = a[0];
        const y = a[1];
        const z = a[2];

        let len = x * x + y * y + z * z;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out[0] = x * len;
            out[1] = y * len;
            out[2] = z * len;
        }
        return out;
    },

    length(v: Vec3Like) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    },

    lengthSqr(v: Vec3Like) {
        return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    },

    transformMat3<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, m: Readonly<Mat3Like>) {
        const x = a[0];
        const y = a[1];
        const z = a[2];
        out[0] = x * m[0] + y * m[3] + z * m[6];
        out[1] = x * m[1] + y * m[4] + z * m[7];
        out[2] = x * m[2] + y * m[5] + z * m[8];
        return out;
    },

    transformMat4<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, m: Readonly<Mat4Like>) {
        const x = a[0];
        const y = a[1];
        const z = a[2];
        let rhw = m[3] * x + m[7] * y + m[11] * z + m[15];
        rhw = rhw ? Math.abs(1 / rhw) : 1;
        out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) * rhw;
        out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) * rhw;
        out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) * rhw;
        return out;
    },

    transformQuat<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, q: Readonly<QuatLike>) {
        // benchmarks: http://jsperf.com/quaternion-transform-Vec3-implementations

        // calculate quat * vec
        const ix = q[3] * a[0] + q[1] * a[2] - q[2] * a[1];
        const iy = q[3] * a[1] + q[2] * a[0] - q[0] * a[2];
        const iz = q[3] * a[2] + q[0] * a[1] - q[1] * a[0];
        const iw = -q[0] * a[0] - q[1] * a[1] - q[2] * a[2];

        // calculate result * inverse quat
        out[0] = ix * q[3] + iw * -q[0] + iy * -q[2] - iz * -q[1];
        out[1] = iy * q[3] + iw * -q[1] + iz * -q[0] - ix * -q[2];
        out[2] = iz * q[3] + iw * -q[2] + ix * -q[1] - iy * -q[0];
        return out;
    },

    add<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, b: Readonly<Vec3Like>) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    },

    subtract<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, b: Readonly<Vec3Like>) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    },

    multiply<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, b: Readonly<Vec3Like>) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    },

    scale<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, scale: number) {
        out[0] = a[0] * scale;
        out[1] = a[1] * scale;
        out[2] = a[2] * scale;
        return out;
    },

    dot(a: Readonly<Vec3Like>, b: Readonly<Vec3Like>): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },

    cross<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, b: Readonly<Vec3Like>) {
        out[0] = a[1] * b[2] - a[2] * b[1];
        out[1] = a[2] * b[0] - a[0] * b[2];
        out[2] = a[0] * b[1] - a[1] * b[0];
        return out;
    },

    negate<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    },

    min<Out extends Vec3Like>(out: Out, a: Vec3Like, b: Vec3Like) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    },

    max<Out extends Vec3Like>(out: Out, a: Vec3Like, b: Vec3Like) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    },

    equals(a: Vec3Like, b: Vec3Like, epsilon = 0.000001) {
        const [a0, a1, a2] = [a[0], a[1], a[2]];
        const [b0, b1, b2] = [b[0], b[1], b[2]];
        return (
            Math.abs(a0 - b0)
            <= epsilon * Math.max(1.0, Math.abs(a0), Math.abs(b0))
            && Math.abs(a1 - b1)
            <= epsilon * Math.max(1.0, Math.abs(a1), Math.abs(b1))
            && Math.abs(a2 - b2)
            <= epsilon * Math.max(1.0, Math.abs(a2), Math.abs(b2))
        );
    },

    distance(a: Readonly<Vec3Like>, b: Readonly<Vec3Like>): number {
        const x = b[0] - a[0];
        const y = b[1] - a[1];
        const z = b[2] - a[2];
        return Math.sqrt(x * x + y * y + z * z);
    },

    lerp<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, b: Readonly<Vec3Like>, t: number) {
        out[0] = a[0] + t * (b[0] - a[0]);
        out[1] = a[1] + t * (b[1] - a[1]);
        out[2] = a[2] + t * (b[2] - a[2]);
        return out;
    }
} as const