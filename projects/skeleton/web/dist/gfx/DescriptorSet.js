export class DescriptorSet {
    constructor() {
        this._buffers = [];
        this._bufferRanges = [];
        this._textures = [];
        this._textureSamplers = [];
    }
    get layout() {
        return this._layout;
    }
    initialize(layout) {
        this._layout = layout;
        return false;
    }
    getBuffer(binding) {
        return this._buffers[binding];
    }
    getBufferRange(binding) {
        return this._bufferRanges[binding];
    }
    bindBuffer(binding, buffer, range) {
        this._buffers[binding] = buffer;
        this._bufferRanges[binding] = range ? range : buffer.info.size;
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
