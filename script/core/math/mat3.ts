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
     * @param view The view direction, it`s must be normalized.
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
    }
}