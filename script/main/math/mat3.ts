import { Mat4 } from "./mat4.js";
import { Quat } from "./quat.js";
import vec3, { Vec3 } from "./vec3.js";

export type Mat3 = [
    number, number, number,
    number, number, number,
    number, number, number
]

export default {
    create(): Mat3 {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]
    },

    identity(out: Mat3) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 1;
        out[5] = 0;
        out[6] = 0;
        out[7] = 0;
        out[8] = 1;
        return out;
    },

    determinant(a: Mat3) {
        const a00 = a[0]; const a01 = a[1]; const a02 = a[2];
        const a10 = a[3]; const a11 = a[4]; const a12 = a[5];
        const a20 = a[6]; const a21 = a[7]; const a22 = a[8];

        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    },

    /**
     * @param view The view direction, it's must be normalized.
     */
    fromViewUp(out: Mat3, view: Vec3) {
        const EPSILON = 0.000001;

        if (vec3.lengthSqr(view) < EPSILON * EPSILON) {
            this.identity(out);
            return out;
        }

        const up = vec3.create(0, 1, 0);
        const v3_1 = vec3.create();
        vec3.normalize(v3_1, vec3.cross(v3_1, up, view));

        if (vec3.lengthSqr(v3_1) < EPSILON * EPSILON) {
            this.identity(out);
            return out;
        }

        const v3_2 = vec3.create();
        vec3.cross(v3_2, view, v3_1);

        out = [
            v3_1[0], v3_1[1], v3_1[2],
            v3_2[0], v3_2[1], v3_2[2],
            view[0], view[1], view[2],
        ]

        return out;
    },

    fromQuat(out: Mat3, q: Quat) {
        const x = q[0]; const y = q[1]; const z = q[2]; const w = q[3];
        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const yx = y * x2;
        const yy = y * y2;
        const zx = z * x2;
        const zy = z * y2;
        const zz = z * z2;
        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        out[0] = 1 - yy - zz;
        out[3] = yx - wz;
        out[6] = zx + wy;

        out[1] = yx + wz;
        out[4] = 1 - xx - zz;
        out[7] = zy - wx;

        out[2] = zx - wy;
        out[5] = zy + wx;
        out[8] = 1 - xx - yy;

        return out;
    },

    multiplyMat4(out: Mat3, a: Mat3, b: Mat4) {
        const a00 = a[0]; const a01 = a[1]; const a02 = a[2];
        const a10 = a[3]; const a11 = a[4]; const a12 = a[5];
        const a20 = a[6]; const a21 = a[7]; const a22 = a[8];

        const b00 = b[0]; const b01 = b[1]; const b02 = b[2];
        const b10 = b[4]; const b11 = b[5]; const b12 = b[6];
        const b20 = b[8]; const b21 = b[9]; const b22 = b[10];

        out[0] = b00 * a00 + b01 * a10 + b02 * a20;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22;

        out[3] = b10 * a00 + b11 * a10 + b12 * a20;
        out[4] = b10 * a01 + b11 * a11 + b12 * a21;
        out[5] = b10 * a02 + b11 * a12 + b12 * a22;

        out[6] = b20 * a00 + b21 * a10 + b22 * a20;
        out[7] = b20 * a01 + b21 * a11 + b22 * a21;
        out[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }
} as const