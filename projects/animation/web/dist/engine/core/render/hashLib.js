import { murmurhash2_32_gc } from "bastard";
import { shaderLib } from "../shaderLib.js";
const _shader2hash = new WeakMap;
const _pass2hash = new WeakMap;
const _inputAssembler2hash = new WeakMap;
let _renderPass_id = 0;
const _renderPass2id = new Map;
export const hashLib = {
    shader(shader) {
        let hash = _shader2hash.get(shader);
        if (!hash) {
            hash = murmurhash2_32_gc(shaderLib.getShaderMeta(shader).key, 666);
            _shader2hash.set(shader, hash);
        }
        return hash;
    },
    passState(pass) {
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
    inputAssembler(inputAssembler) {
        let hash = _inputAssembler2hash.get(inputAssembler);
        if (!hash) {
            let key = '';
            const attributes = inputAssembler.vertexAttributes;
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
    renderPass(renderPass) {
        let id = _renderPass2id.get(renderPass);
        if (id == undefined) {
            id = _renderPass_id++;
            _renderPass2id.set(renderPass, id);
        }
        return id;
    }
};
