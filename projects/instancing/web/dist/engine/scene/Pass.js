import { device } from "boot";
import { BufferUsageFlagBits } from "gfx";
import { BufferView } from "../core/render/BufferView.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
var PropsStateBit;
(function (PropsStateBit) {
    PropsStateBit[PropsStateBit["DONE"] = 0] = "DONE";
    PropsStateBit[PropsStateBit["EXTERNAL"] = 2] = "EXTERNAL";
    PropsStateBit[PropsStateBit["UNBOUND"] = 4] = "UNBOUND";
})(PropsStateBit || (PropsStateBit = {}));
export class Pass {
    get props() {
        return this._props;
    }
    constructor(state, type = 'default', source) {
        this.state = state;
        this.type = type;
        this._props_state = PropsStateBit.DONE;
        this._props = undefined;
        this._textures_dirty = new Map;
        this._textures = new Map;
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
                    this.setTexture(name, ...item);
                }
            }
        }
        else {
            const block = meta.blocks['Props'];
            if (block) {
                this._props = new BufferView('Float32', BufferUsageFlagBits.UNIFORM, block.size);
                this.descriptorSet.bindBuffer(block.binding, this._props.buffer);
            }
        }
    }
    setPropertyByName(name, value) {
        return this.setProperty(value, this.getPropertyOffset(name));
    }
    getPropertyOffset(name) {
        var _a, _b, _c;
        return (_c = (_b = (_a = shaderLib.getShaderMeta(this.state.shader).blocks['Props']) === null || _a === void 0 ? void 0 : _a.members[name]) === null || _b === void 0 ? void 0 : _b.offset) !== null && _c !== void 0 ? _c : -1;
    }
    setProperty(value, offset) {
        if (this._props_state & PropsStateBit.EXTERNAL) {
            const props = new BufferView('Float32', BufferUsageFlagBits.UNIFORM, shaderLib.getShaderMeta(this.state.shader).blocks['Props'].size);
            props.set(this._props.source);
            this._props = props;
            this._props_state &= ~PropsStateBit.EXTERNAL;
        }
        this._props.set(value, offset);
        return this;
    }
    setTexture(name, texture, sampler = getSampler()) {
        this._textures.set(name, [texture, sampler]);
        this._textures_dirty.set(name, true);
        return this;
    }
    upload() {
        var _a;
        if (this.descriptorSet) {
            if (this._props_state & PropsStateBit.UNBOUND) {
                this.descriptorSet.bindBuffer(shaderLib.getShaderMeta(this.state.shader).blocks['Props'].binding, this._props.buffer);
                this._props_state &= ~PropsStateBit.UNBOUND;
            }
            for (const name of this._textures_dirty.keys()) {
                const binding = shaderLib.getShaderMeta(this.state.shader).samplerTextures[name].binding;
                this.descriptorSet.bindTexture(binding, ...this._textures.get(name));
            }
            this._textures_dirty.clear();
            (_a = this._props) === null || _a === void 0 ? void 0 : _a.update();
        }
    }
    copy() {
        return new Pass(this.state, this.type, { props: this._props, textures: this._textures });
    }
}
