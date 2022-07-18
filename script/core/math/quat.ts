import { Vec3 } from "./vec3.js";

const halfToRad = 0.5 * Math.PI / 180.0;

export type Quat = [number, number, number, number]

export default {
    create(): Quat {
        return [0, 0, 0, 1]
    },

    fromEuler(out: Quat, x: number, y: number, z: number): Quat {
        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;

        const sx = Math.sin(x);
        const cx = Math.cos(x);
        const sy = Math.sin(y);
        const cy = Math.cos(y);
        const sz = Math.sin(z);
        const cz = Math.cos(z);

        out[0] = sx * cy * cz + cx * sy * sz;
        out[1] = cx * sy * cz + sx * cy * sz;
        out[2] = cx * cy * sz - sx * sy * cz;
        out[3] = cx * cy * cz - sx * sy * sz;

        return out;
    },

    toEuler(out: Vec3, q: Quat): Vec3 {
        const [x, y, z, w] = q;
        let bank = 0;
        let heading = 0;
        let attitude = 0;
        const test = x * y + z * w;
        if (test > 0.499999) {
            bank = 0; // default to zero
            heading = 180.0 / Math.PI * 2 * Math.atan2(x, w);
            attitude = 90;
        } else if (test < -0.499999) {
            bank = 0; // default to zero
            heading = 180.0 / Math.PI * -2 * Math.atan2(x, w);
            attitude = -90;
        } else {
            const sqx = x * x;
            const sqy = y * y;
            const sqz = z * z;
            bank = 180.0 / Math.PI * Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * sqx - 2 * sqz);
            heading = 180.0 / Math.PI * Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * sqy - 2 * sqz);
            attitude = 180.0 / Math.PI * Math.asin(2 * test);
        }
        out[0] = bank; out[1] = heading; out[2] = attitude;
        return out;
    }
}