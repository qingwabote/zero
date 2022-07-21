import { Mat3 } from "./mat3.js";
import { Vec3 } from "./vec3.js";

const halfToRad = 0.5 * Math.PI / 180.0;

export type Quat = [number, number, number, number]

export default {
    create(): Quat {
        return [0, 0, 0, 1]
    },

    fromEuler(out: Quat, x: number, y: number, z: number): Quat {
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

    toEuler(out: Vec3, q: Quat): Vec3 {
        const [x, y, z, w] = q;
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

    fromMat3(out: Quat, m: Mat3) {
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
    }
}