import mat3, { Mat3Like } from "./mat3.js";
import vec3, { Vec3Like } from "./vec3.js";
import vec4, { Vec4, Vec4Like } from "./vec4.js";

const halfToRad = 0.5 * Math.PI / 180.0;

export type Quat = Vec4;

export type QuatLike = Vec4Like

export default {
    IDENTITY: [0, 0, 0, 1],

    create(x = 0, y = 0, z = 0, w = 1): Quat {
        return [x, y, z, w]
    },

    set: vec4.set,

    copy: vec4.copy,

    fromEuler<Out extends QuatLike>(out: Out, x: number, y: number, z: number) {
        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;

        const sx = Math.sin(x);
        const cx = Math.cos(x);
        const sy = Math.sin(y);
        const cy = Math.cos(y);
        const sz = Math.sin(z);
        const cz = Math.cos(z);

        out[0] = sx * cy * cz + cx * sy * sz;
        out[1] = cx * sy * cz + sx * cy * sz;
        out[2] = cx * cy * sz - sx * sy * cz;
        out[3] = cx * cy * cz - sx * sy * sz;

        return out;
    },

    toEuler<Out extends Vec3Like>(out: Out, q: Readonly<QuatLike>) {
        const [x, y, z, w] = [q[0], q[1], q[2], q[3]];
        let bank = 0;
        let heading = 0;
        let attitude = 0;
        const test = x * y + z * w;
        if (test > 0.499999) {
            bank = 0; // default to zero
            heading = 180.0 / Math.PI * 2 * Math.atan2(x, w);
            attitude = 90;
        } else if (test < -0.499999) {
            bank = 0; // default to zero
            heading = 180.0 / Math.PI * -2 * Math.atan2(x, w);
            attitude = -90;
        } else {
            const sqx = x * x;
            const sqy = y * y;
            const sqz = z * z;
            bank = 180.0 / Math.PI * Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz);
            heading = 180.0 / Math.PI * Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz);
            attitude = 180.0 / Math.PI * Math.asin(2 * test);
        }
        out[0] = bank; out[1] = heading; out[2] = attitude;
        return out;
    },

    /**
     * Calculates the quaternion with the three-dimensional transform matrix, considering no scale included in the matrix
     */
    fromMat3<Out extends QuatLike>(out: Out, m: Mat3Like) {
        const m00 = m[0];
        const m01 = m[3];
        const m02 = m[6];
        const m10 = m[1];
        const m11 = m[4];
        const m12 = m[7];
        const m20 = m[2];
        const m21 = m[5];
        const m22 = m[8];


        const trace = m00 + m11 + m22;

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);

            out[3] = 0.25 / s;
            out[0] = (m21 - m12) * s;
            out[1] = (m02 - m20) * s;
            out[2] = (m10 - m01) * s;
        } else if ((m00 > m11) && (m00 > m22)) {
            const s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);

            out[3] = (m21 - m12) / s;
            out[0] = 0.25 * s;
            out[1] = (m01 + m10) / s;
            out[2] = (m02 + m20) / s;
        } else if (m11 > m22) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);

            out[3] = (m02 - m20) / s;
            out[0] = (m01 + m10) / s;
            out[1] = 0.25 * s;
            out[2] = (m12 + m21) / s;
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);

            out[3] = (m10 - m01) / s;
            out[0] = (m02 + m20) / s;
            out[1] = (m12 + m21) / s;
            out[2] = 0.25 * s;
        }

        return out;
    },

    /**
     * @param view The view direction, it's must be normalized.
     */
    fromViewUp<Out extends QuatLike>(out: Out, view: Vec3Like) {
        const mat = mat3.fromViewUp(mat3.create(), view);
        return this.normalize(out, this.fromMat3(out, mat));
    },

    fromAxisAngle<Out extends QuatLike>(out: Out, axis: Readonly<Vec3Like>, rad: number) {
        rad *= 0.5;
        const s = Math.sin(rad);
        out[0] = s * axis[0];
        out[1] = s * axis[1];
        out[2] = s * axis[2];
        out[3] = Math.cos(rad);
        return out;
    },

    multiply<Out extends QuatLike>(out: Out, a: Readonly<QuatLike>, b: Readonly<QuatLike>) {
        const x = a[0] * b[3] + a[3] * b[0] + a[1] * b[2] - a[2] * b[1];
        const y = a[1] * b[3] + a[3] * b[1] + a[2] * b[0] - a[0] * b[2];
        const z = a[2] * b[3] + a[3] * b[2] + a[0] * b[1] - a[1] * b[0];
        const w = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    },

    invert<Out extends QuatLike>(out: Out, a: Readonly<QuatLike>) {
        const dot = a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3];
        const invDot = dot ? 1.0 / dot : 0;

        // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

        out[0] = -a[0] * invDot;
        out[1] = -a[1] * invDot;
        out[2] = -a[2] * invDot;
        out[3] = a[3] * invDot;
        return out;
    },

    conjugate<Out extends QuatLike>(out: Out, a: Readonly<QuatLike>) {
        out[0] = -a[0];
        out[1] = -a[1];
        out[2] = -a[2];
        out[3] = a[3];
        return out;
    },

    normalize<Out extends QuatLike>(out: Out, a: Readonly<QuatLike>) {
        let len = a[0] * a[0] + a[1] * a[1] + a[2] * a[2] + a[3] * a[3];
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            out[0] = a[0] * len;
            out[1] = a[1] * len;
            out[2] = a[2] * len;
            out[3] = a[3] * len;
        }
        return out;
    },

    /**
     * Sets the out quaternion with the shortest path orientation between two vectors, considering both vectors normalized
     */
    rotationTo<Out extends QuatLike>(out: Out, a: Readonly<Vec3Like>, b: Readonly<Vec3Like>) {
        const v3_1 = vec3.create();

        const dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(v3_1, vec3.UNIT_X, a);
            if (vec3.length(v3_1) < 0.000001) {
                vec3.cross(v3_1, vec3.UNIT_Y, a);
            }
            vec3.normalize(v3_1, v3_1);
            this.fromAxisAngle(out, v3_1, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3.cross(v3_1, a, b);
            out[0] = v3_1[0];
            out[1] = v3_1[1];
            out[2] = v3_1[2];
            out[3] = 1 + dot;
            return this.normalize(out, out);
        }
    },

    rotateX<Out extends QuatLike>(out: Out, a: Readonly<QuatLike>, rad: number) {
        rad *= 0.5;

        const bx = Math.sin(rad);
        const bw = Math.cos(rad);
        const [x, y, z, w] = [a[0], a[1], a[2], a[3]];

        out[0] = x * bw + w * bx;
        out[1] = y * bw + z * bx;
        out[2] = z * bw - y * bx;
        out[3] = w * bw - x * bx;
        return out;
    },

    rotateY<Out extends QuatLike>(out: Out, a: Readonly<QuatLike>, rad: number) {
        rad *= 0.5;

        const by = Math.sin(rad);
        const bw = Math.cos(rad);
        const [x, y, z, w] = [a[0], a[1], a[2], a[3]];

        out[0] = x * bw - z * by;
        out[1] = y * bw + w * by;
        out[2] = z * bw + x * by;
        out[3] = w * bw - y * by;
        return out;
    },

    lerp<Out extends QuatLike>(out: Out, a: Readonly<QuatLike>, b: Readonly<QuatLike>, t: number) {
        out[0] = a[0] + t * (b[0] - a[0]);
        out[1] = a[1] + t * (b[1] - a[1]);
        out[2] = a[2] + t * (b[2] - a[2]);
        out[3] = a[3] + t * (b[3] - a[3]);
        return out;
    },

    slerp<Out extends QuatLike>(out: Out, a: Readonly<QuatLike>, b: Readonly<QuatLike>, t: number) {
        // benchmarks:
        //    http://jsperf.com/quaternion-slerp-implementations

        let scale0 = 0;
        let scale1 = 0;
        let bx = b[0];
        let by = b[1];
        let bz = b[2];
        let bw = b[3];

        // calc cosine
        let cosom = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
        // adjust signs (if necessary)
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        // calculate coefficients
        if ((1.0 - cosom) > 0.000001) {
            // standard case (slerp)
            const omega = Math.acos(cosom);
            const sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        } else {
            // "from" and "to" quaternions are very close
            //  ... so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values
        out[0] = scale0 * a[0] + scale1 * bx;
        out[1] = scale0 * a[1] + scale1 * by;
        out[2] = scale0 * a[2] + scale1 * bz;
        out[3] = scale0 * a[3] + scale1 * bw;

        return out;
    }
} as const