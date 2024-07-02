import { murmurhash2_32_gc } from "bastard";
import type { PassState, RenderPassInfo, VertexAttributeVector } from "gfx";
import { shaderLib } from "../shaderLib.js";

const _pass2hash: WeakMap<PassState, number> = new WeakMap;
const _attributes2hash: WeakMap<VertexAttributeVector, number> = new WeakMap;

let _renderPass_id = 0;
const _renderPass2id: Map<RenderPassInfo, number> = new Map;

export const hashLib = {
    passState(pass: PassState): number {
        let hash = _pass2hash.get(pass);
        if (!hash) {
            let key = "";
            key += `${shaderLib.getShaderMeta(pass.shader!).key}`;
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

    attributes(attributes: VertexAttributeVector): number {
        let hash = _attributes2hash.get(attributes);
        if (!hash) {
            let key = '';
            const length = attributes.size();
            for (let i = 0; i < length; i++) {
                const attribute = attributes.get(i);
                key += `${attribute.location}${attribute.format}${attribute.buffer}${attribute.offset}${attribute.stride}${attribute.instanced}`;
            }
            hash = murmurhash2_32_gc(key, 666);
            _attributes2hash.set(attributes, hash);
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