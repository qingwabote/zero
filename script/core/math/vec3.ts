import { Mat4 } from "./mat4.js";
import { Quat } from "./quat.js";

export type Vec3 = [number, number, number];

export default {
    UNIT_X: [1, 0, 0],
    UNIT_Y: [0, 1, 0],

    ZERO: [0, 0, 0],

    create(x: number = 0, y: number = 0, z: number = 0): Vec3 {
        return [x, y, z]
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

    transformQuat(out: Vec3, a: Vec3, q: Quat) {
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

    dot(a: Readonly<Vec3>, b: Readonly<Vec3>): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },

    cross(out: Vec3, a: Readonly<Vec3>, b: Readonly<Vec3>) {
        out[0] = a[1] * b[2] - a[2] * b[1];
        out[1] = a[2] * b[0] - a[0] * b[2];
        out[2] = a[0] * b[1] - a[1] * b[0];
        return out;
    },

    negate(out: Vec3, a: Readonly<Vec3>) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        return out;
    },

    // copy(out: Vec3, a: Readonly<Vec3>) {
    //     out[0] = a[0];
    //     out[1] = a[1];
    //     out[2] = a[2];
    //     return out;
    // },
} as const