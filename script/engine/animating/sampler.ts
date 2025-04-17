import { quat } from "../core/math/quat.js";
import { vec3, Vec3Like } from "../core/math/vec3.js";
import { Vec4, vec4 } from "../core/math/vec4.js";

const vec4_a = vec4.create();
const vec4_b = vec4.create();

function binarySearch(source: ArrayLike<number>, value: number, EPSILON = 1e-6): number {
    if (value < source[0]) {
        return 0;
    }

    if (value > source[source.length - 1]) {
        return source.length - 1;
    }

    let head = 0;
    let tail = source.length - 1;
    while (head <= tail) {
        const mid = (head + tail) >>> 1;
        const res = source[mid];
        if ((value + EPSILON) < res) {
            tail = mid - 1;
        } else if ((value - EPSILON) > res) {
            head = mid + 1;
        } else {
            return mid;
        }
    }
    return ~head;
}

export function sampleVec3(out: Vec3Like, input: ArrayLike<number>, output: ArrayLike<number>, time: number) {
    const index = binarySearch(input, time);
    if (index >= 0) {
        const start = index * 3;
        vec3.set(out, output[start], output[start + 1], output[start + 2]);
    } else {
        const next = ~index;
        const prev = next - 1;

        const start_prev = prev * 3;
        vec3.set(vec4_a, output[start_prev], output[start_prev + 1], output[start_prev + 2])

        const start_next = next * 3;
        vec3.set(vec4_b, output[start_next], output[start_next + 1], output[start_next + 2])

        const t = (time - input[prev]) / (input[next] - input[prev]);
        vec3.lerp(out, vec4_a, vec4_b, t);
    }
}

export function sampleQuat(out: Vec4, input: ArrayLike<number>, output: ArrayLike<number>, time: number) {
    const index = binarySearch(input, time);
    if (index >= 0) {
        const start = index * 4;
        quat.set(out, output[start], output[start + 1], output[start + 2], output[start + 3]);
    } else {
        const next = ~index;
        const prev = next - 1;

        const start_prev = prev * 4;
        quat.set(vec4_a, output[start_prev], output[start_prev + 1], output[start_prev + 2], output[start_prev + 3])

        const start_next = next * 4;
        quat.set(vec4_b, output[start_next], output[start_next + 1], output[start_next + 2], output[start_next + 3])

        const t = (time - input[prev]) / (input[next] - input[prev]);
        quat.slerp(out, vec4_a, vec4_b, t);
    }
}