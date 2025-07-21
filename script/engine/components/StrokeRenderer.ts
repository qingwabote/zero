import { bundle } from "bundling";
import { BlendFactor, BlendState, CommandBuffer, DepthStencilState } from "gfx";
import { Shader } from "../assets/Shader.js";
import { AABB3D } from "../core/math/aabb3d.js";
import { frustum } from "../core/math/frustum.js";
import { Vec3 } from "../core/math/vec3.js";
import { Vec4 } from "../core/math/vec4.js";
import { Model } from "../core/render/scene/Model.js";
import { shaderLib } from "../core/shaderLib.js";
import { Pass } from "../scene/Pass.js";
import { Stroke } from "../Stroke.js";
import { BoundedRenderer } from "./BoundedRenderer.js";

const primitive = await bundle.cache('./shaders/primitive', Shader);

const pass = (function () {
    const depthStencilState = new DepthStencilState;
    depthStencilState.depthTestEnable = true;
    const blendState = new BlendState;
    blendState.srcRGB = BlendFactor.SRC_ALPHA;
    blendState.dstRGB = BlendFactor.ONE_MINUS_SRC_ALPHA;
    blendState.srcAlpha = BlendFactor.ONE;
    blendState.dstAlpha = BlendFactor.ONE_MINUS_SRC_ALPHA;

    return new Pass({ shader: shaderLib.getShader(primitive), depthStencilState, blendState })
})()

export class StrokeRenderer extends BoundedRenderer {
    private readonly _stroke = new Stroke();

    public get bounds(): Readonly<AABB3D> {
        return this._stroke.mesh.bounds;
    }

    protected createModel(): Model | null {
        return new Model(this.node, this._stroke.mesh, [{ passes: [pass] }]);
    }

    line(from: Readonly<Vec3>, to: Readonly<Vec3>, color: Readonly<Vec4>) {
        this._stroke.line(from, to, color);
    }

    aabb(aabb: Readonly<AABB3D>, color: Readonly<Vec4>) {
        this._stroke.aabb(aabb, color);
    }

    frustum(frustum: Readonly<frustum.Vertices>, color: Readonly<Vec4>) {
        this._stroke.frustum(frustum, color);
    }

    override upload(commandBuffer: CommandBuffer): void {
        this._stroke.upload(commandBuffer);
    }

    clear() {
        // this._vertexMin = vec3.create(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        // this._vertexMax = vec3.create(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

        // aabb3d.set(this._bounds, 0, 0, 0, 0, 0, 0);

        this._stroke.clear();
    }
}