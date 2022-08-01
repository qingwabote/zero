export default {
    create() {
        return [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ];
    },
    determinant(a) {
        const a00 = a[0];
        const a01 = a[1];
        const a02 = a[2];
        const a10 = a[3];
        const a11 = a[4];
        const a12 = a[5];
        const a20 = a[6];
        const a21 = a[7];
        const a22 = a[8];
        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    }
};
//# sourceMappingURL=mat3.js.map