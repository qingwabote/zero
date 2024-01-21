import * as spine_core from '@esotericsoftware/spine-core';
export class Texture extends spine_core.Texture {
    constructor(_texture) {
        super(_texture);
        this._texture = _texture;
        this._minFilter = spine_core.TextureFilter.Nearest;
        this._magFilter = spine_core.TextureFilter.Nearest;
        this._uWrap = spine_core.TextureWrap.Repeat;
        this._vWrap = spine_core.TextureWrap.Repeat;
        this.id = Texture._id++;
    }
    getImpl() {
        return this._texture.impl;
    }
    setFilters(minFilter, magFilter) {
        this._minFilter = minFilter;
        this._magFilter = magFilter;
    }
    setWraps(uWrap, vWrap) {
        this._uWrap = uWrap;
        this._vWrap = vWrap;
    }
    dispose() {
        throw new Error('Method not implemented.');
    }
}
Texture._id = 0;
