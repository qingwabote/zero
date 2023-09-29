import * as spine_core from '@esotericsoftware/spine-core';
import * as gfx from "gfx";
import * as assets from '../assets/Texture.js';

export class Texture extends spine_core.Texture {
    private static _id = 0;

    private _minFilter = spine_core.TextureFilter.Nearest;
    private _magFilter = spine_core.TextureFilter.Nearest;
    private _uWrap = spine_core.TextureWrap.Repeat;
    private _vWrap = spine_core.TextureWrap.Repeat;

    readonly id = Texture._id++;

    constructor(private _texture: assets.Texture) {
        super(_texture.bitmap);
    }

    getImpl(): gfx.Texture {
        return this._texture.impl;
    }

    setFilters(minFilter: spine_core.TextureFilter, magFilter: spine_core.TextureFilter): void {
        this._minFilter = minFilter;
        this._magFilter = magFilter;
    }

    setWraps(uWrap: spine_core.TextureWrap, vWrap: spine_core.TextureWrap): void {
        this._uWrap = uWrap;
        this._vWrap = vWrap;
    }

    dispose(): void {
        throw new Error('Method not implemented.');
    }
}