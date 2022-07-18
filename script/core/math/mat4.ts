//right-handed

import { Quat } from "./quat.js";
import { Vec3 } from "./vec3.js";

export type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number
]


export default {
    create(): Mat4 {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    },

    fromRTS(out: Mat4, r: Readonly<Quat>, t: Readonly<Vec3>, s: Vec3) {
        const x = r[0]; const y = r[1]; const z = r[2]; const w = r[3];
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;
        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;
        const sx = s[0];
        const sy = s[1];
        const sz = s[2];

        out[0] = (1 - (yy + zz)) * sx;
        out[1] = (xy + wz) * sx;
        out[2] = (xz - wy) * sx;
        out[3] = 0;
        out[4] = (xy - wz) * sy;
        out[5] = (1 - (xx + zz)) * sy;
        out[6] = (yz + wx) * sy;
        out[7] = 0;
        out[8] = (xz + wy) * sz;
        out[9] = (yz - wx) * sz;
        out[10] = (1 - (xx + yy)) * sz;
        out[11] = 0;
        out[12] = t[0];
        out[13] = t[1];
        out[14] = t[2];
        out[15] = 1;

        return out;
    },

    fromXRotation(radian: number): Mat4 {
        const s = Math.sin(radian);
        const c = Math.cos(radian);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ];
    },

    fromYRotation(radian: number): Mat4 {
        const s = Math.sin(radian);
        const c = Math.cos(radian);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ];
    },

    fromZRotation(radian: number): Mat4 {
        const s = Math.sin(radian);
        const c = Math.cos(radian);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },

    fromTranslation(x: number, y: number, z: number): Mat4 {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]
    },

    translate(out: Mat4, a: Mat4, x: number, y: number, z: number): Mat4 {
        if (out != a) {
            out[0] = a[0];
            out[1] = a[1];
            out[2] = a[2];
            out[3] = a[3];
            out[4] = a[4];
            out[5] = a[5];
            out[6] = a[6];
            out[7] = a[7];
            out[8] = a[8];
            out[9] = a[9];
            out[10] = a[10];
            out[11] = a[11];

            out[15] = a[15];
        }

        out[12] += x;
        out[13] += y;
        out[14] += z;
        return out;
    },

    multiply(out: Mat4, a: Mat4, b: Mat4): Mat4 {
        let [x, y, z, w] = [b[0], b[1], b[2], b[3]];
        out[0] = x * a[0] + y * a[4] + z * a[8] + w * a[12];
        out[1] = x * a[1] + y * a[5] + z * a[9] + w * a[13];
        out[2] = x * a[2] + y * a[6] + z * a[10] + w * a[14];
        out[3] = x * a[3] + y * a[7] + z * a[11] + w * a[15];

        [x, y, z, w] = [b[4], b[5], b[6], b[7]];
        out[4] = x * a[0] + y * a[4] + z * a[8] + w * a[12];
        out[5] = x * a[1] + y * a[5] + z * a[9] + w * a[13];
        out[6] = x * a[2] + y * a[6] + z * a[10] + w * a[14];
        out[7] = x * a[3] + y * a[7] + z * a[11] + w * a[15];

        [x, y, z, w] = [b[8], b[9], b[10], b[11]];
        out[8] = x * a[0] + y * a[4] + z * a[8] + w * a[12];
        out[9] = x * a[1] + y * a[5] + z * a[9] + w * a[13];
        out[10] = x * a[2] + y * a[6] + z * a[10] + w * a[14];
        out[11] = x * a[3] + y * a[7] + z * a[11] + w * a[15];

        [x, y, z, w] = [b[12], b[13], b[14], b[15]];
        out[12] = x * a[0] + y * a[4] + z * a[8] + w * a[12];
        out[13] = x * a[1] + y * a[5] + z * a[9] + w * a[13];
        out[14] = x * a[2] + y * a[6] + z * a[10] + w * a[14];
        out[15] = x * a[3] + y * a[7] + z * a[11] + w * a[15];

        return out;
    }
}