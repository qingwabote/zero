import { CullMode, Format, SampleCountFlagBits, TextureUsageFlagBits } from "gfx-common";
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
        this.format = Format.UNDEFINED;
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
        this.format = Format.UNDEFINED;
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
        this.location = 0;
        this.format = 0;
        this.buffer = 0;
        this.offset = 0;
        this.stride = 0;
        this.instanced = false;
        this.multiple = 1;
    }
}
export class VertexAttributeVector extends Vector {
}
;
export class VertexInputState {
    constructor() {
        this.attributes = new VertexAttributeVector;
        this.primitive = 0;
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
export class InputAssembler {
    constructor() {
        this.vertexInputState = new VertexInputState;
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
export class PipelineInfo {
    constructor() {
        this.inputState = null;
        this.shader = null;
        this.rasterizationState = null;
        this.depthStencilState = null;
        this.blendState = null;
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
