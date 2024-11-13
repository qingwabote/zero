import { quat } from "../core/math/quat.js";
import { vec3 } from "../core/math/vec3.js";
import { vec4 } from "../core/math/vec4.js";
const vec4_a = vec4.create();
const vec4_b = vec4.create();
const vec4_c = vec4.create();
export class ChannelBindingVec3 {
    constructor(_transform, _property) {
        this._transform = _transform;
        this._property = _property;
    }
    set(buffer, index) {
        const start = index * 3;
        this._transform[this._property] = vec3.set(vec4_a, buffer[start], buffer[start + 1], buffer[start + 2]);
    }
    lerp(buffer, prev, next, t) {
        const start_prev = prev * 3;
        vec3.set(vec4_a, buffer[start_prev], buffer[start_prev + 1], buffer[start_prev + 2]);
        const start_next = next * 3;
        vec3.set(vec4_b, buffer[start_next], buffer[start_next + 1], buffer[start_next + 2]);
        this._transform[this._property] = vec3.lerp(vec4_c, vec4_a, vec4_b, t);
    }
}
export class ChannelBindingQuat {
    constructor(_transform, _property) {
        this._transform = _transform;
        this._property = _property;
    }
    set(buffer, index) {
        const start = index * 4;
        this._transform[this._property] = quat.set(vec4_a, buffer[start], buffer[start + 1], buffer[start + 2], buffer[start + 3]);
    }
    lerp(buffer, prev, next, t) {
        const start_prev = prev * 4;
        quat.set(vec4_a, buffer[start_prev], buffer[start_prev + 1], buffer[start_prev + 2], buffer[start_prev + 3]);
        const start_next = next * 4;
        quat.set(vec4_b, buffer[start_next], buffer[start_next + 1], buffer[start_next + 2], buffer[start_next + 3]);
        this._transform[this._property] = quat.slerp(vec4_c, vec4_a, vec4_b, t);
    }
}
