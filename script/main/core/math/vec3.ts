import { Mat4 } from "./mat4.js";
import { Quat } from "./quat.js";

export type Vec3 = {
    0: number; 1: number; 2: number;
    readonly length: 3;
    [Symbol.iterator](): IterableIterator<number>;
}

export default {
    UNIT_X: [1, 0, 0],
    UNIT_Y: [0, 1, 0],
    UNIT_Z: [0, 0, 1],

    ZERO: [0, 0, 0],

    UP: [0, 1, 0],
    FORWARD: [0, 0, -1],

    create(x: number = 0, y: number = 0, z: number = 0): Vec3 {
        return [x, y, z]
    },

    set(out: Vec3, x: number, y: number, z: number): Vec3 {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out
    },

    normalize(out: Vec3, a: Readonly<Vec3>) {
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

    length(v: Vec3) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    },

    lengthSqr(v: Vec3) {
        return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    },

    transformMat4(out: Vec3, a: Readonly<Vec3>, m: Readonly<Mat4>): Vec3 {
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

    transformQuat(out: Vec3, a: Readonly<Vec3>, q: Readonly<Quat>) {
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

    add(out: Vec3, a: Readonly<Vec3>, b: Readonly<Vec3>) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    },

    subtract(out: Vec3, a: Readonly<Vec3>, b: Readonly<Vec3>) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    },

    multiply(out: Vec3, a: Readonly<Vec3>, b: Readonly<Vec3>) {
        out[0] = a[0] * b[0];
        out[1] = a[1] * b[1];
        out[2] = a[2] * b[2];
        return out;
    },

    scale(out: Vec3, a: Readonly<Vec3>, scale: number) {
        out[0] = a[0] * scale;
        out[1] = a[1] * scale;
        out[2] = a[2] * scale;
        return out;
    },

    dot(a: Readonly<Vec3>, b: Readonly<Vec3>): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },

    cross(out: Vec3, a: Readonly<Vec3>, b: Readonly<Vec3>) {
        const [ax, ay, az] = a;
        const [bx, by, bz] = b;
        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
    },

    negate(out: Vec3, a: Readonly<Vec3>) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    },

    min(out: Vec3, a: Vec3, b: Vec3) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    },

    max(out: Vec3, a: Vec3, b: Vec3) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    },

    equals(a: Vec3, b: Vec3, epsilon = 0.000001) {
        const [a0, a1, a2] = a;
        const [b0, b1, b2] = b;
        return (
            Math.abs(a0 - b0)
            <= epsilon * Math.max(1.0, Math.abs(a0), Math.abs(b0))
            && Math.abs(a1 - b1)
            <= epsilon * Math.max(1.0, Math.abs(a1), Math.abs(b1))
            && Math.abs(a2 - b2)
            <= epsilon * Math.max(1.0, Math.abs(a2), Math.abs(b2))
        );
    },

    lerp(out: Vec3, a: Readonly<Vec3>, b: Readonly<Vec3>, t: number) {
        out[0] = a[0] + t * (b[0] - a[0]);
        out[1] = a[1] + t * (b[1] - a[1]);
        out[2] = a[2] + t * (b[2] - a[2]);
        return out;
    }
} as const