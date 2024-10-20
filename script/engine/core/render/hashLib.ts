import { murmurhash2_32_gc } from "bastard";
import type { RenderPassInfo, VertexInputState } from "gfx";
import { shaderLib } from "../shaderLib.js";
import { Pass } from "./scene/Pass.js";

const _pass2hash: WeakMap<Pass.State, number> = new WeakMap;
const _inputState2hash: WeakMap<VertexInputState, number> = new WeakMap;

let _renderPass_id = 0;
const _renderPass2id: Map<RenderPassInfo, number> = new Map;

export const hashLib = {
    passState(pass: Pass.State): number {
        let hash = _pass2hash.get(pass);
        if (!hash) {
            let key = `${shaderLib.getShaderMeta(pass.shader!).key}`;

            if (pass.rasterizationState) {
                key += `${pass.rasterizationState.cullMode}`;
            } else {
                key += ' '
            }

            if (pass.depthStencilState) {
                key += `${pass.depthStencilState.depthTestEnable}`;
            } else {
                key += ' '
            }

            if (pass.blendState) {
                key += `${pass.blendState.srcRGB}${pass.blendState.dstRGB}${pass.blendState.srcAlpha}${pass.blendState.dstAlpha}`;
            } else {
                key += ' '
            }

            hash = murmurhash2_32_gc(key, 666);
            _pass2hash.set(pass, hash);
        }
        return hash;
    },

    inputState(inputState: VertexInputState): number {
        let hash = _inputState2hash.get(inputState);
        if (!hash) {
            let key = `${inputState.primitive}`;
            const attributes = inputState.attributes;
            const length = attributes.size();
            for (let i = 0; i < length; i++) {
                const attribute = attributes.get(i);
                key += `${attribute.location}${attribute.format}${attribute.buffer}${attribute.offset}${attribute.stride}${attribute.instanced}`;
            }
            hash = murmurhash2_32_gc(key, 666);
            _inputState2hash.set(inputState, hash);
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