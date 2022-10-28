export default class WebDescriptorSet {
    _layout;
    get layout() {
        return this._layout;
    }
    _buffers = [];
    get buffers() {
        return this._buffers;
    }
    _bufferRanges = [];
    get bufferRanges() {
        return this._bufferRanges;
    }
    _textures = [];
    get textures() {
        return this._textures;
    }
    initialize(layout) {
        this._layout = layout;
        return false;
    }
    bindBuffer(binding, buffer, range) {
        this._buffers[binding] = buffer;
        this._bufferRanges[binding] = range ? range : buffer.info.size;
    }
    bindTexture(binding, texture) {
        this._textures[binding] = texture;
    }
}
//# sourceMappingURL=WebDescriptorSet.js.map