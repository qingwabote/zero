import { murmurhash2_32_gc } from "../../base/murmurhash2_gc.js";
import { PassState, VertexInputState } from "../gfx/Pipeline.js";
import RenderPass, { RenderPassInfo } from "../gfx/RenderPass.js";
import Shader from "../gfx/Shader.js";
import shaderLib from "../shaderLib.js";

const _shader2hash: WeakMap<Shader, number> = new WeakMap;
const _pass2hash: WeakMap<PassState, number> = new WeakMap;
const _vertex2hash: WeakMap<VertexInputState, number> = new WeakMap;
const _renderPass2hash: WeakMap<RenderPassInfo, number> = new WeakMap;

export default {
    shader(shader: Shader): number {
        let hash = _shader2hash.get(shader);
        if (!hash) {
            hash = murmurhash2_32_gc(shaderLib.getMeta(shader).key, 666);
            _shader2hash.set(shader, hash);
        }
        return hash;
    },

    passState(pass: PassState): number {
        let hash = _pass2hash.get(pass);
        if (!hash) {
            let key = "";
            key += `${shaderLib.getMeta(pass.shader).key}`;
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

    vertexInputState(vertexInput: VertexInputState): number {
        let hash = _vertex2hash.get(vertexInput);
        if (!hash) {
            let key = '';
            for (const attribute of vertexInput.attributes) {
                key += `${attribute.location}${attribute.format}${attribute.binding}${attribute.offset}`;
            }
            hash = murmurhash2_32_gc(key, 666);
            _vertex2hash.set(vertexInput, hash);
        }
        return hash;
    },

    renderPass(renderPass: RenderPass): number {
        const info = renderPass.info;
        let hash = _renderPass2hash.get(info);
        if (!hash) {
            // https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#renderpass-compatibility
            const key = `${info.colorAttachments.length}1${info.resolveAttachments.length}${info.samples}`;
            hash = murmurhash2_32_gc(key, 666);
            _renderPass2hash.set(info, hash);
        }
        return hash;
    }
}