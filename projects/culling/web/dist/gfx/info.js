import { CullMode, SampleCountFlagBits, TextureUsageFlagBits } from "gfx-common";
export class Vector {
    constructor() {
        this.data = [];
    }
    size() {
        return this.data.length;
    }
    get(i) {
        return this.data[i];
    }
    add(v) {
        this.data.push(v);
    }
}
export class FloatVector extends Vector {
}
;
export class Uint32Vector extends Vector {
}
;
export class StringVector extends Vector {
}
;
export class BufferInfo {
    constructor() {
        this.usage = 0;
        this.mem_usage = 0;
        this.size = 0;
    }
}
export class DescriptorSetLayoutBinding {
    constructor() {
        this.binding = 0;
        this.descriptorType = 0;
        this.descriptorCount = 0;
        this.stageFlags = 0;
    }
}
export class DescriptorSetLayoutBindingVector extends Vector {
}
;
export class DescriptorSetLayoutInfo {
    constructor() {
        this.bindings = new DescriptorSetLayoutBindingVector;
    }
}
export class AttachmentDescription {
    constructor() {
        this.loadOp = 0;
        this.initialLayout = 0;
        this.finalLayout = 0;
    }
}
export class AttachmentDescriptionVector extends Vector {
}
;
export class RenderPassInfo {
    constructor() {
        this.colors = new AttachmentDescriptionVector;
        this.depthStencil = new AttachmentDescription;
        this.resolves = new AttachmentDescriptionVector;
        this.samples = SampleCountFlagBits.X1;
    }
}
export class TextureInfo {
    constructor() {
        this.samples = SampleCountFlagBits.X1;
        this.usage = TextureUsageFlagBits.NONE;
        this.width = 0;
        this.height = 0;
        this.swapchain = false;
    }
}
export class TextureVector extends Vector {
}
;
export class FramebufferInfo {
    constructor() {
        this.colors = new TextureVector;
        this.depthStencil = null;
        this.resolves = new TextureVector;
        this.renderPass = null;
        this.width = 0;
        this.height = 0;
    }
}
export class SamplerInfo {
    constructor() {
        this.magFilter = 0;
        this.minFilter = 0;
    }
}
export class ShaderInfo {
    constructor() {
        this.sources = new StringVector;
        this.types = new Uint32Vector;
    }
}
export class DescriptorSetLayoutVector extends Vector {
}
;
export class PipelineLayoutInfo {
    constructor() {
        this.layouts = new DescriptorSetLayoutVector;
    }
}
export class VertexAttribute {
    constructor() {
        this.name = '';
        this.format = 0;
        this.buffer = 0;
        this.offset = 0;
        this.stride = 0;
        this.location = 0;
        this.instanced = false;
    }
}
export class BufferVector extends Vector {
}
;
export class VertexInput {
    constructor() {
        this.buffers = new BufferVector;
        this.offsets = new Uint32Vector;
    }
}
export class IndexInput {
    constructor() {
        this.buffer = null;
        this.type = 0;
    }
}
export class VertexAttributeVector extends Vector {
}
;
export class InputAssembler {
    constructor() {
        this.vertexAttributes = new VertexAttributeVector;
        this.vertexInput = new VertexInput;
        this.indexInput = null;
    }
}
export class RasterizationState {
    constructor() {
        this.cullMode = CullMode.NONE;
    }
}
export class DepthStencilState {
    constructor() {
        this.depthTestEnable = false;
    }
}
export class BlendState {
    constructor() {
        this.srcRGB = 0;
        this.dstRGB = 0;
        this.srcAlpha = 0;
        this.dstAlpha = 0;
    }
}
export class PassState {
    constructor() {
        this.shader = null;
        this.primitive = 0;
        this.rasterizationState = new RasterizationState;
        this.depthStencilState = null;
        this.blendState = null;
    }
}
export class PipelineInfo {
    constructor() {
        this.passState = null;
        this.attributes = null;
        this.layout = null;
        this.renderPass = null;
    }
}
export class SubmitInfo {
    constructor() {
        this.commandBuffer = null;
        this.waitSemaphore = null;
        this.waitDstStageMask = 0;
        this.signalSemaphore = null;
    }
}
