import { RecycleQueue } from "bastard";
import { device } from "boot";
import { ClearFlagBits, CommandBuffer, DescriptorSet, DescriptorSetLayoutInfo, Format, Framebuffer, FramebufferInfo, Pipeline, TextureInfo, TextureUsageFlagBits } from "gfx";
import { Vec4 } from "../../math/vec4.js";
import { shaderLib } from "../../shaderLib.js";
import { Context } from "../Context.js";
import { Camera } from "../scene/Camera.js";
import { Pass } from "../scene/Pass.js";
import { Batch } from "./Batch.js";
import { FlowContext } from "./FlowContext.js";
import { Phase } from "./Phase.js";
import { getRenderPass } from "./rpc.js";

const descriptorSetLayoutNull = device.createDescriptorSetLayout(new DescriptorSetLayoutInfo);

const defaultFramebuffer = (function () {
    const { width, height } = device.swapchain.color.info;
    const framebufferInfo = new FramebufferInfo;

    framebufferInfo.width = width;
    framebufferInfo.height = height;

    framebufferInfo.colors.add(device.swapchain.color);

    const depthStencilAttachmentInfo = new TextureInfo;
    depthStencilAttachmentInfo.usage = TextureUsageFlagBits.DEPTH_STENCIL;
    depthStencilAttachmentInfo.format = Format.D32_SFLOAT;
    depthStencilAttachmentInfo.width = width;
    depthStencilAttachmentInfo.height = height;
    framebufferInfo.depthStencil = device.createTexture(depthStencilAttachmentInfo);

    framebufferInfo.renderPass = getRenderPass(framebufferInfo);

    return device.createFramebuffer(framebufferInfo)
})();

function pass2batch_create(): Map<Pass, Batch[]> {
    return new Map;
}

function pass2batch_recycle(value: Map<Pass, Batch[]>) {
    value.clear();
}

export class Stage {
    private _camera2queue: WeakMap<Camera, RecycleQueue<Map<Pass, Batch[]>>> = new WeakMap;

    constructor(
        private readonly _flow: FlowContext,
        readonly phases: readonly Phase[],
        private readonly _framebuffer: Framebuffer = defaultFramebuffer,
        private readonly _clears?: ClearFlagBits,
        private readonly _rect?: Readonly<Vec4>
    ) { }

    batch(context: Context, commandBuffer: CommandBuffer, cameraIndex: number): void {
        const camera = context.scene.cameras[cameraIndex];
        let queue = this._camera2queue.get(camera);
        if (!queue) {
            this._camera2queue.set(camera, queue = new RecycleQueue(pass2batch_create, pass2batch_recycle));
        }
        for (const phase of this.phases) {
            if (camera.visibilities & phase.visibility) {
                phase.batch(queue, context, commandBuffer, cameraIndex);
            }
        }
    }

    render(context: Context, commandBuffer: CommandBuffer, cameraIndex: number) {
        const camera = context.scene.cameras[cameraIndex];
        const queue = this._camera2queue.get(camera)!;

        const renderPass = getRenderPass(this._framebuffer.info, this._clears ?? camera.clears);
        const rect = this._rect ?? camera.rect;

        const { width, height } = this._framebuffer.info;
        commandBuffer.beginRenderPass(renderPass, this._framebuffer, width * rect[0], height * rect[1], width * rect[2], height * rect[3]);

        let material: DescriptorSet | undefined;
        let pipeline: Pipeline | undefined;
        let pass2batches: ReadonlyMap<Pass, Batch[]> | null;
        while (pass2batches = queue.front()) {
            for (const [pass, batches] of pass2batches) {
                if (pass.descriptorSet && material != pass.descriptorSet) {
                    commandBuffer.bindDescriptorSet(shaderLib.sets.material.index, pass.descriptorSet);
                    material = pass.descriptorSet;

                    context.profile.materials++;
                }
                for (const batch of batches) {
                    if (batch.descriptorSet) {
                        commandBuffer.bindDescriptorSet(shaderLib.sets.batch.index, batch.descriptorSet);
                    }

                    const pl = this._flow.getPipeline(pass.state, batch.inputAssembler.vertexInputState, renderPass, [pass.descriptorSetLayout, batch.descriptorSetLayout || descriptorSetLayoutNull]);
                    if (pipeline != pl) {
                        commandBuffer.bindPipeline(pl);
                        pipeline = pl;

                        context.profile.pipelines++;
                    }

                    commandBuffer.bindInputAssembler(batch.inputAssembler);

                    if (batch.inputAssembler.indexInput) {
                        commandBuffer.drawIndexed(batch.draw.count, batch.draw.first, batch.count);
                    } else {
                        commandBuffer.draw(batch.draw.count, batch.draw.first, batch.count);
                    }
                    context.profile.draws++;
                }
            }
            queue.pop();
        }

        commandBuffer.endRenderPass();

        context.profile.stages++;
    }
}