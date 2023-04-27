import AnimationState, { ChannelBinding, ChannelBindingValue } from "../animation/AnimationState.js";
import AnimationSystem from "../animation/AnimationSystem.js";
import Animation from "../assets/Animation.js";
import Component from "../core/Component.js";
import TRS from "../core/math/TRS.js";
import quat, { QuatLike } from "../core/math/quat.js";
import vec3, { Vec3Like } from "../core/math/vec3.js";
import vec4 from "../core/math/vec4.js";

const vec4_a = vec4.create();
const vec4_b = vec4.create();
const vec4_c = vec4.create();

type FilteredKeys<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T];

class ChannelBindingVec3 implements ChannelBindingValue {
    constructor(private _transform: TRS, private _property: FilteredKeys<TRS, Vec3Like>) { }

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

class ChannelBindingQuat implements ChannelBindingValue {
    constructor(private _transform: TRS, private _property: FilteredKeys<TRS, QuatLike>) { }

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

export default class AnimationController extends Component {
    animations: readonly Animation[] = [];

    start(): void {
        const animation = this.animations[0];
        const channels: ChannelBinding[] = [];
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
            channels.push(new ChannelBinding(channel.sampler, property));
        }

        const animationState = new AnimationState(channels, animation.duration);
        AnimationSystem.instance.addState(animationState);
    }
}