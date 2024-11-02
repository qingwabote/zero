import { TRS } from "../../core/math/TRS.js";
import { QuatLike, quat } from "../../core/math/quat.js";
import { Vec3Like, vec3 } from "../../core/math/vec3.js";
import { vec4 } from "../../core/math/vec4.js";
import { ChannelBinding } from "./ChannelBinding.js";

const vec4_a = vec4.create();
const vec4_b = vec4.create();
const vec4_c = vec4.create();

type FilteredKeys<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T];

export class ChannelBindingVec3 implements ChannelBinding.Value {
    constructor(private _transform: TRS, private _property: FilteredKeys<TRS, Readonly<Vec3Like>>) { }

    set(buffer: ArrayLike<number>, index: number): void {
        const start = index * 3;
        this._transform[this._property] = vec3.set(vec4_a, buffer[start], buffer[start + 1], buffer[start + 2])
    }

    lerp(buffer: ArrayLike<number>, prev: number, next: number, t: number): void {
        const start_prev = prev * 3;
        vec3.set(vec4_a, buffer[start_prev], buffer[start_prev + 1], buffer[start_prev + 2])

        const start_next = next * 3;
        vec3.set(vec4_b, buffer[start_next], buffer[start_next + 1], buffer[start_next + 2])

        this._transform[this._property] = vec3.lerp(vec4_c, vec4_a, vec4_b, t);
    }
}

export class ChannelBindingQuat implements ChannelBinding.Value {
    constructor(private _transform: TRS, private _property: FilteredKeys<TRS, Readonly<QuatLike>>) { }

    set(buffer: ArrayLike<number>, index: number): void {
        const start = index * 4;
        this._transform[this._property] = quat.set(vec4_a, buffer[start], buffer[start + 1], buffer[start + 2], buffer[start + 3])
    }

    lerp(buffer: ArrayLike<number>, prev: number, next: number, t: number): void {
        const start_prev = prev * 4;
        quat.set(vec4_a, buffer[start_prev], buffer[start_prev + 1], buffer[start_prev + 2], buffer[start_prev + 3])

        const start_next = next * 4;
        quat.set(vec4_b, buffer[start_next], buffer[start_next + 1], buffer[start_next + 2], buffer[start_next + 3])

        this._transform[this._property] = quat.slerp(vec4_c, vec4_a, vec4_b, t);
    }
}