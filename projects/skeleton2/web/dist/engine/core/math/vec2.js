function create(x = 0, y = 0) {
    return [x, y];
}
export const vec2 = {
    ZERO: create(0, 0),
    create,
    set(out, x, y) {
        out[0] = x;
        out[1] = y;
        return out;
    },
    copy(out, a) {
        out[0] = a[0];
        out[1] = a[1];
        return out;
    },
    transformMat4(out, a, m) {
        const x = a[0];
        const y = a[1];
        out[0] = m[0] * x + m[4] * y + m[12];
        out[1] = m[1] * x + m[5] * y + m[13];
        return out;
    },
    min(out, a, b) {
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        return out;
    },
    max(out, a, b) {
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        return out;
    },
    add(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        return out;
    },
    subtract(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        return out;
    },
    scale(out, a, scale) {
        out[0] = a[0] * scale;
        out[1] = a[1] * scale;
        return out;
    },
    equals(a, b, epsilon = 0.000001) {
        return (Math.abs(a[0] - b[0])
            <= epsilon * Math.max(1.0, Math.abs(a[0]), Math.abs(b[0]))
            && Math.abs(a[1] - b[1])
                <= epsilon * Math.max(1.0, Math.abs(a[1]), Math.abs(b[1])));
    },
    distance(a, b) {
        const x = b[0] - a[0];
        const y = b[1] - a[1];
        return Math.sqrt(x * x + y * y);
    },
    lerp(out, a, b, t) {
        const x = a[0];
        const y = a[1];
        out[0] = x + t * (b[0] - x);
        out[1] = y + t * (b[1] - y);
        return out;
    }
};
