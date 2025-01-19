export class DescriptorSet {
    constructor(layout) {
        this.layout = layout;
        this._buffers = [];
        this._bufferRanges = [];
        this._textures = [];
        this._textureSamplers = [];
    }
    getBuffer(binding) {
        return this._buffers[binding];
    }
    getBufferRange(binding) {
        return this._bufferRanges[binding];
    }
    bindBuffer(binding, buffer, range = 0) {
        this._buffers[binding] = buffer;
        this._bufferRanges[binding] = range;
    }
    getTexture(binding) {
        return this._textures[binding];
    }
    getSampler(binding) {
        return this._textureSamplers[binding];
    }
    bindTexture(binding, texture, sampler) {
        this._textures[binding] = texture;
        this._textureSamplers[binding] = sampler;
    }
}
