export const rect = {
    create(x = 0, y = 0, width = 0, height = 0) {
        return { x, y, width, height };
    },
    set(out, x, y, width, height) {
        out.x = x;
        out.y = y;
        out.width = width;
        out.height = height;
        return out;
    },
    copy(out, a) {
        out.x = a.x;
        out.y = a.y;
        out.width = a.width;
        out.height = a.height;
        return out;
    },
    contains(rect, point) {
        return (rect.x <= point[0]
            && rect.x + rect.width >= point[0]
            && rect.y <= point[1]
            && rect.y + rect.height >= point[1]);
    },
    union(out, one, other) {
        const x = one.x;
        const y = one.y;
        const w = one.width;
        const h = one.height;
        const bx = other.x;
        const by = other.y;
        const bw = other.width;
        const bh = other.height;
        out.x = Math.min(x, bx);
        out.y = Math.min(y, by);
        out.width = Math.max(x + w, bx + bw) - out.x;
        out.height = Math.max(y + h, by + bh) - out.y;
        return out;
    }
};
