import Animation, { Sampler } from "../assets/Animation.js";
import quat from "../core/math/quat.js";
import vec3 from "../core/math/vec3.js";
import Transform from "../core/scene/Transform.js";

function binarySearchEpsilon(array: ArrayLike<number>, value: number, EPSILON = 1e-6) {
    let low = 0;
    let high = array.length - 1;
    let middle = high >>> 1;
    for (; low <= high; middle = (low + high) >>> 1) {
        const test = array[middle];
        if (test > (value + EPSILON)) {
            high = middle - 1;
        } else if (test < (value - EPSILON)) {
            low = middle + 1;
        } else {
            return middle;
        }
    }
    return ~low;
}

interface TransformProperty {
    update(sampler: Sampler, time: number): void;
}

const vec3_a = vec3.create();
const quat_a = quat.create();
const quat_b = quat.create();
const quat_c = quat.create();

class TransformPosition implements TransformProperty {
    constructor(private _transform: Transform) { }

    update(sampler: Sampler, time: number): void {
        // const start = index * 3
        // this._transform.position = vec3.set(vec3_a, array[start], array[start + 1], array[start + 2])
    }
}

class TransformRotation implements TransformProperty {
    constructor(private _transform: Transform) { }

    update(sampler: Sampler, time: number): void {
        const times = sampler.input;
        const values = sampler.output;
        const index = binarySearchEpsilon(times, time);
        if (index >= 0) {
            const start = index * 4;
            this._transform.rotation = quat.set(quat_a, values[start], values[start + 1], values[start + 2], values[start + 3])
        } else {
            const next = ~index;
            const prev = next - 1;

            const start_prev = prev * 4;
            quat.set(quat_a, values[start_prev], values[start_prev + 1], values[start_prev + 2], values[start_prev + 3])

            const start_next = next * 4;
            quat.set(quat_b, values[start_next], values[start_next + 1], values[start_next + 2], values[start_next + 3])

            const t = (time - times[prev]) / (times[next] - times[prev]);
            quat.slerp(quat_c, quat_a, quat_b, t);
            // quat.normalize(quat_c, quat_c);
            this._transform.rotation = quat_c;
        }

    }
}

export default class AnimationState {
    private _time_dirty = true;
    private _time: number = 0;
    public get time(): number {
        return this._time;
    }
    public set time(value: number) {
        this._time = value;
        this._time_dirty = true;
    }

    private readonly _properties: readonly TransformProperty[];

    constructor(private _transform: Transform, private _animation: Animation) {
        const properties: TransformProperty[] = [];
        for (const channel of this._animation.channels) {
            if (channel.sampler.interpolation != 'LINEAR') {
                throw new Error(`unsupported interpolation: ${channel.sampler.interpolation}`);
            }
            const node = _transform.getChildByPath(channel.node)!
            let property: TransformProperty;
            switch (channel.path) {
                case 'translation':
                    property = new TransformPosition(node);
                    break;
                case 'rotation':
                    property = new TransformRotation(node);
                    break;
                default:
                    throw new Error(`unsupported path: ${channel.path}`);

            }
            properties.push(property);
        }
        this._properties = properties;
    }

    update(dt: number) {
        this._time += this._time_dirty ? 0 : dt;
        this._time = Math.min(this._time, this._animation.duration);

        for (let i = 0; i < this._animation.channels.length; i++) {
            const channel = this._animation.channels[i];
            this._properties[i].update(channel.sampler, this._time);
        }

        this._time_dirty = false;

        if (this._time >= this._animation.duration) {
            this.time = 0;
        }
    }
}