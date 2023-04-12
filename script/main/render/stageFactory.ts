import VisibilityFlagBits from "../VisibilityFlagBits.js";
import { SampleCountFlagBits } from "../core/gfx/Pipeline.js";
import { ImageLayout, LOAD_OP, RenderPassInfo } from "../core/gfx/RenderPass.js";
import { TextureUsageBits } from "../core/gfx/Texture.js";
import Phase from "../core/render/Phase.js";
import Stage from "../core/render/Stage.js";
import Uniform from "../core/render/Uniform.js";
import PassType from "./PassType.js";
import ModelPhase from "./phases/ModelPhase.js";
import CameraUniform from "./uniforms/CameraUniform.js";
import LightUniform from "./uniforms/LightUniform.js";
import ShadowMapUniform from "./uniforms/ShadowMapUniform.js";
import ShadowUniform from "./uniforms/ShadowUniform.js";

const SHADOWMAP_WIDTH = 1024;
const SHADOWMAP_HEIGHT = 1024;

export default {
    forward(phases: Phase[] = [new ModelPhase], lit: boolean = true) {
        const uniforms: (new () => Uniform)[] = [];
        if (lit) {
            uniforms.push(LightUniform);
        }
        uniforms.push(CameraUniform);
        return new Stage(uniforms, phases)
    },

    shadow(visibility: VisibilityFlagBits = VisibilityFlagBits.DEFAULT) {
        const renderPass = gfx.createRenderPass();
        renderPass.initialize(new RenderPassInfo([], {
            loadOp: LOAD_OP.CLEAR,
            initialLayout: ImageLayout.UNDEFINED,
            finalLayout: ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL
        }));

        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            samples: SampleCountFlagBits.SAMPLE_COUNT_1,
            usage: TextureUsageBits.DEPTH_STENCIL_ATTACHMENT | TextureUsageBits.SAMPLED,
            width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT
        });
        const framebuffer = gfx.createFramebuffer();
        framebuffer.initialize({
            colorAttachments: [],
            depthStencilAttachment,
            resolveAttachments: [],
            renderPass: renderPass,
            width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT
        });
        return new Stage([ShadowUniform, ShadowMapUniform], [new ModelPhase(PassType.SHADOWMAP, visibility)], framebuffer, renderPass, { x: 0, y: 0, width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT });
    }
} as const