import { device } from "boot";
import { AttachmentDescription, FramebufferInfo, ImageLayout, LOAD_OP, RenderPassInfo, SampleCountFlagBits, TextureInfo, TextureUsageBits } from "gfx";
import { VisibilityFlagBits } from "../VisibilityFlagBits.js";
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
        const depthStencilDescription = new AttachmentDescription();
        depthStencilDescription.loadOp = LOAD_OP.CLEAR;
        depthStencilDescription.initialLayout = ImageLayout.UNDEFINED;
        depthStencilDescription.finalLayout = ImageLayout.DEPTH_STENCIL_READ_ONLY_OPTIMAL;
        const renderPassInfo = new RenderPassInfo;
        renderPassInfo.depthStencilAttachment = depthStencilDescription;
        const renderPass = device.createRenderPass(renderPassInfo);

        const framebufferInfo = new FramebufferInfo;
        const depthStencilAttachmentInfo = new TextureInfo;
        depthStencilAttachmentInfo.samples = SampleCountFlagBits.SAMPLE_COUNT_1;
        depthStencilAttachmentInfo.usage = TextureUsageBits.DEPTH_STENCIL_ATTACHMENT | TextureUsageBits.SAMPLED;
        depthStencilAttachmentInfo.width = SHADOWMAP_WIDTH;
        depthStencilAttachmentInfo.height = SHADOWMAP_HEIGHT
        framebufferInfo.depthStencilAttachment = device.createTexture(depthStencilAttachmentInfo);
        framebufferInfo.renderPass = renderPass;
        framebufferInfo.width = SHADOWMAP_WIDTH;
        framebufferInfo.height = SHADOWMAP_HEIGHT;
        return new Stage([ShadowUniform, ShadowMapUniform], [new ModelPhase('shadowmap', visibility)], device.createFramebuffer(framebufferInfo), renderPass, { x: 0, y: 0, width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT });
    }
} as const