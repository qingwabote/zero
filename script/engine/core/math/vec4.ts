import { Vec3Like } from "./vec3.js";

export type Vec4 = [number, number, number, number];

export interface Vec4Like extends Vec3Like {
    3: number;
}

function create(x = 0, y = 0, z = 0, w = 0): Vec4 {
    return [x, y, z, w];
}

export const vec4 = {
    ZERO: Object.freeze(create(0, 0, 0, 0)),
    ONE: Object.freeze(create(1, 1, 1, 1)),
    RED: Object.freeze(create(1, 0, 0, 1)),
    GREEN: Object.freeze(create(0, 1, 0, 1)),
    YELLOW: Object.freeze(create(1, 1, 0, 1)),

    create,

    set<Out extends Vec4Like>(out: Out, x: number, y: number, z: number, w: number) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    },

    copy<Out extends Vec4Like>(out: Out, a: Readonly<Vec4Like>) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    },
} as const
