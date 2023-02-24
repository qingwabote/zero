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
    }
} as const
