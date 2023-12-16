import { device } from "boot";
import { ClearFlagBits, Framebuffer, FramebufferInfo, SampleCountFlagBits, TextureInfo, TextureUsageBits } from "gfx";
import { VisibilityFlagBits } from "../VisibilityFlagBits.js";
import { Phase } from "../core/render/pipeline/Phase.js";
import { Stage } from "../core/render/pipeline/Stage.js";
import { Uniform } from "../core/render/pipeline/Uniform.js";
import { getRenderPass } from "../core/render/pipeline/rpc.js";
import { ModelPhase } from "./phases/ModelPhase.js";
import { CameraUniform } from "./uniforms/CameraUniform.js";
import { LightUniform } from "./uniforms/LightUniform.js";
import { ShadowMapUniform } from "./uniforms/ShadowMapUniform.js";
import { ShadowUniform } from "./uniforms/ShadowUniform.js";

const SHADOWMAP_WIDTH = 1024;
const SHADOWMAP_HEIGHT = 1024;

export const stageFactory = {
    forward(phases: Phase[] = [new ModelPhase], lit: boolean = true, samples: SampleCountFlagBits = SampleCountFlagBits.SAMPLE_COUNT_1) {
        let framebuffer: Framebuffer | undefined;
        if (samples != SampleCountFlagBits.SAMPLE_COUNT_1) {
            const framebufferInfo = new FramebufferInfo;

            const colorAttachmentInfo = new TextureInfo;
            colorAttachmentInfo.samples = samples;
            colorAttachmentInfo.usage = TextureUsageBits.COLOR_ATTACHMENT | TextureUsageBits.TRANSIENT_ATTACHMENT;
            colorAttachmentInfo.width = device.swapchain.width;
            colorAttachmentInfo.height = device.swapchain.height;
            framebufferInfo.colorAttachments.add(device.createTexture(colorAttachmentInfo));
            framebufferInfo.resolveAttachments.add(device.swapchain.colorTexture);

            const depthStencilAttachmentInfo = new TextureInfo;
            depthStencilAttachmentInfo.samples = samples;
            depthStencilAttachmentInfo.usage = TextureUsageBits.DEPTH_STENCIL_ATTACHMENT;
            depthStencilAttachmentInfo.width = device.swapchain.width;
            depthStencilAttachmentInfo.height = device.swapchain.height;
            framebufferInfo.depthStencilAttachment = device.createTexture(depthStencilAttachmentInfo);

            framebufferInfo.renderPass = getRenderPass(framebufferInfo);
            framebufferInfo.width = device.swapchain.width;
            framebufferInfo.height = device.swapchain.height;

            framebuffer = device.createFramebuffer(framebufferInfo);
        }

        const uniforms: (new () => Uniform)[] = [];
        if (lit) {
            uniforms.push(LightUniform);
        }
        uniforms.push(CameraUniform);
        return new Stage(uniforms, phases, framebuffer);
    },

    shadow(visibility: VisibilityFlagBits = VisibilityFlagBits.DEFAULT) {
        const framebufferInfo = new FramebufferInfo;
        const depthStencilAttachmentInfo = new TextureInfo;
        depthStencilAttachmentInfo.samples = SampleCountFlagBits.SAMPLE_COUNT_1;
        depthStencilAttachmentInfo.usage = TextureUsageBits.DEPTH_STENCIL_ATTACHMENT | TextureUsageBits.SAMPLED;
        depthStencilAttachmentInfo.width = SHADOWMAP_WIDTH;
        depthStencilAttachmentInfo.height = SHADOWMAP_HEIGHT
        framebufferInfo.depthStencilAttachment = device.createTexture(depthStencilAttachmentInfo);
        framebufferInfo.renderPass = getRenderPass(framebufferInfo, ClearFlagBits.DEPTH);
        framebufferInfo.width = SHADOWMAP_WIDTH;
        framebufferInfo.height = SHADOWMAP_HEIGHT;
        return new Stage([ShadowUniform, ShadowMapUniform], [new ModelPhase('shadowmap', visibility)], device.createFramebuffer(framebufferInfo), framebufferInfo.renderPass, { x: 0, y: 0, width: SHADOWMAP_WIDTH, height: SHADOWMAP_HEIGHT });
    }
} as const