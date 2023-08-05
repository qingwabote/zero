import { ImageLayout, LOAD_OP, SampleCountFlagBits, TextureUsageBits, impl } from "gfx-main";
import { VisibilityFlagBits } from "../VisibilityFlagBits.js";
import { device } from "../core/impl.js";
import { Phase } from "../core/render/pipeline/Phase.js";
import { Stage } from "../core/render/pipeline/Stage.js";
import { Uniform } from "../core/render/pipeline/Uniform.js";
import { ModelPhase } from "./phases/ModelPhase.js";
import { CameraUniform } from "./uniforms/CameraUniform.js";
import { LightUniform } from "./uniforms/LightUniform.js";
import { ShadowMapUniform } from "./uniforms/ShadowMapUniform.js";
import { ShadowUniform } from "./uniforms/ShadowUniform.js";

const SHADOWMAP_WIDTH = 1024;
const SHADOWMAP_HEIGHT = 1024;

export const stageFactory = {
    forward(phases: Phase[] = [new ModelPhase], lit: boolean = true) {
        const uniforms: (new () => Uniform)[] = [];
        if (lit) {
            uniforms.push(LightUniform);
        }
        uniforms.push(CameraUniform);
        return new Stage(uniforms, phases)
    },

    shadow(visibility: VisibilityFlagBits = VisibilityFlagBits.DEFAULT) {
        const depthStencilDescription = new impl.AttachmentDescription();
        depthStencilDescription.loadOp = LOAD_OP.CLEAR;
        depthStencilDescription.initialLayout = ImageLayout.UNDEFINED;
        depthStencilDescription.finalLayout = ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL;
        const renderPassInfo = new impl.RenderPassInfo;
        renderPassInfo.depthStencilAttachment = depthStencilDescription;
        const renderPass = device.createRenderPass();
        renderPass.initialize(renderPassInfo);

        const framebufferInfo = new impl.FramebufferInfo;
        const depthStencilAttachmentInfo = new impl.TextureInfo;
        depthStencilAttachmentInfo.samples = SampleCountFlagBits.SAMPLE_COUNT_1;
        depthStencilAttachmentInfo.usage = TextureUsageBits.DEPTH_STENCIL_ATTACHMENT | TextureUsageBits.SAMPLED;
        depthStencilAttachmentInfo.width = SHADOWMAP_WIDTH;
        depthStencilAttachmentInfo.height = SHADOWMAP_HEIGHT
        const depthStencilAttachment = device.createTexture();
        depthStencilAttachment.initialize(depthStencilAttachmentInfo);
        framebufferInfo.depthStencilAttachment = depthStencilAttachment;
        framebufferInfo.renderPass = renderPass;
        framebufferInfo.width = SHADOWMAP_WIDTH;
        framebufferInfo.height = SHADOWMAP_HEIGHT;
        const framebuffer = device.createFramebuffer();
        framebuffer.initialize(framebufferInfo);
        return new Stage([ShadowUniform, ShadowMapUniform], [new ModelPhase('shadowmap', visibility)], framebuffer, renderPass, { x: 0, y: 0, width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT });
    }
} as const