function create(x = 0, y = 0, z = 0, w = 0) {
    return [x, y, z, w];
}
export const vec4 = {
    ZERO: Object.freeze(create(0, 0, 0, 0)),
    ONE: Object.freeze(create(1, 1, 1, 1)),
    RED: Object.freeze(create(1, 0, 0, 1)),
    YELLOW: Object.freeze(create(1, 1, 0, 1)),
    create,
    set(out, x, y, z, w) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
    },
    copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    },
};
