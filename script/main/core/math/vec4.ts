export type Vec4 = [number, number, number, number];

export default {
    ONE: [1, 1, 1, 1],

    create(x = 0, y = 0, z = 0, w = 0): Vec4 {
        return [x, y, z, w];
    }
} as const
