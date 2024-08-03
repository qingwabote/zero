import { device } from "boot";
import { BufferUsageFlagBits, DescriptorSet, DescriptorSetLayout, Sampler, Texture } from "gfx";
import { BufferView } from "../core/render/BufferView.js";
import { Pass as _Pass } from '../core/render/scene/Pass.js';
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";

enum PropsStateBit {
    DONE = 0,
    EXTERNAL = 1 << 1,
    UNBOUND = 1 << 2
}

let id = 0;

export class Pass implements _Pass {
    readonly id = id++;

    readonly descriptorSetLayout: DescriptorSetLayout
    readonly descriptorSet: DescriptorSet | undefined;

    private _props_state: PropsStateBit = PropsStateBit.DONE;
    private _props: BufferView | undefined = undefined;
    get props(): BufferView | undefined {
        return this._props;
    }

    private _textures_dirty: Map<string, boolean> = new Map;
    private _textures: Map<string, [Texture, Sampler]> = new Map;

    constructor(readonly state: _Pass.State, readonly type: string = 'default', source?: { props: BufferView | undefined, textures: ReadonlyMap<string, [Texture, Sampler]> | undefined }) {
        const meta = shaderLib.getShaderMeta(state.shader);
        this.descriptorSetLayout = shaderLib.getDescriptorSetLayout(meta, shaderLib.sets.material.index);
        this.descriptorSet = device.createDescriptorSet(this.descriptorSetLayout);

        if (source) {
            if (source.props) {
                this._props = source.props;
                this._props_state = PropsStateBit.EXTERNAL | PropsStateBit.UNBOUND;
            }
            if (source.textures) {
                for (const [name, item] of source.textures) {
                    this.setTexture(name, ...item)
                }
            }
        } else {
            const block = meta.blocks['Props'];
            if (block) {
                this._props = new BufferView('Float32', BufferUsageFlagBits.UNIFORM, block.size);
                this.descriptorSet.bindBuffer(block.binding, this._props.buffer);
            }
        }
    }

    setPropertyByName(name: string, value: ArrayLike<number>): Pass {
        return this.setProperty(value, this.getPropertyOffset(name));
    }

    getPropertyOffset(name: string): number {
        return shaderLib.getShaderMeta(this.state.shader).blocks['Props']?.members![name]?.offset ?? -1;
    }

    setProperty(value: ArrayLike<number>, offset: number): Pass {
        if (this._props_state & PropsStateBit.EXTERNAL) {
            const props = new BufferView('Float32', BufferUsageFlagBits.UNIFORM, shaderLib.getShaderMeta(this.state.shader).blocks['Props'].size);
            props.set(this._props!.source);
            this._props = props;
            this._props_state &= ~PropsStateBit.EXTERNAL
        }
        this._props!.set(value, offset);

        return this;
    }

    setTexture(name: string, texture: Texture, sampler: Sampler = getSampler()): Pass {
        this._textures.set(name, [texture, sampler]);
        this._textures_dirty.set(name, true);

        return this;
    }

    upload() {
        if (this.descriptorSet) {
            if (this._props_state & PropsStateBit.UNBOUND) {
                this.descriptorSet.bindBuffer(shaderLib.getShaderMeta(this.state.shader).blocks['Props'].binding, this._props!.buffer);
                this._props_state &= ~PropsStateBit.UNBOUND;
            }

            for (const name of this._textures_dirty.keys()) {
                const binding = shaderLib.getShaderMeta(this.state.shader).samplerTextures[name].binding;
                this.descriptorSet.bindTexture(binding, ...this._textures.get(name)!);
            }
            this._textures_dirty.clear();

            this._props?.update();
        }
    }

    copy(): Pass {
        return new Pass(this.state, this.type, { props: this._props, textures: this._textures });
    }
}

export declare namespace Pass {
    export import State = _Pass.State;
}

