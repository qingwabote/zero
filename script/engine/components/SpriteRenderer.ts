import { bundle } from "bundling";
import { Filter } from "gfx";
import { Shader } from "../assets/Shader.js";
import { SpriteFrame } from "../assets/SpriteFrame.js";
import { AABB3D, aabb3d } from "../core/math/aabb3d.js";
import { Vec4, vec4 } from "../core/math/vec4.js";
import { Material } from "../core/render/scene/Material.js";
import { Model } from "../core/render/scene/Model.js";
import { Pass } from "../core/render/scene/Pass.js";
import { getSampler } from "../core/sc.js";
import { shaderLib } from "../core/shaderLib.js";
import { BoundedRenderer } from "./BoundedRenderer.js";

const ss_unlit = await bundle.cache('./shaders/unlit', Shader);

export class SpriteRenderer extends BoundedRenderer {
    static readonly PIXELS_PER_UNIT = SpriteFrame.PIXELS_PER_UNIT;

    static readonly Filter = Filter;

    shader = shaderLib.getShader(ss_unlit, { USE_ALBEDO_MAP: 1 });

    private _spriteFrame_invalidated = false;
    private _spriteFrame: SpriteFrame | null = null;
    public get spriteFrame() {
        return this._spriteFrame;
    }
    public set spriteFrame(value) {
        this._spriteFrame = value;
        this._spriteFrame_invalidated = true;
        this.emit(BoundedRenderer.EventName.BOUNDS_CHANGED);
    }

    public get bounds(): Readonly<AABB3D> {
        return this._spriteFrame?.mesh.bounds ?? aabb3d.ZERO;
    }

    filter = Filter.NEAREST;

    color: Readonly<Vec4> = vec4.ONE;

    protected createModel(): Model | null {
        if (!this._spriteFrame) {
            return null;
        }
        const pass = Pass.Pass({ shader: this.shader });
        const offset = pass.getPropertyOffset('albedo')
        if (offset != -1) {
            pass.setProperty(this.color, offset);
        }
        return new Model(this.node, this._spriteFrame.mesh, [new Material([pass])])
    }

    update(dt: number): void {
        super.update(dt);
        if (this._spriteFrame_invalidated) {
            this._model?.materials[0].passes[0].setTexture('albedoMap', this._spriteFrame!.texture, getSampler(this.filter, this.filter))
            this._spriteFrame_invalidated = false;
        }
    }
}