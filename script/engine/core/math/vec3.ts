import { Mat3Like } from "./mat3.js";
import { Mat4Like } from "./mat4.js";
import { QuatLike } from "./quat.js";

type V3 = [number, number, number];

export interface Vec3 {
    0: number,
    1: number,
    2: number,
    [n: number]: number;
    length: 3;
    [Symbol.iterator](): Iterator<number>;
}

export interface Vec3Like {
    0: number,
    1: number,
    2: number,
};

function create(x: number = 0, y: number = 0, z: number = 0): V3 {
    return [x, y, z]
}

export const vec3 = {
    UNIT_X: create(1, 0, 0) as Readonly<Vec3>,
    UNIT_Y: create(0, 1, 0) as Readonly<Vec3>,
    UNIT_Z: create(0, 0, 1) as Readonly<Vec3>,

    ZERO: create(0, 0, 0) as Readonly<Vec3>,
    ONE: create(1, 1, 1) as Readonly<Vec3>,

    UP: create(0, 1, 0) as Readonly<Vec3>,
    FORWARD: create(0, 0, -1) as Readonly<Vec3>,

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

    divide<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, b: Readonly<Vec3Like>) {
        out[0] = a[0] / b[0];
        out[1] = a[1] / b[1];
        out[2] = a[2] / b[2];
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

    min<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, b: Readonly<Vec3Like>) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    },

    max<Out extends Vec3Like>(out: Out, a: Readonly<Vec3Like>, b: Readonly<Vec3Like>) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    },

    extremes(min: Vec3Like, max: Vec3Like, points: readonly Readonly<Vec3Like>[]) {
        vec3.set(min, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        vec3.set(max, Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE);
        for (const point of points) {
            vec3.min(min, min, point);
            vec3.max(max, max, point);
        }
    },

    equals(a: Readonly<Vec3Like>, b: Readonly<Vec3Like>, epsilon = 0.000001) {
        return (
            Math.abs(a[0] - b[0])
            <= epsilon * Math.max(1.0, Math.abs(a[0]), Math.abs(b[0]))
            && Math.abs(a[1] - b[1])
            <= epsilon * Math.max(1.0, Math.abs(a[1]), Math.abs(b[1]))
            && Math.abs(a[2] - b[2])
            <= epsilon * Math.max(1.0, Math.abs(a[2]), Math.abs(b[2]))
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