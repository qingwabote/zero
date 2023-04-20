export type Vec4 = [number, number, number, number];

export type Vec4Like = {
    0: number; 1: number; 2: number; 3: number;
    readonly length: 4;
    [Symbol.iterator](): IterableIterator<number>;
}

export default {
    ZERO: [0, 0, 0, 0],
    ONE: [1, 1, 1, 1],

    create(x = 0, y = 0, z = 0, w = 0): Vec4 {
        return [x, y, z, w];
    }
} as const
