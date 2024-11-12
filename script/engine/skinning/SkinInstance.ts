import { CommandBuffer } from "gfx";
import { Transform } from "../core/render/scene/Transform.js";
import { Skin } from "../skinning/Skin.js";
import { SkinAlive } from "./SkinAlive.js";
import { SkinStrategy } from "./SkinStrategy.js";

export class SkinInstance {
    get descriptorSet() {
        return this._strategy.descriptorSet;
    }

    get offset() {
        return this._strategy.offset;
    }

    private _strategy: SkinStrategy;

    constructor(readonly root: Transform, proto: Skin) {
        this._strategy = new SkinAlive(root, proto);
    }

    update() {
        this._strategy.update();
    }

    upload(commandBuffer: CommandBuffer) {
        this._strategy.upload(commandBuffer);
    }
}