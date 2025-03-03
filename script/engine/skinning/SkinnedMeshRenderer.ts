import { CommandBuffer } from "gfx";
import { MeshRenderer } from "../components/MeshRenderer.js";
import { Model } from "../core/render/scene/Model.js";
import { SkinInstance } from "./SkinInstance.js";
import { SkinnedModel } from "./SkinnedModel.js";

export class SkinnedMeshRenderer extends MeshRenderer {

    private _skin: SkinInstance | null = null;
    public get skin() {
        return this._skin;
    }
    public set skin(value) {
        this._skin = value;
    }

    protected override createModel(): Model | null {
        if (!this.mesh || !this.materials || !this._skin) {
            return null;
        }
        return new SkinnedModel(this.node, this.mesh, this.materials, this._skin);
    }

    override upload(commandBuffer: CommandBuffer): void {
        this._skin?.store.upload(commandBuffer);
    }
}