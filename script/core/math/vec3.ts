import { Mat4 } from "./mat4.js";

export type Vec3 = [number, number, number];

export default {
    create(): Vec3 {
        return [0, 0, 0]
    },

    length(v: Vec3) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
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
    }
}