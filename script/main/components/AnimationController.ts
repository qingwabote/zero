import AnimationState, { ChannelBinding, ChannelBindingValue } from "../animation/AnimationState.js";
import AnimationSystem from "../animation/AnimationSystem.js";
import Animation, { Sampler } from "../assets/Animation.js";
import Component from "../core/Component.js";
import TRS from "../core/math/TRS.js";
import quat, { Quat } from "../core/math/quat.js";
import vec3, { Vec3 } from "../core/math/vec3.js";

const vec3_a = vec3.create();
const vec3_b = vec3.create();
const vec3_c = vec3.create();

const quat_a = quat.create();
const quat_b = quat.create();
const quat_c = quat.create();

type FilteredKeys<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T];

class ChannelBindingVec3 implements ChannelBindingValue {
    constructor(private _transform: TRS, private _property: FilteredKeys<TRS, Vec3>) { }

    update(sampler: Sampler, index: number, time: number): void {
        const values = sampler.output;
        let value: Vec3;
        if (index >= 0) {
            const start = index * 3;
            value = vec3.set(vec3_a, values[start], values[start + 1], values[start + 2])
        } else {
            const next = ~index;
            const prev = next - 1;

            const start_prev = prev * 3;
            vec3.set(vec3_a, values[start_prev], values[start_prev + 1], values[start_prev + 2])

            const start_next = next * 3;
            vec3.set(vec3_b, values[start_next], values[start_next + 1], values[start_next + 2])

            const times = sampler.input;
            const t = (time - times[prev]) / (times[next] - times[prev]);
            value = vec3.lerp(vec3_c, vec3_a, vec3_b, t);
        }
        this._transform[this._property] = value;
    }
}

class ChannelBindingQuat implements ChannelBindingValue {
    constructor(private _transform: TRS, private _property: FilteredKeys<TRS, Quat>) { }

    update(sampler: Sampler, index: number, time: number): void {
        const values = sampler.output;
        let value: Quat;
        if (index >= 0) {
            const start = index * 4;
            value = quat.set(quat_a, values[start], values[start + 1], values[start + 2], values[start + 3])
        } else {
            const next = ~index;
            const prev = next - 1;

            const start_prev = prev * 4;
            quat.set(quat_a, values[start_prev], values[start_prev + 1], values[start_prev + 2], values[start_prev + 3])

            const start_next = next * 4;
            quat.set(quat_b, values[start_next], values[start_next + 1], values[start_next + 2], values[start_next + 3])

            const times = sampler.input;
            const t = (time - times[prev]) / (times[next] - times[prev]);
            value = quat.slerp(quat_c, quat_a, quat_b, t);
        }
        this._transform[this._property] = value;
    }
}

export default class AnimationController extends Component {
    animations: readonly Animation[] = [];

    start(): void {
        const animation = this.animations[0];
        const bindings: ChannelBinding[] = [];
        for (const channel of animation.channels) {
            if (channel.sampler.interpolation != 'LINEAR') {
                throw new Error(`unsupported interpolation: ${channel.sampler.interpolation}`);
            }
            const node = this.node.getChildByPath(channel.node)!
            let property: ChannelBindingValue;
            switch (channel.path) {
                case 'translation':
                    property = new ChannelBindingVec3(node, 'position');
                    break;
                case 'rotation':
                    property = new ChannelBindingQuat(node, 'rotation');
                    break;
                case 'scale':
                    property = new ChannelBindingVec3(node, 'scale');
                    break;
                default:
                    throw new Error(`unsupported path: ${channel.path}`);

            }
            bindings.push(new ChannelBinding(channel.sampler, property));
        }

        const animationState = new AnimationState(bindings, animation.duration);
        AnimationSystem.instance.addState(animationState);
    }
}