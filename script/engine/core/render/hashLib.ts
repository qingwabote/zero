import type { InputAssemblerInfo, PassState, RenderPassInfo, Shader } from "gfx";
import { murmurhash2_32_gc } from "../../base/murmurhash2_gc.js";
import { shaderLib } from "../shaderLib.js";

const _shader2hash: WeakMap<Shader, number> = new WeakMap;
const _pass2hash: WeakMap<PassState, number> = new WeakMap;
const _inputAssembler2hash: WeakMap<InputAssemblerInfo, number> = new WeakMap;

let _renderPass_id = 0;
const _renderPass2id: Map<RenderPassInfo, number> = new Map;

export const hashLib = {
    shader(shader: Shader): number {
        let hash = _shader2hash.get(shader);
        if (!hash) {
            hash = murmurhash2_32_gc(shaderLib.getShaderMeta(shader).key, 666);
            _shader2hash.set(shader, hash);
        }
        return hash;
    },

    passState(pass: PassState): number {
        let hash = _pass2hash.get(pass);
        if (!hash) {
            let key = "";
            key += `${shaderLib.getShaderMeta(pass.shader).key}`;
            key += `${pass.primitive}`;
            key += `${pass.rasterizationState.cullMode}`;
            if (pass.depthStencilState) {
                key += `${pass.depthStencilState.depthTestEnable}`;
            }
            if (pass.blendState) {
                key += `${pass.blendState.srcRGB}${pass.blendState.dstRGB}${pass.blendState.srcAlpha}${pass.blendState.dstAlpha}`;
            }
            hash = murmurhash2_32_gc(key, 666);
            _pass2hash.set(pass, hash);
        }
        return hash;
    },

    inputAssembler(inputAssembler: InputAssemblerInfo): number {
        let hash = _inputAssembler2hash.get(inputAssembler);
        if (!hash) {
            let key = '';
            const attributes = inputAssembler.vertexAttributes
            const length = attributes.size();
            for (let i = 0; i < length; i++) {
                const attribute = attributes.get(i);
                key += `${attribute.name}${attribute.format}${attribute.buffer}${attribute.offset}`;
            }
            hash = murmurhash2_32_gc(key, 666);
            _inputAssembler2hash.set(inputAssembler, hash);
        }
        return hash;
    },

    renderPass(renderPass: RenderPassInfo): number {
        let id = _renderPass2id.get(renderPass);
        if (id == undefined) {
            id = _renderPass_id++;
            _renderPass2id.set(renderPass, id);
        }
        return id;
    }
}