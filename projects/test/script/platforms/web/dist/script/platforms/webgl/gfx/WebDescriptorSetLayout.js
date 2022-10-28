export default class WebDescriptorSetLayout {
    _bindings = [];
    get bindings() {
        return this._bindings;
    }
    initialize(bindings) {
        this._bindings = bindings;
        return false;
    }
}
//# sourceMappingURL=WebDescriptorSetLayout.js.map