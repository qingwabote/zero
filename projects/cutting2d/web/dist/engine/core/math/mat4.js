//right-handed
import { mat3 } from "./mat3.js";
import { quat } from "./quat.js";
const mat3_a = mat3.create();
function vec3_length(x, y, z) {
    return Math.sqrt(x * x + y * y + z * z);
}
export const preTransforms = Object.freeze([
    Object.freeze([1, 0, 0, 1]), // SurfaceTransform.IDENTITY
    Object.freeze([0, 1, -1, 0]), // SurfaceTransform.ROTATE_90
    Object.freeze([-1, 0, 0, -1]), // SurfaceTransform.ROTATE_180
    Object.freeze([0, -1, 1, 0]), // SurfaceTransform.ROTATE_270
]);
export const mat4 = {
    IDENTITY: [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ],
    create() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    fromTRS(out, t, r, s) {
        const x = r[0];
        const y = r[1];
        const z = r[2];
        const w = r[3];
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
    toTRS(m, t, r, s) {
        s[0] = vec3_length(m[0], m[1], m[2]);
        mat3_a[0] = m[0] / s[0];
        mat3_a[1] = m[1] / s[0];
        mat3_a[2] = m[2] / s[0];
        s[1] = vec3_length(m[4], m[5], m[6]);
        mat3_a[3] = m[4] / s[1];
        mat3_a[4] = m[5] / s[1];
        mat3_a[5] = m[6] / s[1];
        s[2] = vec3_length(m[8], m[9], m[10]);
        mat3_a[6] = m[8] / s[2];
        mat3_a[7] = m[9] / s[2];
        mat3_a[8] = m[10] / s[2];
        const det = mat3.determinant(mat3_a);
        if (det < 0) {
            s[0] *= -1;
            mat3_a[0] *= -1;
            mat3_a[1] *= -1;
            mat3_a[2] *= -1;
        }
        quat.fromMat3(r, mat3_a); // already normalized
        t[0] = m[12];
        t[1] = m[13];
        t[2] = m[14];
    },
    fromXRotation(radian) {
        const s = Math.sin(radian);
        const c = Math.cos(radian);
        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ];
    },
    fromYRotation(radian) {
        const s = Math.sin(radian);
        const c = Math.cos(radian);
        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ];
    },
    fromZRotation(radian) {
        const s = Math.sin(radian);
        const c = Math.cos(radian);
        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    fromTranslation(x, y, z) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ];
    },
    translate(out, a, v) {
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
        out[12] = a[12] + v[0];
        out[13] = a[13] + v[1];
        out[14] = a[14] + v[2];
        return out;
    },
    translate2(out, a, v) {
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
        out[12] = v[0];
        out[13] = v[1];
        out[14] = v[2];
        return out;
    },
    multiply(out, a, b) {
        let x = b[0];
        let y = b[1];
        let z = b[2];
        let w = b[3];
        out[0] = x * a[0] + y * a[4] + z * a[8] + w * a[12];
        out[1] = x * a[1] + y * a[5] + z * a[9] + w * a[13];
        out[2] = x * a[2] + y * a[6] + z * a[10] + w * a[14];
        out[3] = x * a[3] + y * a[7] + z * a[11] + w * a[15];
        x = b[4];
        y = b[5];
        z = b[6];
        w = b[7];
        out[4] = x * a[0] + y * a[4] + z * a[8] + w * a[12];
        out[5] = x * a[1] + y * a[5] + z * a[9] + w * a[13];
        out[6] = x * a[2] + y * a[6] + z * a[10] + w * a[14];
        out[7] = x * a[3] + y * a[7] + z * a[11] + w * a[15];
        x = b[8];
        y = b[9];
        z = b[10];
        w = b[11];
        out[8] = x * a[0] + y * a[4] + z * a[8] + w * a[12];
        out[9] = x * a[1] + y * a[5] + z * a[9] + w * a[13];
        out[10] = x * a[2] + y * a[6] + z * a[10] + w * a[14];
        out[11] = x * a[3] + y * a[7] + z * a[11] + w * a[15];
        x = b[12];
        y = b[13];
        z = b[14];
        w = b[15];
        out[12] = x * a[0] + y * a[4] + z * a[8] + w * a[12];
        out[13] = x * a[1] + y * a[5] + z * a[9] + w * a[13];
        out[14] = x * a[2] + y * a[6] + z * a[10] + w * a[14];
        out[15] = x * a[3] + y * a[7] + z * a[11] + w * a[15];
        return out;
    },
    multiply_affine(out, a, b) {
        let x = b[0];
        let y = b[1];
        let z = b[2];
        out[0] = x * a[0] + y * a[4] + z * a[8];
        out[1] = x * a[1] + y * a[5] + z * a[9];
        out[2] = x * a[2] + y * a[6] + z * a[10];
        x = b[4];
        y = b[5];
        z = b[6];
        out[4] = x * a[0] + y * a[4] + z * a[8];
        out[5] = x * a[1] + y * a[5] + z * a[9];
        out[6] = x * a[2] + y * a[6] + z * a[10];
        x = b[8];
        y = b[9];
        z = b[10];
        out[8] = x * a[0] + y * a[4] + z * a[8];
        out[9] = x * a[1] + y * a[5] + z * a[9];
        out[10] = x * a[2] + y * a[6] + z * a[10];
        x = b[12];
        y = b[13];
        z = b[14];
        out[12] = x * a[0] + y * a[4] + z * a[8] + a[12];
        out[13] = x * a[1] + y * a[5] + z * a[9] + a[13];
        out[14] = x * a[2] + y * a[6] + z * a[10] + a[14];
        return out;
    },
    orthographic(out, left, right, bottom, top, near, far, minClipZ) {
        var lr = 1 / (left - right);
        var bt = 1 / (bottom - top);
        var nf = 1 / (near - far);
        out[0] = -2 * lr;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = -2 * bt;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = nf * (1 - minClipZ);
        out[11] = 0;
        out[12] = (left + right) * lr;
        out[13] = (top + bottom) * bt;
        out[14] = (near - minClipZ * far) * nf;
        out[15] = 1;
        return out;
    },
    perspective(out, fov, aspect, near, far, minClipZ) {
        const isFOVY = true;
        const projectionSignY = 1;
        const orientation = 0;
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        const x = isFOVY ? f / aspect : f;
        const y = (isFOVY ? f : f * aspect) * projectionSignY;
        const preTransform = preTransforms[orientation];
        out[0] = x * preTransform[0];
        out[1] = x * preTransform[1];
        out[2] = 0;
        out[3] = 0;
        out[4] = y * preTransform[2];
        out[5] = y * preTransform[3];
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far - minClipZ * near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = far * near * nf * (1 - minClipZ);
        out[15] = 0;
        return out;
    },
    invert(out, a) {
        let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        let b00 = a00 * a11 - a01 * a10;
        let b01 = a00 * a12 - a02 * a10;
        let b02 = a00 * a13 - a03 * a10;
        let b03 = a01 * a12 - a02 * a11;
        let b04 = a01 * a13 - a03 * a11;
        let b05 = a02 * a13 - a03 * a12;
        let b06 = a20 * a31 - a21 * a30;
        let b07 = a20 * a32 - a22 * a30;
        let b08 = a20 * a33 - a23 * a30;
        let b09 = a21 * a32 - a22 * a31;
        let b10 = a21 * a33 - a23 * a31;
        let b11 = a22 * a33 - a23 * a32;
        // Calculate the determinant
        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = 0;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 0;
            out[11] = 0;
            out[12] = 0;
            out[13] = 0;
            out[14] = 0;
            out[15] = 0;
            return out;
            throw new Error("");
        }
        det = 1.0 / det;
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return out;
    }
};