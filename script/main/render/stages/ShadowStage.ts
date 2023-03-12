import { SampleCountFlagBits } from "../../core/gfx/Pipeline.js";
import { ImageLayout, LOAD_OP, RenderPassInfo } from "../../core/gfx/RenderPass.js";
import { TextureUsageBit } from "../../core/gfx/Texture.js";
import Stage from "../../core/render/Stage.js";
import Uniform from "../../core/render/Uniform.js";
import VisibilityBit from "../../VisibilityBit.js";
import PhaseFlag from "../PhaseFlag.js";
import ModelPhase from "../phases/ModelPhase.js";
import ShadowMapUniform from "../uniforms/ShadowMapUniform.js";
import ShadowUniform from "../uniforms/ShadowUniform.js";

const SHADOWMAP_WIDTH = 1024;
const SHADOWMAP_HEIGHT = 1024;

export default class ShadowStage extends Stage {

    constructor(visibility: VisibilityBit = VisibilityBit.DEFAULT) {
        const renderPass = gfx.createRenderPass();
        renderPass.initialize(new RenderPassInfo([], {
            loadOp: LOAD_OP.CLEAR,
            initialLayout: ImageLayout.UNDEFINED,
            finalLayout: ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL
        }));

        const depthStencilAttachment = gfx.createTexture();
        depthStencilAttachment.initialize({
            samples: SampleCountFlagBits.SAMPLE_COUNT_1,
            usage: TextureUsageBit.DEPTH_STENCIL_ATTACHMENT | TextureUsageBit.SAMPLED,
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

        super([new ModelPhase(PhaseFlag.SHADOWMAP, visibility)], framebuffer, renderPass, { x: 0, y: 0, width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT });
    }

    getRequestedUniforms(): (new () => Uniform)[] {
        return [ShadowUniform, ShadowMapUniform];
    }
}