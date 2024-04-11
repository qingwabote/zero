import { Mat4Like } from "./mat4.js";

export type Vec2 = [number, number];

export interface Vec2Like {
    0: number;
    1: number;
}

function create(x: number = 0, y: number = 0): Vec2 {
    return [x, y];
}

export const vec2 = {
    ZERO: Object.freeze(create(0, 0)),

    create,

    set<Out extends Vec2Like>(out: Out, x: number, y: number) {
        out[0] = x;
        out[1] = y;
        return out
    },

    copy<Out extends Vec2Like>(out: Out, a: Readonly<Vec2Like>) {
        out[0] = a[0];
        out[1] = a[1];
        return out;
    },

    transformMat4<Out extends Vec2Like>(out: Out, a: Readonly<Vec2Like>, m: Readonly<Mat4Like>) {
        const x = a[0];
        const y = a[1];
        out[0] = m[0] * x + m[4] * y + m[12];
        out[1] = m[1] * x + m[5] * y + m[13];
        return out;
    },

    min<Out extends Vec2Like>(out: Out, a: Vec2Like, b: Vec2Like) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        return out;
    },

    max<Out extends Vec2Like>(out: Out, a: Vec2Like, b: Vec2Like) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        return out;
    },

    add<Out extends Vec2Like>(out: Out, a: Readonly<Vec2Like>, b: Readonly<Vec2Like>) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    },

    subtract<Out extends Vec2Like>(out: Out, a: Readonly<Vec2Like>, b: Readonly<Vec2Like>) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        return out;
    },

    scale<Out extends Vec2Like>(out: Out, a: Readonly<Vec2Like>, scale: number) {
        out[0] = a[0] * scale;
        out[1] = a[1] * scale;
        return out;
    },

    distance(a: Readonly<Vec2Like>, b: Readonly<Vec2Like>) {
        const x = b[0] - a[0];
        const y = b[1] - a[1];
        return Math.sqrt(x * x + y * y);
    },

    lerp<Out extends Vec2Like>(out: Out, a: Readonly<Vec2Like>, b: Readonly<Vec2Like>, t: number) {
        const x = a[0];
        const y = a[1];
        out[0] = x + t * (b[0] - x);
        out[1] = y + t * (b[1] - y);
        return out;
    }

} as const
