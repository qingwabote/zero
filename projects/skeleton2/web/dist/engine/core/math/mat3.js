import { vec3 } from "./vec3.js";
const vec3_a = vec3.create();
const vec3_b = vec3.create();
function set(out, m00, m01, m02, m03, m04, m05, m06, m07, m08) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m03;
    out[4] = m04;
    out[5] = m05;
    out[6] = m06;
    out[7] = m07;
    out[8] = m08;
    return out;
}
export const mat3 = {
    create() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    },
    set,
    identity(out) {
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
    determinant(a) {
        return a[0] * (a[8] * a[4] - a[5] * a[7]) + a[1] * (-a[8] * a[3] + a[5] * a[6]) + a[2] * (a[7] * a[3] - a[4] * a[6]);
    },
    fromYRotation(out, radian) {
        const s = Math.sin(radian);
        const c = Math.cos(radian);
        return set(out, c, 0, -s, 0, 1, 0, s, 0, c);
    },
    /**
     * @param view The view(z-axis) direction, it's must be normalized.
     * @param up The up direction, it's must be normalized, default value is (0, 1, 0).
     */
    fromViewUp(out, view, up = vec3.UP) {
        const EPSILON = 0.000001;
        if (vec3.lengthSqr(view) < EPSILON * EPSILON) {
            this.identity(out);
            return out;
        }
        const x = vec3_a;
        vec3.normalize(x, vec3.cross(x, up, view));
        if (vec3.lengthSqr(x) < EPSILON * EPSILON) {
            this.identity(out);
            return out;
        }
        const y = vec3_b;
        vec3.cross(y, view, x);
        set(out, ...x, ...y, view[0], view[1], view[2]);
        return out;
    },
    fromQuat(out, q) {
        const x = q[0];
        const y = q[1];
        const z = q[2];
        const w = q[3];
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
    multiplyMat4(out, a, b) {
        const a00 = a[0];
        const a01 = a[1];
        const a02 = a[2];
        const a10 = a[3];
        const a11 = a[4];
        const a12 = a[5];
        const a20 = a[6];
        const a21 = a[7];
        const a22 = a[8];
        const b00 = b[0];
        const b01 = b[1];
        const b02 = b[2];
        const b10 = b[4];
        const b11 = b[5];
        const b12 = b[6];
        const b20 = b[8];
        const b21 = b[9];
        const b22 = b[10];
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
};
