export default class WebDescriptorSet {
    _layout;
    get layout() {
        return this._layout;
    }
    _buffers = [];
    _bufferRanges = [];
    _textures = [];
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
    bindTexture(binding, texture) {
        this._textures[binding] = texture;
    }
}
//# sourceMappingURL=WebDescriptorSet.js.map