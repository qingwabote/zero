import { Mat4 } from "./mat4.js";

export type Vec2 = [number, number];

export default {
    ZERO: [0, 0],

    create(x: number = 0, y: number = 0): Vec2 {
        return [x, y];
    },

    set(out: Vec2, x: number, y: number): Vec2 {
        out[0] = x;
        out[1] = y;
        return out
    },

    transformMat4(out: Vec2, a: Readonly<Vec2>, m: Readonly<Mat4>) {
        const x = a[0];
        const y = a[1];
        out[0] = m[0] * x + m[4] * y + m[12];
        out[1] = m[1] * x + m[5] * y + m[13];
        return out;
    },

    min(out: Vec2, a: Vec2, b: Vec2) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        return out;
    },

    max(out: Vec2, a: Vec2, b: Vec2) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        return out;
    },

    add(out: Vec2, a: Readonly<Vec2>, b: Readonly<Vec2>) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    },

    subtract(out: Vec2, a: Readonly<Vec2>, b: Readonly<Vec2>) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        return out;
    },

    scale(out: Vec2, a: Readonly<Vec2>, scale: number) {
        out[0] = a[0] * scale;
        out[1] = a[1] * scale;
        return out;
    },

} as const
